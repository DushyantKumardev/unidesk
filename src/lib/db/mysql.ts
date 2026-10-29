/**
 * MySQL connection pool using raw `mysql2` driver.
 * Every query in the app goes through this pool — no ORM.
 */

import mysql, { type ExecuteValues, type ResultSetHeader } from "mysql2/promise";

/** Singleton pool — reused across Next.js hot reloads in dev. */
const globalForDb = globalThis as unknown as { pool: mysql.Pool | undefined };

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    host:     process.env.DB_HOST     ?? "localhost",
    port:     Number(process.env.DB_PORT ?? 3306),
    user:     process.env.DB_USER     ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME     ?? "unidesk_db",
    waitForConnections: true,
    connectionLimit: 10,
    timezone: process.env.DB_TIMEZONE ?? "local",
  });

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

/**
 * Runs a SELECT query and returns typed rows.
 *
 * @example
 * const rows = await query<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  values?: ExecuteValues
): Promise<T[]> {
  const [rows] = await pool.execute(sql, values);
  return rows as T[];
}

/**
 * Runs an INSERT / UPDATE / DELETE query and returns result metadata
 * (e.g. `insertId`, `affectedRows`).
 */
export async function execute(
  sql: string,
  values?: ExecuteValues
): Promise<ResultSetHeader> {
  const [result] = await pool.execute(sql, values);
  return result as ResultSetHeader;
}
