import { and, eq } from "drizzle-orm";
import { Task } from "../../domain/task/task";
import type { TaskRepositoryInterface } from "../../domain/task/task-repository";
import type { Database } from "../../libs/drizzle/get-database";
import { students, taskContents, tasks } from "../../libs/drizzle/schema";
import { taskStatus } from "../../libs/drizzle/schema";

export class PostgresqlTaskRepository implements TaskRepositoryInterface {
  public constructor(private readonly database: Database) {}

  public async save(task: Task) {
    const id = task.id;
    const studentId = task.studentId;
    const status = task.status;

    const [taskStatusRow] = await this.database
      .select({
        id: taskStatus.id,
      })
      .from(taskStatus)
      .where(
        eq(taskStatus.name, status),
      )

    if (!taskStatusRow) {
      throw new Error("Failed to update a task");
    }

    const [row] = await this.database
      .insert(tasks)
      .values({
        taskContentId: id,
        studentId: studentId,
        taskStatusId: taskStatusRow.id,
      })
      .onConflictDoUpdate({
        target: [tasks.taskContentId, tasks.taskStatusId],
        set: {
          taskStatusId: taskStatusRow.id,
        },
      })
      .returning({
        taskId: tasks.taskContentId,
        studentId: tasks.studentId,
        taskStatusId: tasks.taskStatusId,
      });

    if (!row || row.taskStatusId !== taskStatusRow.id) {
      throw new Error("Failed to update a task");
    }

    return new Task({
      id: row.taskId,
      studentId: row.studentId,
      status
    });
  }

  public async findById(
    taskId: string,
    studentId: string
  ): Promise<Task | undefined> {
    const [row] = await this.database
      .select({
        taskId: taskContents.id,
        studentId: students.id,
        status: taskStatus.name,
      })
      .from(tasks)
      .innerJoin(students, eq(tasks.studentId, students.id))
      .innerJoin(taskContents, eq(tasks.taskContentId, taskContents.id))
      .innerJoin(taskStatus, eq(tasks.taskStatusId, taskStatus.id))
      .where(
        and(eq(taskContents.id, taskId), eq(students.id, studentId))
      );

    if (!row) {
      return undefined;
    }

    return new Task({
      id: row.taskId,
      studentId: row.studentId,
      status: row.status
    });
  }
}
