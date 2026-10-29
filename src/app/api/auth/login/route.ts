/**
 * POST /api/auth/login
 * Validates credentials and issues a session cookie.
 */

import { NextRequest } from "next/server";
import { getUserByEmail } from "@/lib/db/users";
import { comparePassword, createToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as { email?: string; password?: string };

    if (!email?.trim() || !password) {
      return Response.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return Response.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return Response.json(
        { success: false, error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const token = await createToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      departmentId: user.department_id,
    });

    const res = Response.json({
      success: true,
      data: { id: user.id, name: user.name, role: user.role },
    });
    res.headers.set(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`
    );
    return res;
  } catch (err) {
    console.error("[login]", err);
    return Response.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
