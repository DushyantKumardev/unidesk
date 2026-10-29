"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Alert, Card } from "@heroui/react";

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }

      window.location.replace("/student");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    {
      id: "email",
      label: "College Email",
      type: "email",
      placeholder: "student@unidesk.edu",
      autoComplete: "email",
    },
    {
      id: "password",
      label: "Password",
      type: "password",
      placeholder: "Min. 6 characters",
      autoComplete: "new-password",
    },
    {
      id: "confirm",
      label: "Confirm Password",
      type: "password",
      placeholder: "Re-enter password",
      autoComplete: "new-password",
    },
  ] as const;

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
          Join the Campus Resolution Network
        </p>
      </div>

      <Card className="border border-border bg-surface p-8 shadow-surface">
        <Card.Header className="p-0 pb-6">
          <Card.Title className="text-xl font-bold text-foreground">
            Create Student Account
          </Card.Title>
          <Card.Description className="text-xs text-muted mt-1">
            Register to lodge issues directly to your campus departments
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
            {fields.map(({ id, label, type, placeholder, autoComplete }) => (
              <div key={id} className="flex flex-col gap-1.5">
                <label
                  htmlFor={id}
                  className="text-xs font-semibold uppercase tracking-wider text-muted"
                >
                  {label}
                </label>
                <input
                  id={id}
                  name={id}
                  type={type}
                  value={form[id]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  required
                  className={fieldClass}
                />
              </div>
            ))}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="mt-3 w-full"
              isDisabled={loading}
            >
              {loading ? "Creating..." : "Register Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-link hover:underline"
            >
              Sign in
            </Link>
          </p>
        </Card.Content>
      </Card>
    </div>
  );
}
