/**
 * Raw SQL queries for the `departments` table.
 */

import { query } from "./mysql";

export interface Department {
  id: string;
  name: string;
  code: string;
}

/** Returns all departments ordered alphabetically — used in dropdowns. */
export async function getDepartments(): Promise<Department[]> {
  return query<Department>(
    `SELECT id, name, code
     FROM departments
     ORDER BY name ASC`
  );
}

/** Returns a single department by ID. */
export async function getDepartmentById(id: string): Promise<Department | null> {
  const rows = await query<Department>(
    `SELECT id, name, code FROM departments WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}
