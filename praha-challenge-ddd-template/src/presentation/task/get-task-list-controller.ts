import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import type { TaskListQueryServiceInterface } from "../../application/query-service/task-list-query-service";
import { PostgresqlTaskListQueryService } from "../../infrastructure/query-service/postgresql-task-list-query-service";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    taskListQueryService: TaskListQueryServiceInterface;
  };
};

export const getTaskListController = new Hono<Env>();

// - (管理者)「特定の課題（複数可能）」が「特定の進捗ステータス」になっている参加者の一覧を、10人単位でページングして取得する
getTaskListController.get(
  "/tasks",
  zValidator(
    "query",
    z.object({
      taskId: z.string(),
      taskStatus: z.string(),
      page: z.number().optional(),
    }),
    (result, c) => {
      console.log(result);
      if (!result.success) {
        return c.text("invalid query", 400);
      }

      return;
    }
  ),
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const taskListQueryService = new PostgresqlTaskListQueryService(database);
    context.set("taskListQueryService", taskListQueryService);

    await next();
  }),
  async (context) => {
    const query = context.req.valid("query");

    const payload = await context.var.taskListQueryService.invoke(query);
    return context.json(payload);
  }
);
