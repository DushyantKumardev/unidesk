import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@heroui/react";
import { getSession } from "@/lib/auth";
import {
  getAttentionTickets,
  getDepartmentTicketStats,
  getDepartments,
  getTicketStats,
  getTickets,
} from "@/lib/db";
import { StatusBadge, PriorityBadge } from "@/components/Badges";
import { formatDate, formatDateTime, formatTicketNumber, timeAgo } from "@/lib/utils";
import { dashboardForRole } from "@/lib/rbac";
import { OVERDUE_DAYS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    departmentId?: string;
    priority?: string;
    q?: string;
  }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    redirect(session ? dashboardForRole(session.role) : "/login");
  }

  const filters = await searchParams;
  const [tickets, departments, statsRaw, departmentStats, attentionTickets] =
    await Promise.all([
      getTickets({
        status: (filters.status as never) || undefined,
        departmentId: filters.departmentId || undefined,
        priority: (filters.priority as never) || undefined,
        search: filters.q?.trim() || undefined,
      }),
      getDepartments(),
      getTicketStats(),
      getDepartmentTicketStats(),
      getAttentionTickets(OVERDUE_DAYS),
    ]);

  const statsMap = Object.fromEntries(
    statsRaw.map((stat) => [stat.status, Number(stat.count)]),
  );
  const total = Object.values(statsMap).reduce((sum, value) => sum + value, 0);
  const urgentCount = attentionTickets.filter((ticket) => ticket.priority === "URGENT").length;

  const kpis = [
    { label: "Total Grievances", value: total, tone: "text-foreground", href: "/admin" },
    { label: "Pending", value: statsMap.PENDING ?? 0, tone: "text-warning", href: "/admin?status=PENDING" },
    { label: "In Progress", value: statsMap.IN_PROGRESS ?? 0, tone: "text-accent", href: "/admin?status=IN_PROGRESS" },
    { label: "Resolved", value: statsMap.RESOLVED ?? 0, tone: "text-success", href: "/admin?status=RESOLVED" },
    { label: "Rejected", value: statsMap.REJECTED ?? 0, tone: "text-danger", href: "/admin?status=REJECTED" },
  ];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-3 border-b border-border pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Overview</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Grievance Operations
          </h1>
          <p className="mt-1 text-sm text-muted">A focused view of campus issues that need attention.</p>
        </div>
        
      </section>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {kpis.map((kpi) => (
          <Link key={kpi.label} href={kpi.href}>
            <Card className="h-full border border-border bg-surface p-4 transition hover:-translate-y-0.5 hover:shadow-surface">
              <Card.Description className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                {kpi.label}
              </Card.Description>
              <p className={`mt-2 text-2xl font-bold tracking-tight ${kpi.tone}`}>{kpi.value}</p>
            </Card>
          </Link>
        ))}
      </section>


      {attentionTickets.length>0 && <section className="rounded-xl border border-warning/30 bg-warning-soft/60 p-4" aria-labelledby="attention-heading">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 id="attention-heading" className="text-base font-semibold text-foreground">Needs attention</h2>
            <p className="text-xs text-muted">Urgent tickets or unresolved tickets older than {OVERDUE_DAYS} days.</p>
          </div>
          <span className="text-xs font-semibold text-warning">{urgentCount} urgent</span>
        </div>
        {attentionTickets.length > 0 && (
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {attentionTickets.slice(0, 4).map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="flex items-center justify-between gap-3 rounded-lg border border-warning/20 bg-surface px-3 py-2.5 text-sm transition hover:border-warning/50">
                <span className="min-w-0 truncate font-medium text-foreground">{ticket.title}</span>
                <span className="shrink-0 text-xs text-muted">{ticket.priority === "URGENT" ? "Urgent" : "Overdue"}</span>
              </Link>
            ))}
          </div>
        )}
      </section>}

      <section id="all-grievances" className="scroll-mt-24">
        <Card className="overflow-hidden border border-border bg-surface shadow-surface">
          <Card.Header className="border-b border-border bg-surface-secondary px-4 py-3 sm:px-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <Card.Title className="text-base font-semibold text-foreground">All Grievances</Card.Title>
                <Card.Description className="mt-0.5 text-xs text-muted">Browse, filter, and open tickets for management</Card.Description>
              </div>
              <span className="text-xs font-mono text-muted">{tickets.length} matching</span>
            </div>
          </Card.Header>
          <Card.Content className="p-4">
            <form method="GET" className="mb-4 flex flex-wrap items-center gap-2">
              <input name="q" defaultValue={filters.q ?? ""} placeholder="Search title, ticket, or student" className="min-w-52 flex-1 rounded-lg border border-field-border bg-field px-3 py-2 text-sm text-field-foreground outline-none focus:ring-2 focus:ring-focus" />
              <select name="status" defaultValue={filters.status ?? ""} className="rounded-lg border border-field-border bg-field px-3 py-2 text-sm text-field-foreground"><option value="">All statuses</option>{[["PENDING", "Pending"], ["IN_PROGRESS", "In Progress"], ["RESOLVED", "Resolved"], ["REJECTED", "Rejected"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select name="departmentId" defaultValue={filters.departmentId ?? ""} className="rounded-lg border border-field-border bg-field px-3 py-2 text-sm text-field-foreground"><option value="">All departments</option>{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}</select>
              <select name="priority" defaultValue={filters.priority ?? ""} className="rounded-lg border border-field-border bg-field px-3 py-2 text-sm text-field-foreground"><option value="">All priorities</option>{["LOW", "MEDIUM", "HIGH", "URGENT"].map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select>
              <button type="submit" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-accent-hover">Filter</button>
              <Link href="/admin#all-grievances" className="rounded-lg border border-border px-3 py-2 text-sm text-muted hover:bg-surface-hover">Reset</Link>
            </form>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-[11px] uppercase tracking-wider text-muted">
                  <tr>
                    {["Ticket", "Title", "Student", "Department", "Priority", "Status", "Created", "Updated", ""].map((heading) => (
                      <th key={heading} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="transition-colors hover:bg-surface-hover">
                      <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-muted">
                        {formatTicketNumber(ticket.ticket_number)}
                      </td>
                      <td
                        className="max-w-[12rem] sm:max-w-[16rem] truncate px-3 py-3 font-medium text-foreground"
                        title={ticket.title}
                      >
                        {ticket.title}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{ticket.student_name}</td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{ticket.department_name}</td>
                      <td className="whitespace-nowrap px-3 py-3"><PriorityBadge priority={ticket.priority} /></td>
                      <td className="whitespace-nowrap px-3 py-3"><StatusBadge status={ticket.status} /></td>
                      <td
                        className="whitespace-nowrap px-3 py-3 text-xs"
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
                        className="whitespace-nowrap px-3 py-3 text-xs"
                        title={formatDateTime(ticket.updated_at)}
                      >
                        <div className="font-medium text-foreground">
                          {formatDate(ticket.updated_at)}
                        </div>
                        <div className="text-[11px] text-muted">
                          {timeAgo(ticket.updated_at)}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        <Link href={`/tickets/${ticket.id}`} className="font-medium text-link hover:underline">
                          Manage &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Content>
        </Card>
      </section>

      <section id="settings" className="sr-only" aria-label="Settings">Settings are not configured for this MVP.</section>
    </div>
  );
}
