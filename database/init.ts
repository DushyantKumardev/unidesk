/**
 * Database initializer — runs automatically on first server start.
 * Creates the `unidesk_db` database, all tables, and seeds initial data.
 *
 * Uses raw mysql2 with NO ORM — every statement is hand-written SQL.
 */

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

/** Connect without specifying a database first — so we can CREATE DATABASE. */
async function getRootConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
  });
}

/** Connect to the target database for table creation and seeding. */
async function getDbConnection() {
  return mysql.createConnection({
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASSWORD ?? "",
    database: process.env.DB_NAME ?? "unidesk_db",
    multipleStatements: true,
  });
}

export async function initDatabase() {
  const dbName = process.env.DB_NAME ?? "unidesk_db";
  console.log(`\n🗄️  UniDesk — initializing database "${dbName}"...`);

  // ── Step 1: Create database if it does not exist ──────────
  const root = await getRootConnection();
  await root.execute(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await root.end();
  console.log(`   ✔ Database "${dbName}" ready.`);

  // ── Step 2: Create tables ──────────────────────────────────
  const db = await getDbConnection();

  await db.query(`
    CREATE TABLE IF NOT EXISTS departments (
      id         VARCHAR(36)  NOT NULL,
      name       VARCHAR(100) NOT NULL,
      code       VARCHAR(10)  NOT NULL,
      created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_dept_name (name),
      UNIQUE KEY uq_dept_code (code)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id            VARCHAR(36)  NOT NULL,
      name          VARCHAR(100) NOT NULL,
      email         VARCHAR(150) NOT NULL,
      password      VARCHAR(255) NOT NULL,
      role          ENUM('STUDENT','STAFF','ADMIN') NOT NULL DEFAULT 'STUDENT',
      department_id VARCHAR(36)  NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_email (email),
      CONSTRAINT fk_users_dept
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_records (
      id               VARCHAR(36)  NOT NULL,
      roll_number      VARCHAR(30)  NOT NULL,
      university_email VARCHAR(150) NOT NULL,
      full_name        VARCHAR(100) NOT NULL,
      course           VARCHAR(100) NOT NULL,
      semester         VARCHAR(30)  NOT NULL,
      department_id    VARCHAR(36)  NOT NULL,
      status           ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
      user_id          VARCHAR(36)  NULL,
      created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_student_roll_number (roll_number),
      UNIQUE KEY uq_student_email (university_email),
      UNIQUE KEY uq_student_user (user_id),
      CONSTRAINT fk_student_record_department
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
      CONSTRAINT fk_student_record_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS tickets (
      id            VARCHAR(36)   NOT NULL,
      ticket_number INT           NOT NULL AUTO_INCREMENT,
      title         VARCHAR(200)  NOT NULL,
      description   TEXT          NOT NULL,
      category      VARCHAR(50)   NOT NULL,
      priority      ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
      status        ENUM('PENDING','IN_PROGRESS','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING',
      student_id    VARCHAR(36)   NOT NULL,
      department_id VARCHAR(36)   NOT NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_ticket_number (ticket_number),
      KEY idx_tickets_student    (student_id),
      KEY idx_tickets_department (department_id),
      KEY idx_tickets_status     (status),
      CONSTRAINT fk_tickets_student
        FOREIGN KEY (student_id)    REFERENCES users(id)       ON DELETE CASCADE,
      CONSTRAINT fk_tickets_dept
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS ticket_comments (
      id            VARCHAR(36) NOT NULL,
      ticket_id     VARCHAR(36) NOT NULL,
      author_id     VARCHAR(36) NOT NULL,
      comment       TEXT        NOT NULL,
      status_change ENUM('PENDING','IN_PROGRESS','RESOLVED','REJECTED') NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      KEY idx_comments_ticket (ticket_id),
      KEY idx_comments_author (author_id),
      CONSTRAINT fk_comments_ticket
        FOREIGN KEY (ticket_id) REFERENCES tickets(id)  ON DELETE CASCADE,
      CONSTRAINT fk_comments_author
        FOREIGN KEY (author_id) REFERENCES users(id)    ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log("   ✔ Tables created (or already exist).");

  // Ensure triggers are synchronized
  await db.query(`DROP TRIGGER IF EXISTS trg_ticket_comments_after_insert;`);
  await db.query(`
    CREATE TRIGGER trg_ticket_comments_after_insert
    AFTER INSERT ON ticket_comments
    FOR EACH ROW
      UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.ticket_id;
  `);
  console.log("   ✔ Triggers created (or updated).");

  // ── Step 3: Seed departments ───────────────────────────────
  const departments = [
    { name: "Computer Applications", code: "MCA" },
    { name: "Library", code: "LIB" },
    { name: "Hostel", code: "HST" },
    { name: "Electrical & Maintenance", code: "ELE" },
    { name: "Administration", code: "ADM" },
    { name: "Sports & Recreation", code: "SPT" },
  ];

  for (const dept of departments) {
    await db.execute(
      `INSERT IGNORE INTO departments (id, name, code) VALUES (?, ?, ?)`,
      [randomUUID(), dept.name, dept.code],
    );
  }
  console.log("   ✔ Departments seeded.");

  await db.execute(
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
  console.log("   ✔ Student records seeded.");

  // ── Step 4: Seed admin user ────────────────────────────────
  const [adminRows] = (await db.execute(
    `SELECT id FROM users WHERE email = ? LIMIT 1`,
    ["admin@unidesk.edu"],
  )) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

  if (adminRows.length === 0) {
    const adminHash = await bcrypt.hash("Admin@1234", 12);
    await db.execute(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'ADMIN')`,
      [randomUUID(), "Admin User", "admin@unidesk.edu", adminHash],
    );
    console.log("   ✔ Admin user created  → admin@unidesk.edu / Admin@1234");
  } else {
    console.log("   ✔ Admin user already exists.");
  }

  // ── Step 5: Seed test student ──────────────────────────────
  const [stuRows] = (await db.execute(
    `SELECT id FROM users WHERE email = ? LIMIT 1`,
    ["student@unidesk.edu"],
  )) as [mysql.RowDataPacket[], mysql.FieldPacket[]];

  if (stuRows.length === 0) {
    const studentHash = await bcrypt.hash("Student@1234", 12);
    await db.execute(
      `INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, 'STUDENT')`,
      [randomUUID(), "Test Student", "student@unidesk.edu", studentHash],
    );
    console.log(
      "   ✔ Student created      → student@unidesk.edu / Student@1234",
    );
  } else {
    console.log("   ✔ Student already exists.");
  }

  await db.execute(
    `UPDATE student_records sr
     JOIN users u ON u.email = sr.university_email
     SET sr.user_id = u.id
     WHERE sr.university_email = ?`,
    ["student@unidesk.edu"],
  );

  // ── Step 6: Seed department staff ─────────────────────────
  const staffHash = await bcrypt.hash("Staff@1234", 12);
  await db.execute(
    `INSERT INTO users (id, name, email, password, role, department_id)
     SELECT ?, ?, ?, ?, 'STAFF', id FROM departments WHERE code = 'MCA' LIMIT 1
     ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), department_id = VALUES(department_id)`,
    [randomUUID(), "MCA Staff", "staff@unidesk.edu", staffHash],
  );
  console.log(
    "   ✔ Staff created       → staff@unidesk.edu / Staff@1234 (Computer Applications)",
  );

  await db.end();
  console.log("🚀 UniDesk DB initialization complete!\n");
}
