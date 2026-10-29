import { Chip } from "@heroui/react";
import type { TicketStatus, Priority } from "@/lib/types";

const STATUS_MAP: Record<
  TicketStatus,
  { label: string; color: "warning" | "accent" | "success" | "danger" }
> = {
  PENDING: { label: "Pending", color: "warning" },
  IN_PROGRESS: { label: "In Progress", color: "accent" },
  RESOLVED: { label: "Resolved", color: "success" },
  REJECTED: { label: "Rejected", color: "danger" },
};

const PRIORITY_MAP: Record<
  Priority,
  { label: string; color: "default" | "accent" | "warning" | "danger" }
> = {
  LOW: { label: "Low", color: "default" },
  MEDIUM: { label: "Medium", color: "accent" },
  HIGH: { label: "High", color: "warning" },
  URGENT: { label: "Urgent", color: "danger" },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const item = STATUS_MAP[status];
  return (
    <Chip color={item.color} variant="soft" size="sm">
      {item.label}
    </Chip>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const item = PRIORITY_MAP[priority];
  return (
    <Chip color={item.color} variant="soft" size="sm">
      {item.label}
    </Chip>
  );
}
