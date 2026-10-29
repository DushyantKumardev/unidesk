/**
 * POST /api/auth/register
 * Creates a new student account and sets an auth cookie.
 */

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getUserByEmail, createUser } from "@/lib/db/users";
import { getActiveStudentRecordByEmail } from "@/lib/db/student-records";
import { execute } from "@/lib/db/mysql";
import { hashPassword, createToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body as {
      email?: string;
      password?: string;
    };

    const normalizedEmail = email?.toLowerCase().trim();

    // ── Validation ──────────────────────────────────────────
    if (!normalizedEmail || !password) {
      return Response.json(
        {
          success: false,
          error: "University email and password are required.",
        },
        { status: 400 },
      );
    }
    if (password.length < 6) {
      return Response.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const studentRecord = await getActiveStudentRecordByEmail(normalizedEmail);
    if (!studentRecord) {
      return Response.json(
        {
          success: false,
          error: "This university email is not present in the student records.",
        },
        { status: 403 },
      );
    }
    if (studentRecord.user_id) {
      return Response.json(
        {
          success: false,
          error: "An account with this university email already exists.",
        },
        { status: 409 },
      );
    }

    const existing = await getUserByEmail(normalizedEmail);
    if (existing) {
      return Response.json(
        { success: false, error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // ── Create user ──────────────────────────────────────────
    const hashed = await hashPassword(password);
    const user = await createUser({
      id: randomUUID(),
      name: studentRecord.full_name,
      email: normalizedEmail,
      password: hashed,
      role: "STUDENT",
      departmentId: studentRecord.department_id,
    });

    await execute(`UPDATE student_records SET user_id = ? WHERE id = ?`, [
      user.id,
      studentRecord.id,
    ]);

    // ── Issue JWT cookie ─────────────────────────────────────
    const token = await createToken({
      userId: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      departmentId: user.departmentId,
    });

    const res = Response.json(
      {
        success: true,
        data: { id: user.id, name: user.name, role: user.role },
      },
      { status: 201 },
    );
    res.headers.set(
      "Set-Cookie",
      `${AUTH_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${7 * 24 * 3600}; SameSite=Lax`,
    );
    return res;
  } catch (err) {
    console.error("[register]", err);
    return Response.json(
      { success: false, error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
