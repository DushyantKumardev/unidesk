/**
 * Next.js Instrumentation Hook
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 *
 * This file is called ONCE when the Next.js server boots.
 * We use it to auto-initialize the MySQL database (create tables + seed data).
 */

export async function register() {
  // Only run on the Node.js server runtime, not on the Edge runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initDatabase } = await import("../database/init");
    await initDatabase();
  }
}

