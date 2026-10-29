import type { ReactNode } from "react";

/** Centered, full-screen layout for auth pages — uses HeroUI background tokens. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      {children}
    </div>
  );
}
