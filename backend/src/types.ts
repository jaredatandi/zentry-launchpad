import type { Request } from "express";

export interface AdminIdentity {
  email: string;
}

export interface AuthedRequest extends Request {
  admin?: AdminIdentity;
}
