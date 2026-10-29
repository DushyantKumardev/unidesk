/**
 * Seed script — populates departments and test users using raw SQL.
 * Run with: npm run db:seed
 */

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "",
  database: process.env.DB_NAME ?? "unidesk_db",
});

console.log("🌱 Seeding UniDesk database...\n");

// ── Departments ──────────────────────────────────────────────
const departments = [
  { name: "Computer Applications", code: "MCA" },
  { name: "Library", code: "LIB" },
  { name: "Hostel", code: "HST" },
  { name: "Electrical & Maintenance", code: "ELE" },
  { name: "Administration", code: "ADM" },
  { name: "Sports & Recreation", code: "SPT" },
];

for (const dept of departments) {
  await connection.execute(
    `INSERT INTO departments (id, name, code)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [randomUUID(), dept.name, dept.code],
  );
}
console.log(`✅ ${departments.length} departments seeded.`);

await connection.execute(
  `INSERT INTO student_records
     (id, roll_number, university_email, full_name, course, semester, department_id)
   SELECT ?, ?, ?, ?, ?, ?, id
   FROM departments WHERE code = 'MCA' LIMIT 1
   ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), status = 'ACTIVE'`,
  [
    randomUUID(),
    "MCA001",
    "student@unidesk.edu",
    "Test Student",
    "MCA",
    "Semester 1",
  ],
);
console.log("✅ Student records seeded.");

// ── Admin user ───────────────────────────────────────────────
const adminHash = await bcrypt.hash("Admin@1234", 12);
await connection.execute(
  `INSERT INTO users (id, name, email, password, role)
   VALUES (?, ?, ?, ?, 'ADMIN')
   ON DUPLICATE KEY UPDATE name = VALUES(name)`,
  [randomUUID(), "Admin User", "admin@unidesk.edu", adminHash],
);
console.log("✅ Admin  → admin@unidesk.edu  / Admin@1234");

// ── Test student ─────────────────────────────────────────────
const studentHash = await bcrypt.hash("Student@1234", 12);
await connection.execute(
  `INSERT INTO users (id, name, email, password, role)
   VALUES (?, ?, ?, ?, 'STUDENT')
   ON DUPLICATE KEY UPDATE name = VALUES(name)`,
  [randomUUID(), "Test Student", "student@unidesk.edu", studentHash],
);
console.log("✅ Student → student@unidesk.edu / Student@1234");

await connection.execute(
  `UPDATE student_records sr
   JOIN users u ON u.email = sr.university_email
   SET sr.user_id = u.id
   WHERE sr.university_email = ?`,
  ["student@unidesk.edu"],
);

// ── Test staff user ─────────────────────────────────────────
const staffHash = await bcrypt.hash("Staff@1234", 12);
await connection.execute(
  `INSERT INTO users (id, name, email, password, role, department_id)
   SELECT ?, ?, ?, ?, 'STAFF', id FROM departments WHERE code = 'MCA' LIMIT 1
   ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), department_id = VALUES(department_id)`,
  [randomUUID(), "MCA Staff", "staff@unidesk.edu", staffHash],
);
console.log(
  "✅ Staff   → staff@unidesk.edu / Staff@1234 (Computer Applications)",
);

await connection.end();
console.log("\n🚀 Seeding complete!");
