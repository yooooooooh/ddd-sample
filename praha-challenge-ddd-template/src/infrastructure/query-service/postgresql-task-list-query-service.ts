import { and, asc, eq } from "drizzle-orm";
import type {
  TaskListQueryServiceInterface,
  TaskListQueryServicePayload,
} from "../../application/query-service/task-list-query-service";
import type { Database } from "../../libs/drizzle/get-database";
import {
  students,
  taskContents,
  tasks,
  taskStatus,
} from "../../libs/drizzle/schema";

export class PostgresqlTaskListQueryService
  implements TaskListQueryServiceInterface
{
  public constructor(private readonly database: Database) {}

  public async invoke(value: {
    taskId: string;
    taskStatus: string;
    page?: number | undefined;
  }): Promise<TaskListQueryServicePayload> {
    console.log(value);

    const page = value.page ?? 1;

    const studentList = await this.database
      .select({ name: students.name })
      .from(tasks)
      .innerJoin(students, eq(tasks.studentId, students.id))
      .innerJoin(taskContents, eq(tasks.taskContentId, taskContents.id))
      .innerJoin(taskStatus, eq(tasks.taskStatusId, taskStatus.id))
      .where(
        and(
          eq(taskContents.id, value.taskId),
          eq(taskStatus.name, value.taskStatus),
          eq(students.status, "在籍中")
        )
      )
      .orderBy(asc(taskContents.id), asc(students.id))
      .offset((page - 1) * 10)
      .limit(10);

    console.log(studentList);

    return {
      students: studentList,
      nextPage: page + 1,
    };
  }
}
