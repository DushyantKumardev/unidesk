/**
 * GET /api/auth/me
 * Returns the currently logged-in user from the session cookie.
 */

import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ success: false, error: "Not authenticated." }, { status: 401 });
  }
  return Response.json({ success: true, data: session });
}

