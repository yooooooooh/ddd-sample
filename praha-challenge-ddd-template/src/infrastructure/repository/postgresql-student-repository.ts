import { eq } from "drizzle-orm";
import { StudentStatus } from "../../domain/aaa/student-status";
import type { Database } from "../../libs/drizzle/get-database";
import { students } from "../../libs/drizzle/schema";
import { Student } from "../../domain/aaa/Student";
import { StudentRepositoryInterface } from "../../domain/aaa/Student-repository";

export class PostgresqlStudentRepository implements StudentRepositoryInterface {
  public constructor(private readonly database: Database) {}

  public async save(student: Student) {
    const [row] = await this.database
      .insert(students)
      .values({
        id: student.id,
        name: student.name,
        mailAddress: student.mailAddress,
        status: student.studentStatus,
      })
      .onConflictDoUpdate({
        target: students.id,
        set: {
          status: student.studentStatus,
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
      studentStatus: new StudentStatus(row.status),
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
      studentStatus: new StudentStatus(row.status),
    });
  }
}
