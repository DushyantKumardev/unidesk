/**
 * Raw SQL queries for the `tickets` and `ticket_comments` tables.
 */

import { query, execute } from "./mysql";
import type { ExecuteValues } from "mysql2/promise";
import type { Priority, TicketStatus } from "@/lib/types";

export interface TicketRow {
  id: string;
  ticket_number: number;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: TicketStatus;
  student_id: string;
  student_name: string;
  student_email: string;
  department_id: string;
  department_name: string;
  department_code: string;
  created_at: Date;
  updated_at: Date;
}

export interface CommentRow {
  id: string;
  ticket_id: string;
  author_id: string;
  author_name: string;
  author_role: string;
  comment: string;
  status_change: TicketStatus | null;
  created_at: Date;
}

export interface DepartmentTicketStat {
  department_id: string;
  department_name: string;
  department_code: string;
  count: number;
}

/**
 * Fetches all tickets with optional filters.
 * Joins users and departments to avoid N+1 queries.
 */
export async function getTickets(filters?: {
  studentId?: string;
  departmentId?: string;
  status?: TicketStatus;
  priority?: Priority;
  search?: string;
}): Promise<TicketRow[]> {
  const conditions: string[] = [];
  const values: ExecuteValues = [];

  if (filters?.studentId) {
    conditions.push("t.student_id = ?");
    values.push(filters.studentId);
  }
  if (filters?.departmentId) {
    conditions.push("t.department_id = ?");
    values.push(filters.departmentId);
  }
  if (filters?.status) {
    conditions.push("t.status = ?");
    values.push(filters.status);
  }
  if (filters?.priority) {
    conditions.push("t.priority = ?");
    values.push(filters.priority);
  }
  if (filters?.search) {
    conditions.push("(t.title LIKE ? OR CAST(t.ticket_number AS CHAR) LIKE ? OR u.name LIKE ?)");
    const search = `%${filters.search}%`;
    values.push(search, search, search);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  return query<TicketRow>(
    `SELECT
       t.id, t.ticket_number, t.title, t.description, t.category,
       t.priority, t.status,
       t.student_id,    u.name  AS student_name,  u.email AS student_email,
       t.department_id, d.name  AS department_name, d.code AS department_code,
       t.created_at, t.updated_at
     FROM tickets t
     JOIN users       u ON u.id = t.student_id
     JOIN departments d ON d.id = t.department_id
     ${where}
     ORDER BY t.created_at DESC`,
    values
  );
}

/**
 * Fetches a single ticket by ID plus all its comments.
 */
export async function getTicketById(
  id: string
): Promise<{ ticket: TicketRow | null; comments: CommentRow[] }> {
  const tickets = await query<TicketRow>(
    `SELECT
       t.id, t.ticket_number, t.title, t.description, t.category,
       t.priority, t.status,
       t.student_id,    u.name  AS student_name,  u.email AS student_email,
       t.department_id, d.name  AS department_name, d.code AS department_code,
       t.created_at, t.updated_at
     FROM tickets t
     JOIN users       u ON u.id = t.student_id
     JOIN departments d ON d.id = t.department_id
     WHERE t.id = ?
     LIMIT 1`,
    [id]
  );

  const comments = await query<CommentRow>(
    `SELECT
       tc.id, tc.ticket_id, tc.author_id, u.name AS author_name,
       u.role AS author_role, tc.comment, tc.status_change, tc.created_at
     FROM ticket_comments tc
     JOIN users u ON u.id = tc.author_id
     WHERE tc.ticket_id = ?
     ORDER BY tc.created_at ASC`,
    [id]
  );

  return { ticket: tickets[0] ?? null, comments };
}

/** Inserts a new ticket row. */
export async function createTicket(data: {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  studentId: string;
  departmentId: string;
}): Promise<void> {
  const { id, title, description, category, priority, studentId, departmentId } = data;

  await execute(
    `INSERT INTO tickets (id, title, description, category, priority, student_id, department_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, title, description, category, priority, studentId, departmentId]
  );
}

/**
 * Updates the status of a ticket and refreshes its last-updated timestamp.
 *
 * @param ticketId - The UUID of the ticket to update
 * @param status - The new ticket status
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus
): Promise<void> {
  await execute(
    `UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [status, ticketId]
  );
}

/**
 * Inserts a comment or timeline event entry into `ticket_comments`
 * and touches the parent ticket's `updated_at` timestamp.
 *
 * @param data - The comment payload including author, text, and optional status change
 */
export async function addTicketComment(data: {
  id: string;
  ticketId: string;
  authorId: string;
  comment: string;
  statusChange?: TicketStatus | null;
}): Promise<void> {
  const { id, ticketId, authorId, comment, statusChange = null } = data;

  await execute(
    `INSERT INTO ticket_comments (id, ticket_id, author_id, comment, status_change)
     VALUES (?, ?, ?, ?, ?)`,
    [id, ticketId, authorId, comment, statusChange]
  );

  await execute(
    `UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [ticketId]
  );
}

/** Returns ticket counts grouped by status — for dashboard KPI cards. */
export async function getTicketStats(
  departmentId?: string
): Promise<{ status: TicketStatus; count: number }[]> {
  const values: ExecuteValues = [];
  const where = departmentId
    ? (values.push(departmentId), "WHERE department_id = ?")
    : "";

  return query<{ status: TicketStatus; count: number }>(
    `SELECT status, COUNT(*) AS count
     FROM tickets
     ${where}
     GROUP BY status`,
    values
  );
}

/** Returns ticket totals grouped by department for the admin overview. */
export async function getDepartmentTicketStats(): Promise<DepartmentTicketStat[]> {
  return query<DepartmentTicketStat>(
    `SELECT d.id AS department_id, d.name AS department_name,
            d.code AS department_code, COUNT(t.id) AS count
     FROM departments d
     LEFT JOIN tickets t ON t.department_id = d.id
     GROUP BY d.id, d.name, d.code
     ORDER BY count DESC, d.name ASC`,
  );
}

/** Returns unresolved urgent tickets and unresolved tickets older than the SLA threshold. */
export async function getAttentionTickets(overdueDays: number): Promise<TicketRow[]> {
  const ageDays = Math.max(1, Math.floor(overdueDays));

  return query<TicketRow>(
    `SELECT
       t.id, t.ticket_number, t.title, t.description, t.category,
       t.priority, t.status,
       t.student_id, u.name AS student_name, u.email AS student_email,
       t.department_id, d.name AS department_name, d.code AS department_code,
       t.created_at, t.updated_at
     FROM tickets t
     JOIN users u ON u.id = t.student_id
     JOIN departments d ON d.id = t.department_id
     WHERE t.status IN ('PENDING', 'IN_PROGRESS')
       AND (t.priority = 'URGENT' OR t.created_at < CURRENT_TIMESTAMP - INTERVAL ${ageDays} DAY)
     ORDER BY t.priority = 'URGENT' DESC, t.created_at ASC
     LIMIT 8`,
  );
}
