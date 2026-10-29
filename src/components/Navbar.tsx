"use client";

import Link from "next/link";
import { Button, Chip } from "@heroui/react";
import type { SessionPayload } from "@/lib/types";
import { dashboardForRole } from "../lib/rbac";

interface NavbarProps {
  session: SessionPayload;
}

export default function Navbar({ session }: NavbarProps) {
  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    // Replace history entry and force browser to reload login cleanly
    window.location.replace("/login");
  }

  const dashboardHref = dashboardForRole(session.role);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-y-3 px-4 py-3 sm:h-16 sm:flex-nowrap sm:gap-y-0 sm:px-6 sm:py-0">
        {/* Brand */}
        <Link href={dashboardHref} className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground font-bold shadow-xs">
            U
          </div>
          <div className="flex min-w-0 flex-col items-start">
            <span className="truncate text-lg font-bold leading-tight tracking-tight text-foreground">
              Uni<span className="text-accent">Desk</span>
            </span>
            <Chip
              size="sm"
              variant="soft"
              color="accent"
              className="mt-0.5 px-1.5 text-[10px] font-semibold leading-4"
            >
              {session.role}
            </Chip>
          </div>
        </Link>

        {session.role === "ADMIN" && (
          <div className="hidden min-w-0 flex-1 items-center gap-5 px-8 lg:flex">
            <div className="min-w-max">
              <p className="text-sm font-semibold text-foreground">Admin Overview</p>
              <p className="text-xs text-muted">Campus grievance operations</p>
            </div>
            <form action="/admin" method="GET" className="ml-auto w-full max-w-sm">
              <input
                name="q"
                type="search"
                placeholder="Search grievances..."
                aria-label="Search grievances"
                className="w-full rounded-lg border border-field-border bg-field px-3 py-2 text-sm text-field-foreground outline-none transition focus:ring-2 focus:ring-focus"
              />
            </form>
          </div>
        )}

        {/* User + Logout */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-foreground leading-none">
              {session.name}
            </p>
            <p className="text-xs text-muted leading-tight mt-1">
              {session.email}
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="shrink-0"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
