/**
 * Auth helper functions — JWT signing/verifying and password hashing.
 * Uses `jose` for JWTs (Edge-runtime compatible) and `bcryptjs` for passwords.
 */

import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { SessionPayload } from "./types";
import { AUTH_COOKIE_NAME } from "./constants";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "fallback-dev-secret"
);

/** Hashes a plain-text password. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Compares a plain-text password to a stored hash. */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Creates a signed JWT token from a session payload. */
export async function createToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/** Verifies and decodes a JWT token. Returns null if invalid/expired. */
export async function verifyToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Reads and verifies the session cookie from the current request. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

