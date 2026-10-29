-- ============================================================
-- UniDesk Database Schema
-- Run this in XAMPP phpMyAdmin or MySQL CLI
-- ============================================================

CREATE DATABASE IF NOT EXISTS unidesk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE unidesk_db;

-- -------------------------------------------------------
-- departments
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(10)  NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_departments_name (name),
  UNIQUE KEY uq_departments_code (code)
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- users
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL,
  password      VARCHAR(255) NOT NULL,
  role          ENUM('STUDENT','STAFF','ADMIN') NOT NULL DEFAULT 'STUDENT',
  department_id VARCHAR(36)  NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_department
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- student_records (authoritative registration directory)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_records (
  id            VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  roll_number   VARCHAR(30)  NOT NULL,
  university_email VARCHAR(150) NOT NULL,
  full_name     VARCHAR(100) NOT NULL,
  course        VARCHAR(100) NOT NULL,
  semester      VARCHAR(30)  NOT NULL,
  department_id VARCHAR(36)  NOT NULL,
  status        ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  user_id       VARCHAR(36)  NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_student_roll_number (roll_number),
  UNIQUE KEY uq_student_email (university_email),
  UNIQUE KEY uq_student_user (user_id),
  CONSTRAINT fk_student_record_department
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  CONSTRAINT fk_student_record_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- tickets
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
  id            VARCHAR(36)   NOT NULL DEFAULT (UUID()),
  ticket_number INT           NOT NULL AUTO_INCREMENT,
  title         VARCHAR(200)  NOT NULL,
  description   TEXT          NOT NULL,
  category      VARCHAR(50)   NOT NULL,
  priority      ENUM('LOW','MEDIUM','HIGH','URGENT') NOT NULL DEFAULT 'MEDIUM',
  status        ENUM('PENDING','IN_PROGRESS','RESOLVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  student_id    VARCHAR(36)   NOT NULL,
  department_id VARCHAR(36)   NOT NULL,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_ticket_number (ticket_number),
  KEY idx_tickets_student    (student_id),
  KEY idx_tickets_department (department_id),
  KEY idx_tickets_status     (status),
  CONSTRAINT fk_tickets_student
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_tickets_department
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- ticket_comments  (activity log)
-- -------------------------------------------------------
CREATE TABLE IF NOT EXISTS ticket_comments (
  id            VARCHAR(36) NOT NULL DEFAULT (UUID()),
  ticket_id     VARCHAR(36) NOT NULL,
  author_id     VARCHAR(36) NOT NULL,
  comment       TEXT        NOT NULL,
  status_change ENUM('PENDING','IN_PROGRESS','RESOLVED','REJECTED') NULL,
  created_at    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_comments_ticket (ticket_id),
  KEY idx_comments_author (author_id),
  CONSTRAINT fk_comments_ticket
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- Triggers
-- -------------------------------------------------------
DROP TRIGGER IF EXISTS trg_ticket_comments_after_insert;

CREATE TRIGGER trg_ticket_comments_after_insert
AFTER INSERT ON ticket_comments
FOR EACH ROW
  UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.ticket_id;

-- ============================================================
-- Seed: departments
-- ============================================================
INSERT IGNORE INTO departments (id, name, code) VALUES
  (UUID(), 'Computer Applications', 'MCA'),
  (UUID(), 'Library',               'LIB'),
  (UUID(), 'Hostel',                'HST'),
  (UUID(), 'Electrical & Maintenance', 'ELE'),
  (UUID(), 'Administration',        'ADM'),
  (UUID(), 'Sports & Recreation',   'SPT');

-- ============================================================
-- Seed: users
-- Admin password  : Admin@1234   (bcrypt hash below)
-- Student password: Student@1234
-- NOTE: run the app's /api/auth/register or seed script to
--       generate proper bcrypt hashes; the values below are
--       placeholders to show table structure.
-- ============================================================
-- Run `npm run db:seed` from the project root to insert
-- properly hashed user rows automatically.

-- Student records are seeded by database/init.ts and database/seed.ts.

