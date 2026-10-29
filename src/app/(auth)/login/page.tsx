"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Alert, Card } from "@heroui/react";
import { dashboardForRole } from "@/lib/rbac";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        return;
      }

      const role = data.data.role;
      window.location.replace(dashboardForRole(role));
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-xl border border-field-border bg-field text-field-foreground px-4 py-2.5 text-sm placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-focus shadow-field transition-colors";

  return (
    <div className="w-full max-w-md px-4">
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground font-black text-2xl shadow-sm mb-3">
          U
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Uni<span className="text-accent">Desk</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Smart Campus Grievance & Issue Resolution
        </p>
      </div>

      <Card className="border border-border bg-surface p-8 shadow-surface">
        <Card.Header className="p-0 pb-6">
          <Card.Title className="text-xl font-bold text-foreground">
            Sign in to your account
          </Card.Title>
          <Card.Description className="text-xs text-muted mt-1">
            Access your student dashboard or staff admin console
          </Card.Description>
        </Card.Header>

        <Card.Content className="p-0">
          {error && (
            <Alert status="danger" className="mb-5 rounded-xl">
              <Alert.Content>
                <Alert.Description>{error}</Alert.Description>
              </Alert.Content>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                College Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@unidesk.edu"
                required
                autoComplete="email"
                className={fieldClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className={fieldClass}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-3 w-full"
              isDisabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to UniDesk"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-link hover:underline"
            >
              Register as student
            </Link>
          </p>
        </Card.Content>
      </Card>
    </div>
  );
}
