"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Alert } from "@heroui/react";
import type { TicketStatus } from "@/lib/types";

const STATUSES: { value: TicketStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "REJECTED", label: "Rejected" },
];

interface TicketActionsProps {
  ticketId: string;
  currentStatus: TicketStatus;
}

export default function TicketActions({ ticketId, currentStatus }: TicketActionsProps) {
  const router = useRouter();
  const [status, setStatus] = useState<TicketStatus>(currentStatus);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!comment.trim()) {
      setError("Please write an official remark explaining this status change.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comment }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Update failed.");
        return;
      }

      setSuccess("Ticket updated and recorded to timeline.");
      setComment("");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border border-border bg-surface p-5 shadow-surface sm:p-6">
      <div className="border-b border-border pb-3">
        <h2 className="text-lg font-bold text-foreground">Administrative Actions</h2>
        <p className="text-xs text-muted">
          Update the lifecycle state and log official resolution remarks.
        </p>
      </div>

      <div className="pt-4">
        {error && (
          <Alert status="danger" className="mb-4 rounded-xl">
            <Alert.Content><Alert.Description>{error}</Alert.Description></Alert.Content>
          </Alert>
        )}
        {success && (
          <Alert status="success" className="mb-4 rounded-xl">
            <Alert.Content><Alert.Description>{success}</Alert.Description></Alert.Content>
          </Alert>
        )}

        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted">
              Select New Status
            </label>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
                    status === s.value
                      ? "border-accent bg-accent text-accent-foreground shadow-xs scale-102"
                      : "border-border bg-surface-secondary text-muted hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="remark" className="text-xs font-semibold uppercase tracking-wider text-muted">
              Official Resolution Remark *
            </label>
            <textarea
              id="remark"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Technician dispatched to Lab 3. Replaced projector power connector."
              required
              className="rounded-xl border border-field-border bg-field text-field-foreground px-4 py-3 text-sm placeholder:text-field-placeholder focus:outline-none focus:ring-2 focus:ring-focus shadow-field transition-colors"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" variant="primary" isDisabled={loading}>
              {loading ? "Recording..." : "Save Status & Remark"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
