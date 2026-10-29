import { query } from "./mysql";

export interface StudentRecord {
  id: string;
  roll_number: string;
  university_email: string;
  full_name: string;
  course: string;
  semester: string;
  department_id: string;
  status: "ACTIVE" | "INACTIVE";
  user_id: string | null;
}

export async function getActiveStudentRecordByEmail(
  email: string,
): Promise<StudentRecord | null> {
  const rows = await query<StudentRecord>(
    `SELECT id, roll_number, university_email, full_name, course, semester,
            department_id, status, user_id
     FROM student_records
     WHERE university_email = ? AND status = 'ACTIVE'
     LIMIT 1`,
    [email],
  );
  return rows[0] ?? null;
}
