/**
 * Shared TypeScript types for UniDesk.
 * These are plain types — no ORM dependency.
 */

export type Role = "STUDENT" | "STAFF" | "ADMIN";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

/** Safe user object returned from the DB — never exposes the password hash. */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId: string | null;
  createdAt: Date;
}

/** JWT session payload stored in the auth cookie. */
export interface SessionPayload {
  userId: string;
  role: Role;
  name: string;
  email: string;
  departmentId: string | null;
}

/** Standard API response wrapper used by all route handlers. */
export interface ApiResponse<T = null> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
