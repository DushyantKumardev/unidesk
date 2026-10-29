"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button, Alert } from "@heroui/react";
import { TICKET_CATEGORIES, PRIORITY } from "@/lib/constants";

interface Department {
  id: string;
  name: string;
  code: string;
}

export default function NewTicketPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    priority: "MEDIUM",
    departmentId: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((r) => r.json())
      .then((d) => setDepartments(d.data ?? []));
  }, []);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim() || !form.category || !form.departmentId) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to submit ticket.");
        return;
      }
      router.push("/student");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const fieldClass =
    "w-full rounded-lg border border-field-border bg-field text-field-foreground px-3.5 py-2 text-sm placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-focus shadow-field transition-colors";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Submit a Grievance</h1>
        <p className="text-sm text-muted">
          Describe the issue clearly so the department can act quickly.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-surface">
        {error && (
          <Alert status="danger" className="mb-5 rounded-xl">
            <Alert.Content>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium text-foreground">Title *</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Projector not working in Lab 3"
              required
              className={fieldClass}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className="text-sm font-medium text-foreground">Description *</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the issue in detail — when it started, how it affects you, etc."
              required
              className={fieldClass}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium text-foreground">Category *</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className={fieldClass}
            >
              <option value="">Select a category</option>
              {TICKET_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="departmentId" className="text-sm font-medium text-foreground">Department *</label>
            <select
              id="departmentId"
              name="departmentId"
              value={form.departmentId}
              onChange={handleChange}
              required
              className={fieldClass}
            >
              <option value="">Select department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="priority" className="text-sm font-medium text-foreground">Priority</label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className={fieldClass}
            >
              {Object.values(PRIORITY).map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" variant="primary" isDisabled={loading}>
              {loading ? "Submitting…" : "Submit Grievance"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
