import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getSession } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

export const dynamic = "force-dynamic";

/** Protected layout — renders navbar and redirects if not authenticated. */
export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar session={session} />
      <div className="lg:flex">
        <Sidebar session={session} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
