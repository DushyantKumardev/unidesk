# UniDesk — Campus Grievance & Issue Tracking System

UniDesk is a web-based campus grievance management system built for students, department staff, and college administration. It streamlines lodging, tracking, and resolving university issues across departments (such as MCA labs, library, hostel, and maintenance).

---

## Features

- **Role-Based Access Control**:
  - **Student**: Lodge grievances, track ticket progress, and view resolution remarks in real time.
  - **Staff**: View and manage tickets scoped to your department, update status (`Pending` &rarr; `In Progress` &rarr; `Resolved` / `Rejected`), and post official responses.
  - **Admin**: Campus-wide oversight, KPI metrics, status distributions, and cross-department ticket management.
- **Dual Timestamps**: Displays creation time and last-updated time across all dashboard tables and detail views.
- **Activity & Timeline History**: Every status transition and comment is preserved with author roles and timestamps.
- **Raw SQL Database Architecture**: Handcrafted queries and triggers using `mysql2` with zero ORM overhead.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling & Components**: Tailwind CSS v4 + HeroUI v3
- **Database**: MySQL (via `mysql2`)
- **Authentication**: JWT sessions using `jose` + `bcryptjs` with HTTP-only cookies

---

## Prerequisites

- **Node.js** (v18.18.0 or newer)
- **MySQL** running locally (e.g., via XAMPP, WampServer, or native MySQL on port `3306`)

---

## How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=unidesk_db
JWT_SECRET=your_super_secret_jwt_key_here
```

### 3. Initialize & Seed Database
Initialize tables and demo accounts:
```bash
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Demo Credentials

| Role | Email | Password | Scope |
| --- | --- | --- | --- |
| **Admin** | `admin@unidesk.edu` | `Admin@1234` | Manage all department's tickets |
| **Staff** | `staff@unidesk.edu` | `Staff@1234` | View and manage tickets for Computer Applications (MCA) department |
| **Student** | `student@unidesk.edu` | `Student@1234` | Lodge grievances and track their status |
