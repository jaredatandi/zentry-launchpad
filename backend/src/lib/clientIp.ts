import type { Request } from "express";

/**
 * Trust only Express's `req.ip`, which uses X-Forwarded-For solely when
 * `trust proxy` was explicitly configured for a known reverse proxy.
 * Reading the header directly lets a client forge a fresh rate-limit bucket.
 */
export function clientIp(req: Request): string {
  return req.ip || req.socket?.remoteAddress || "unknown";
}
