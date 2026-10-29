/**
 * Application-wide constants.
 */

export const APP_NAME = "UniDesk";
export const APP_DESCRIPTION = "Smart Campus Grievance & Issue Tracking System";

/** Unresolved tickets older than this threshold appear in admin attention items. */
export const OVERDUE_DAYS = 3;

/** Cookie name used to store the session JWT token */
export const AUTH_COOKIE_NAME = "unidesk_session";

/** JWT expiry — 7 days */
export const JWT_EXPIRES_IN = "7d";

export const ROLES = {
  STUDENT: "STUDENT",
  STAFF: "STAFF",
  ADMIN: "ADMIN",
} as const;

export const TICKET_STATUS = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  REJECTED: "REJECTED",
} as const;

export const PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  URGENT: "URGENT",
} as const;

export const TICKET_CATEGORIES = [
  "Infrastructure",
  "Lab Equipment",
  "Library",
  "Hostel",
  "Electrical",
  "Sanitation",
  "Administration",
  "Other",
] as const;
