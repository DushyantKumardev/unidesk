import Link from "next/link";
import { redirect } from "next/navigation";
import { Button, Card } from "@heroui/react";
import { getSession } from "@/lib/auth";
import { getTickets } from "@/lib/db/tickets";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { formatDate, formatDateTime, formatTicketNumber, timeAgo } from "@/lib/utils";
import { dashboardForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT")
    redirect(session ? dashboardForRole(session.role) : "/login");

  const tickets = await getTickets({ studentId: session.userId });

  const myStats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "PENDING").length,
    inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
    resolved: tickets.filter((t) => t.status === "RESOLVED").length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Student Grievance Portal
          </h1>
          <p className="mt-1 text-sm text-muted">
            Track and manage your submitted campus issues in real time.
          </p>
        </div>
        <Link href="/student/new-ticket">
          <Button variant="primary" size="md">
            + New Ticket
          </Button>
        </Link>
      </div>

      {/* HeroUI Cards for KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total Lodged",
            value: myStats.total,
            accent: "border-border bg-surface",
          },
          {
            label: "Pending Review",
            value: myStats.pending,
            accent:
              "border-warning/30 bg-warning-soft text-warning-soft-foreground",
          },
          {
            label: "In Progress",
            value: myStats.inProgress,
            accent:
              "border-accent/30 bg-accent-soft text-accent-soft-foreground",
          },
          {
            label: "Resolved",
            value: myStats.resolved,
            accent:
              "border-success/30 bg-success-soft text-success-soft-foreground",
          },
        ].map(({ label, value, accent }) => (
          <Card
            key={label}
            className={`p-4 transition-shadow hover:shadow-surface ${accent}`}
          >
            <Card.Header className="p-0 pb-0.5">
              <Card.Description className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {label}
              </Card.Description>
            </Card.Header>
            <Card.Content className="p-0">
              <p className="text-2xl font-bold tracking-tight">{value}</p>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Grievance Feed / Table */}
      <Card className="overflow-hidden border border-border bg-surface shadow-surface">
        <Card.Header className="border-b border-border bg-surface-secondary px-6 py-4 flex items-center justify-between">
          <Card.Title className="text-base font-semibold text-foreground">
            Your Grievance History
          </Card.Title>
          <span className="text-xs text-muted font-mono">
            {tickets.length} total
          </span>
        </Card.Header>
        <Card.Content className="p-0">
          {tickets.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent-soft-foreground text-xl mb-3">
                📋
              </div>
              <p className="text-base font-medium text-foreground">
                No grievances submitted yet
              </p>
              <p className="text-sm text-muted mt-1">
                Have an issue in labs, library, or hostel? Report it to get it
                fixed.
              </p>
              <Link href="/student/new-ticket" className="inline-block mt-4">
                <Button variant="secondary">Submit Grievance</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-secondary/50 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Ticket #</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Department</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Priority</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Created</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Updated</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium text-right">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="transition-colors hover:bg-surface-hover"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                        {formatTicketNumber(ticket.ticket_number)}
                      </td>
                      <td
                        className="max-w-[14rem] sm:max-w-[18rem] truncate px-4 py-3 font-medium text-foreground"
                        title={ticket.title}
                      >
                        {ticket.title}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">
                        {ticket.department_name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-3 text-xs"
                        title={formatDateTime(ticket.created_at)}
                      >
                        <div className="font-medium text-foreground">
                          {formatDate(ticket.created_at)}
                        </div>
                        <div className="text-[11px] text-muted">
                          {timeAgo(ticket.created_at)}
                        </div>
                      </td>
                      <td
                        className="whitespace-nowrap px-4 py-3 text-xs"
                        title={formatDateTime(ticket.updated_at)}
                      >
                        <div className="font-medium text-foreground">
                          {formatDate(ticket.updated_at)}
                        </div>
                        <div className="text-[11px] text-muted">
                          {timeAgo(ticket.updated_at)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          href={`/tickets/${ticket.id}`}
                          className="inline-flex items-center gap-1 font-medium text-link hover:underline"
                        >
                          View &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
