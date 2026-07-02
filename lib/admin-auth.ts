import { createHmac, timingSafeEqual } from "crypto";

// Simple single-admin auth: the ADMIN_PASSWORD env var is the credential.
// A successful login sets an httpOnly cookie holding an HMAC derived from it,
// so rotating the password invalidates every existing session.

export const ADMIN_COOKIE = "alpha_admin";
export const ADMIN_SESSION_DAYS = 30;

function secret(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function adminToken(): string {
  return createHmac("sha256", secret()).update("alpha-reset-admin-v1").digest("hex");
}

export function verifyAdminPassword(password: string): boolean {
  return Boolean(secret()) && safeEqual(password, secret());
}

export function isValidAdminToken(token: string | undefined | null): boolean {
  return Boolean(token) && Boolean(secret()) && safeEqual(token!, adminToken());
}
