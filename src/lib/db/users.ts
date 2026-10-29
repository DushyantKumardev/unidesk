/**
 * Raw SQL queries for the `users` table.
 */

import { query, execute } from "./mysql";
import type { SafeUser } from "@/lib/types";

/** Full user row including hashed password — only used during login. */
export interface UserRow {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "STUDENT" | "STAFF" | "ADMIN";
  department_id: string | null;
  created_at: Date;
  updated_at: Date;
}

/** Finds a user by email — returns the password hash for login verification. */
export async function getUserByEmail(email: string): Promise<UserRow | null> {
  const rows = await query<UserRow>(
    `SELECT id, name, email, password, role, department_id, created_at, updated_at
     FROM users
     WHERE email = ?
     LIMIT 1`,
    [email]
  );
  return rows[0] ?? null;
}

/** Finds a safe user (no password) by ID — used for session checks. */
export async function getUserById(id: string): Promise<SafeUser | null> {
  const rows = await query<SafeUser>(
    `SELECT id, name, email, role, department_id AS departmentId, created_at AS createdAt
     FROM users
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

/** Checks whether an email is already registered. */
export async function emailExists(email: string): Promise<boolean> {
  const rows = await query<{ count: number }>(
    `SELECT COUNT(*) AS count FROM users WHERE email = ?`,
    [email]
  );
  return rows[0].count > 0;
}

/**
 * Inserts a new user row.
 * The password must already be hashed before calling this function.
 */
export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  password: string;
  role?: "STUDENT" | "STAFF" | "ADMIN";
  departmentId?: string | null;
}): Promise<SafeUser> {
  const { id, name, email, password, role = "STUDENT", departmentId = null } = data;

  await execute(
    `INSERT INTO users (id, name, email, password, role, department_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, name, email, password, role, departmentId]
  );

  return { id, name, email, role, departmentId, createdAt: new Date() };
}
