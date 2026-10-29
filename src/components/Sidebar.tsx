import Link from "next/link";
import { Button } from "@heroui/react";
import type { SessionPayload } from "@/lib/types";
import { dashboardForRole } from "@/lib/rbac";
import { getTicketStats } from "@/lib/db/tickets";

export default async function Sidebar({ session }: { session: SessionPayload }) {
  const isStudent = session.role === "STUDENT";
  const dashboardHref = dashboardForRole(session.role);
  const stats = session.role === "ADMIN" ? await getTicketStats() : [];
  const countFor = (status: string) => Number(stats.find((item) => item.status === status)?.count ?? 0);

  const adminLinks = [
    { label: "Overview", href: "/admin" },
  ];

  return (
    <aside className="border-b border-border bg-surface-secondary/45 lg:min-h-[calc(100vh-4rem)] lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
      <nav className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:sticky lg:top-16 lg:block lg:px-3 lg:py-5">
        <p className="hidden px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted lg:block">
          Workspace
        </p>
        {session.role === "ADMIN" ? (
          <div className="flex gap-1 lg:block">
            {adminLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex shrink-0 items-center justify-between gap-5 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground lg:mb-1"
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        ) : (
          <Link
            href={dashboardHref}
            className="shrink-0 rounded-lg bg-surface px-3 py-2 text-sm font-semibold text-foreground shadow-xs lg:block"
          >
            {isStudent ? "Dashboard" : "Department Queue"}
          </Link>
        )}
        {isStudent && (
          <Link
            href="/student/new-ticket"
            className="shrink-0 lg:mt-2 lg:block"
          >
            <Button size="sm" variant="primary" className="w-full">
              + New Ticket
            </Button>
          </Link>
        )}
      </nav>
    </aside>
  );
}
