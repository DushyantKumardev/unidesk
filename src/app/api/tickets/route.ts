/**
 * GET  /api/tickets — list tickets (filtered by role)
 * POST /api/tickets — create a new ticket (students only)
 */

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { getTickets, createTicket } from "@/lib/db/tickets";
import { getDepartmentById } from "@/lib/db/departments";
import type { Priority } from "@/lib/types";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return Response.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );

  const { searchParams } = req.nextUrl;

  // Students see their own tickets; staff are scoped to their department.
  const filters = {
    studentId:
      session.role === "STUDENT"
        ? session.userId
        : (searchParams.get("studentId") ?? undefined),
    departmentId:
      session.role === "STAFF"
        ? (session.departmentId ?? "__unassigned__")
        : (searchParams.get("departmentId") ?? undefined),
    status: (searchParams.get("status") as never) ?? undefined,
    priority: (searchParams.get("priority") as never) ?? undefined,
  };

  const tickets = await getTickets(filters);
  return Response.json({ success: true, data: tickets });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    return Response.json(
      { success: false, error: "Only students can submit tickets." },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { title, description, category, priority, departmentId } = body as {
    title?: string;
    description?: string;
    category?: string;
    priority?: Priority;
    departmentId?: string;
  };

  if (
    !title?.trim() ||
    !description?.trim() ||
    !category ||
    !priority ||
    !departmentId
  ) {
    return Response.json(
      { success: false, error: "All fields are required." },
      { status: 400 },
    );
  }

  const dept = await getDepartmentById(departmentId);
  if (!dept) {
    return Response.json(
      { success: false, error: "Invalid department." },
      { status: 400 },
    );
  }

  await createTicket({
    id: randomUUID(),
    title: title.trim(),
    description: description.trim(),
    category,
    priority,
    studentId: session.userId,
    departmentId,
  });

  return Response.json(
    { success: true, message: "Ticket submitted successfully." },
    { status: 201 },
  );
}
