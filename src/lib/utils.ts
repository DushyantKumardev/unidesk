/**
 * General utility functions shared across the app.
 */

/**
 * Returns a consistent API error JSON response.
 */
export function apiError(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status });
}

/**
 * Returns a consistent API success JSON response.
 */
export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

/**
 * Formats a given number of elapsed seconds into a relative time string.
 *
 * @param seconds - Elapsed seconds
 * @returns Human-readable relative description (e.g., "5 minutes ago")
 */
function formatRelativeDuration(seconds: number): string {
  if (seconds < 45) return "just now";

  const intervals: [number, string][] = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [secs, label] of intervals) {
    const count = Math.floor(seconds / secs);
    if (count >= 1) {
      return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

/**
 * Formats a Date object or ISO string into a human-readable relative time representation.
 * Supports both Date instances and string inputs gracefully, returning a placeholder for invalid values.
 * Handles local timezone offsets and MySQL datetime representations accurately.
 *
 * @param date - The Date instance or ISO date string to format
 * @returns Human-friendly relative duration (e.g., "just now", "5 minutes ago", "2 days ago")
 */
export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return "—";

  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    const normalized = date.includes(" ") && !date.includes("T")
      ? date.replace(" ", "T")
      : date;
    d = new Date(normalized);
  } else {
    d = new Date(date);
  }

  const time = d.getTime();
  if (Number.isNaN(time)) return "—";

  const diffMs = Date.now() - time;
  const seconds = Math.floor(diffMs / 1000);

  // Normal positive or near-instant duration
  if (seconds >= -15) {
    return formatRelativeDuration(seconds);
  }

  // If timestamp appears in the future by more than 15 seconds,
  // evaluate whether an UTC vs local timezone offset discrepancy is present
  const tzOffsetMs = d.getTimezoneOffset() * 60 * 1000;
  const compensatedDiffMs = Date.now() - (time + tzOffsetMs);
  const compensatedSeconds = Math.floor(compensatedDiffMs / 1000);

  if (compensatedSeconds >= 0) {
    return formatRelativeDuration(compensatedSeconds);
  }

  return "just now";
}

/**
 * Formats a Date object or ISO string into a concise, readable calendar date.
 *
 * @param date - The Date instance or ISO date string to format
 * @returns Formatted calendar date (e.g., "Oct 29, 2026")
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";

  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    const normalized = date.includes(" ") && !date.includes("T")
      ? date.replace(" ", "T")
      : date;
    d = new Date(normalized);
  } else {
    d = new Date(date);
  }

  const time = d.getTime();
  if (Number.isNaN(time)) return "—";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Formats a Date object or ISO string into a full date and time string suitable for tooltips and accessible titles.
 *
 * @param date - The Date instance or ISO date string to format
 * @returns Full timestamp string (e.g., "Oct 29, 2026, 05:30 PM")
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—";

  let d: Date;
  if (date instanceof Date) {
    d = date;
  } else if (typeof date === "string") {
    const normalized = date.includes(" ") && !date.includes("T")
      ? date.replace(" ", "T")
      : date;
    d = new Date(normalized);
  } else {
    d = new Date(date);
  }

  const time = d.getTime();
  if (Number.isNaN(time)) return "—";

  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Returns a short display string for ticket number.
 * e.g. ticketNumber 42 → "TKT-0042"
 */
export function formatTicketNumber(num: number): string {
  return `TKT-${String(num).padStart(4, "0")}`;
}
