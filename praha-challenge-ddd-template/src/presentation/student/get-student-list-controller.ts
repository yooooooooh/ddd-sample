import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { getDatabase } from "../../libs/drizzle/get-database";
import { PostgresqlStudentListQueryService } from "../../infrastructure/query-service/postgresql-student-list-query-service";
import type { StudentListQueryServiceInterface } from "../../application/query-service/student-list-query-service";

type Env = {
  Variables: {
    StudentListQueryService: StudentListQueryServiceInterface;
  };
};

export const getStudentListController = new Hono<Env>();

getStudentListController.get(
  "/students",
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const StudentListQueryService = new PostgresqlStudentListQueryService(
      database
    );
    context.set("StudentListQueryService", StudentListQueryService);

    await next();
  }),
  async (context) => {
    const payload = await context.var.StudentListQueryService.invoke();
    return context.json(payload);
  }
);
