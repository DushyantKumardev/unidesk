import type { Role } from "./types";

export function dashboardForRole(role: Role): string {
  if (role === "STUDENT") return "/student";
  if (role === "STAFF") return "/staff";
  return "/admin";
}

export function canManageTickets(role: Role): boolean {
  return role === "STAFF" || role === "ADMIN";
}
