/**
 * GET   /api/tickets/[id] — get ticket detail with comments
 * PATCH /api/tickets/[id] — update ticket status (staff/admin)
 */

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import {
  getTicketById,
  updateTicketStatus,
  addTicketComment,
} from "@/lib/db/tickets";
import type { TicketStatus } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return Response.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );

  const { id } = await params;
  const { ticket, comments } = await getTicketById(id);

  if (!ticket)
    return Response.json(
      { success: false, error: "Ticket not found." },
      { status: 404 },
    );

  if (
    (session.role === "STUDENT" && ticket.student_id !== session.userId) ||
    (session.role === "STAFF" && ticket.department_id !== session.departmentId)
  ) {
    return Response.json(
      { success: false, error: "Forbidden." },
      { status: 403 },
    );
  }

  return Response.json({ success: true, data: { ticket, comments } });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session || (session.role !== "STAFF" && session.role !== "ADMIN")) {
    return Response.json(
      { success: false, error: "Only staff/admin can update tickets." },
      { status: 403 },
    );
  }

  const { id } = await params;
  const { ticket } = await getTicketById(id);
  if (!ticket)
    return Response.json(
      { success: false, error: "Ticket not found." },
      { status: 404 },
    );
  if (
    session.role === "STAFF" &&
    ticket.department_id !== session.departmentId
  ) {
    return Response.json(
      { success: false, error: "Forbidden." },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { status, comment } = body as {
    status?: TicketStatus;
    comment?: string;
  };

  if (!status)
    return Response.json(
      { success: false, error: "Status is required." },
      { status: 400 },
    );

  await updateTicketStatus(id, status);

  if (comment?.trim()) {
    await addTicketComment({
      id: randomUUID(),
      ticketId: id,
      authorId: session.userId,
      comment: comment.trim(),
      statusChange: status,
    });
  }

  return Response.json({ success: true, message: "Ticket updated." });
}
