import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@heroui/react";
import { getSession } from "@/lib/auth";
import { getTickets, getTicketStats } from "@/lib/db/tickets";
import { getDepartments } from "@/lib/db/departments";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { formatDate, formatDateTime, formatTicketNumber, timeAgo } from "@/lib/utils";
import { dashboardForRole } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function StaffDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "STAFF")
    redirect(session ? dashboardForRole(session.role) : "/login");

  const filters = await searchParams;
  const departmentId = session.departmentId;
  const department = departmentId
    ? (await getDepartments()).find((item) => item.id === departmentId)
    : undefined;

  const [tickets, statsRaw] = await Promise.all([
    getTickets({
      departmentId: departmentId ?? "__unassigned__",
      status: (filters.status as never) || undefined,
      priority: (filters.priority as never) || undefined,
    }),
    getTicketStats(departmentId ?? "__unassigned__"),
  ]);

  const statsMap = Object.fromEntries(
    statsRaw.map((stat) => [stat.status, Number(stat.count)]),
  );
  const total = Object.values(statsMap).reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-4">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-accent">
          Staff Workspace
        </p>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Department Queue
        </h1>
        <p className="mt-1 text-sm text-muted">
          Review and resolve issues assigned to{" "}
          {department?.name ?? "your department"}.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          {
            label: "Department Total",
            value: total,
            accent: "border-border bg-surface text-foreground",
          },
          {
            label: "Pending",
            value: statsMap.PENDING ?? 0,
            accent:
              "border-warning/30 bg-warning-soft text-warning-soft-foreground",
          },
          {
            label: "In Progress",
            value: statsMap.IN_PROGRESS ?? 0,
            accent:
              "border-accent/30 bg-accent-soft text-accent-soft-foreground",
          },
          {
            label: "Resolved",
            value: statsMap.RESOLVED ?? 0,
            accent:
              "border-success/30 bg-success-soft text-success-soft-foreground",
          },
          {
            label: "Rejected",
            value: statsMap.REJECTED ?? 0,
            accent:
              "border-danger/30 bg-danger-soft text-danger-soft-foreground",
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

      <Card className="border border-border bg-surface p-3 shadow-surface">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <select
            name="status"
            defaultValue={filters.status ?? ""}
            className="rounded-lg border border-field-border bg-field px-3.5 py-2 text-sm text-field-foreground shadow-field focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <option value="">All Statuses</option>
            {["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"].map(
              (status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ")}
                </option>
              ),
            )}
          </select>
          <select
            name="priority"
            defaultValue={filters.priority ?? ""}
            className="rounded-lg border border-field-border bg-field px-3.5 py-2 text-sm text-field-foreground shadow-field focus:outline-none focus:ring-2 focus:ring-focus"
          >
            <option value="">All Priorities</option>
            {["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground shadow-xs transition-colors hover:bg-accent-hover"
          >
            Apply Filters
          </button>
          <Link
            href="/staff"
            className="rounded-lg border border-border bg-surface-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-hover"
          >
            Reset
          </Link>
        </form>
      </Card>

      <Card className="overflow-hidden border border-border bg-surface shadow-surface">
        <Card.Header className="flex items-center justify-between border-b border-border bg-surface-secondary px-4 py-3">
          <div>
            <Card.Title className="text-base font-semibold text-foreground">
              Department Tickets
            </Card.Title>
            <Card.Description className="mt-0.5 text-xs text-muted">
              Only your assigned department is shown
            </Card.Description>
          </div>
          <span className="text-xs font-mono text-muted">
            {tickets.length} matching
          </span>
        </Card.Header>
        <Card.Content className="p-0">
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-muted">
              No tickets match your department filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface-secondary/50 text-xs uppercase tracking-wider text-muted">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Ticket #</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="whitespace-nowrap px-4 py-3 font-medium">Student</th>
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
                        {ticket.student_name}
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
                          Manage &rarr;
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
