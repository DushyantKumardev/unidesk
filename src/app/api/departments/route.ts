/**
 * GET /api/departments — returns all departments for dropdowns
 */

import { getDepartments } from "@/lib/db/departments";

export async function GET() {
  const departments = await getDepartments();
  return Response.json({ success: true, data: departments });
}
