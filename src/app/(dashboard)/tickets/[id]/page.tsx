import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Card } from "@heroui/react";
import { getSession } from "@/lib/auth";
import { getTicketById } from "@/lib/db/tickets";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { formatDate, formatDateTime, formatTicketNumber, timeAgo } from "@/lib/utils";
import TicketActions from "./TicketActions";
import { canManageTickets, dashboardForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const { ticket, comments } = await getTicketById(id);

  if (!ticket) notFound();

  if (
    (session.role === "STUDENT" && ticket.student_id !== session.userId) ||
    (session.role === "STAFF" && ticket.department_id !== session.departmentId)
  ) {
    redirect(dashboardForRole(session.role));
  }

  const canManage = canManageTickets(session.role);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* Back button */}
      <div>
        <Link
          href={dashboardForRole(session.role)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-link hover:underline"
        >
          &larr; Back to{" "}
          {session.role === "ADMIN"
            ? "Admin Console"
            : session.role === "STAFF"
              ? "Department Queue"
              : "Dashboard"}
        </Link>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]">
        {/* Ticket summary */}
        <Card className="border border-border bg-surface p-5 shadow-surface sm:p-6">
          <Card.Header className="flex flex-col justify-between gap-3 border-b border-border p-0 pb-4 sm:flex-row sm:items-start">
          <div>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="rounded-md border border-border bg-surface-secondary px-2 py-0.5 font-mono text-xs font-semibold text-muted">
                {formatTicketNumber(ticket.ticket_number)}
              </span>
              <span className="text-xs text-muted">
                {ticket.department_name}
              </span>
            </div>
            <Card.Title className="text-xl font-bold text-foreground sm:text-2xl">
              {ticket.title}
            </Card.Title>
            <Card.Description className="mt-1 text-sm text-muted">
              Reported by{" "}
              <span className="font-semibold text-foreground">
                {ticket.student_name}
              </span>{" "}
              ({ticket.student_email})
            </Card.Description>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
          </Card.Header>

          <Card.Content className="space-y-5 p-0 pt-5">
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
              Detailed Description
            </h3>
            <div className="rounded-lg border border-border bg-surface-secondary p-4">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {ticket.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-4 text-xs sm:grid-cols-4">
            <div>
              <span className="block text-muted">Category</span>
              <span className="text-sm font-semibold text-foreground">
                {ticket.category}
              </span>
            </div>
            <div>
              <span className="block text-muted">Department</span>
              <span className="text-sm font-semibold text-foreground">
                {ticket.department_code}
              </span>
            </div>
            <div>
              <span className="block text-muted">Created</span>
              <span
                className="text-sm font-semibold text-foreground block"
                title={formatDateTime(ticket.created_at)}
              >
                {formatDate(ticket.created_at)}
              </span>
              <span className="text-[11px] text-muted">
                {timeAgo(ticket.created_at)}
              </span>
            </div>
            <div>
              <span className="block text-muted">Last Modified</span>
              <span
                className="text-sm font-semibold text-foreground block"
                title={formatDateTime(ticket.updated_at)}
              >
                {formatDate(ticket.updated_at)}
              </span>
              <span className="text-[11px] text-muted">
                {timeAgo(ticket.updated_at)}
              </span>
            </div>
          </div>
          </Card.Content>
        </Card>

        {/* Keep staff actions in view beside the ticket on desktop. */}
        {canManage && (
          <div className="lg:sticky lg:top-24">
            <TicketActions ticketId={id} currentStatus={ticket.status} />
          </div>
        )}
      </div>

      <Card className="border border-border bg-surface shadow-surface">
        <Card.Header className="flex items-center justify-between border-b border-border bg-surface-secondary px-5 py-3 sm:px-6">
          <Card.Title className="text-base font-semibold text-foreground">
            Activity & Resolution Timeline
          </Card.Title>
          <span className="text-xs text-muted font-mono">
            {comments.length} events
          </span>
        </Card.Header>

        <Card.Content className="p-5 sm:p-6">
          {comments.length === 0 ? (
            <div className="text-center py-6 text-sm text-muted">
              No remarks or updates recorded yet.
            </div>
          ) : (
            <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6">
              {comments.map((c) => (
                <div key={c.id} className="relative">
                  <div className="absolute -left-7.75 top-1 h-3.5 w-3.5 rounded-full border-2 border-surface bg-accent" />
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {c.author_name}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-secondary text-muted font-mono border border-border">
                        {c.author_role}
                      </span>
                    </div>
                    <span className="text-xs text-muted">
                      {timeAgo(c.created_at)}
                    </span>
                  </div>
                  {c.status_change && (
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
                      <span>Updated status to:</span>
                      <StatusBadge status={c.status_change} />
                    </div>
                  )}
                  <div className="mt-2 text-sm text-foreground bg-surface-secondary/70 p-3.5 rounded-xl border border-border">
                    {c.comment}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
