/**
 * POST /api/tickets/[id]/comments — add a comment (students + staff)
 */

import { NextRequest } from "next/server";
import { randomUUID } from "crypto";
import { getSession } from "@/lib/auth";
import { addTicketComment, getTicketById } from "@/lib/db/tickets";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return Response.json(
      { success: false, error: "Unauthorized." },
      { status: 401 },
    );

  const { id } = await params;
  const { ticket } = await getTicketById(id);
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

  const body = await req.json();
  const { comment } = body as { comment?: string };
  if (!comment?.trim())
    return Response.json(
      { success: false, error: "Comment cannot be empty." },
      { status: 400 },
    );

  await addTicketComment({
    id: randomUUID(),
    ticketId: id,
    authorId: session.userId,
    comment: comment.trim(),
  });

  return Response.json(
    { success: true, message: "Comment added." },
    { status: 201 },
  );
}
