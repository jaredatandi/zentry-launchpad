import { randomUUID } from "node:crypto";
import bcrypt from "bcrypt";
import { decodeJwt, SignJWT, jwtVerify } from "jose";
import type { NextFunction, Response } from "express";
import { SESSION_COOKIE } from "./config";
import type { AuthedRequest } from "./types";

const SALT_ROUNDS = 12;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Revoked session IDs, kept until their original expiry. In-memory by design:
 *  a server restart invalidates sessions anyway because the cookie is signed. */
const revokedJtis = new Map<string, number>();

function pruneRevoked(): void {
  const now = Date.now();
  for (const [jti, expiresAt] of revokedJtis) {
    if (expiresAt <= now) revokedJtis.delete(jti);
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

function secretBytes(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

export async function signSession(email: string, secret: string): Promise<string> {
  return new SignJWT({ sub: email.toLowerCase() })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setJti(randomUUID())
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(secretBytes(secret));
}

export async function verifySession(token: string, secret: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secretBytes(secret), {
      algorithms: ["HS256"],
    });
    if (payload.jti && revokedJtis.has(payload.jti)) return null;
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Called on sign-out so a copied cookie cannot be replayed. */
export function revokeSession(token: string): void {
  try {
    const payload = decodeJwt(token);
    pruneRevoked();
    if (payload.jti && payload.exp) revokedJtis.set(payload.jti, payload.exp * 1000);
  } catch {
    // An invalid token needs no revocation.
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!header) return result;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index < 0) continue;
    const key = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    // Session cookies are base64url JWTs; decoding here let a malformed "%"
    // throw an URIError and crash the process. Never decode untrusted cookies.
    if (key) result[key] = value;
  }
  return result;
}

export function requireAuth(secret: string, adminEmail: string) {
  return async (req: AuthedRequest, res: Response, next: NextFunction): Promise<void> => {
    const token = parseCookies(req.headers.cookie)[SESSION_COOKIE];
    const subject = token ? await verifySession(token, secret) : null;
    if (!subject || subject !== adminEmail.toLowerCase()) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }
    req.admin = { email: subject };
    next();
  };
}

export function sessionCookieOptions(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: MAX_AGE_SECONDS * 1000,
  };
}

export { MAX_AGE_SECONDS };
