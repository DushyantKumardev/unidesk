import Link from "next/link";
import { Button } from "@heroui/react";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      {/* Hero */}
      <div className="max-w-2xl space-y-6">
        <div className="inline-block rounded-full border border-border bg-surface px-4 py-1 text-sm text-muted shadow-xs">
          Smart Campus Grievance System
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
          Uni<span className="text-accent">Desk</span>
        </h1>
        <p className="text-lg text-muted">
          Report campus issues, track resolutions, and hold departments accountable
          — all in one clean place.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link href="/login">
            <Button variant="primary" size="lg">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button variant="secondary" size="lg">Register as Student</Button>
          </Link>
        </div>
      </div>

      {/* Feature grid */}
      <div className="mt-16 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
        {[
          { icon: "📝", title: "Submit Issues", desc: "Report infrastructure, lab, library, or hostel problems in seconds." },
          { icon: "🔍", title: "Track Status", desc: "Know exactly where your ticket stands — Pending, In Progress, or Resolved." },
          { icon: "🏛️", title: "Department Routing", desc: "Issues go to the right department automatically, ensuring fast resolution." },
        ].map(({ icon, title, desc }) => (
          <div key={title} className="rounded-2xl border border-border bg-surface p-6 text-left shadow-surface">
            <p className="text-3xl">{icon}</p>
            <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 rounded-xl bg-surface-secondary border border-border px-5 py-2.5 text-xs text-muted">
        Demo Accounts: <span className="font-mono text-foreground">admin@unidesk.edu</span> / <span className="font-mono text-foreground">Admin@1234</span> &nbsp;|&nbsp; <span className="font-mono text-foreground">student@unidesk.edu</span> / <span className="font-mono text-foreground">Student@1234</span>
      </div>
    </main>
  );
}
