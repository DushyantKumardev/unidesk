/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */

import { AUTH_COOKIE_NAME } from "@/lib/constants";

export async function POST() {
  const res = Response.json({ success: true });
  res.headers.set(
    "Set-Cookie",
    `${AUTH_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`
  );
  return res;
}
