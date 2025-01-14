import { eq } from "drizzle-orm";
import type { Database } from "../../libs/drizzle/get-database";
import { students } from "../../libs/drizzle/schema";
import { Student } from "../../domain/student/student";
import { StudentRepositoryInterface } from "../../domain/student/student-repository";

export class PostgresqlStudentRepository implements StudentRepositoryInterface {
  public constructor(private readonly database: Database) {}

  public async save(student: Student) {
    const [row] = await this.database
      .insert(students)
      .values({
        id: student.id,
        name: student.name,
        mailAddress: student.mailAddress,
        status: student.enrollmentStatus,
      })
      .onConflictDoUpdate({
        target: students.id,
        set: {
          status: student.enrollmentStatus,
        },
      })
      .returning({
        id: students.id,
        name: students.name,
        mailAddress: students.mailAddress,
        status: students.status,
      });

    if (!row) {
      throw new Error("Failed to save a student");
    }

    return new Student({
      id: row.id,
      name: row.name,
      mailAddress: row.mailAddress,
      enrollmentStatus: row.status,
    });
  }

  public async findById(id: string) {
    const [row] = await this.database
      .select({
        id: students.id,
        name: students.name,
        mailAddress: students.mailAddress,
        status: students.status,
      })
      .from(students)
      .where(eq(students.id, id));

    if (!row) {
      return undefined;
    }

    return new Student({
      id: row.id,
      name: row.name,
      mailAddress: row.mailAddress,
      enrollmentStatus: row.status,
    });
  }
}
