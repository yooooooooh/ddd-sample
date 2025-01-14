import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import {
  EditTaskUseCase,
  EditTaskUseCaseNotFoundError,
} from "../../application/use-case/edit-task-use-case";
import { PostgresqlTaskRepository } from "../../infrastructure/repository/postgresql-task-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    editTaskUseCase: EditTaskUseCase;
  };
};

export const editTaskController = new Hono<Env>();

editTaskController.post(
  "/tasks/edit",
  zValidator(
    "json",
    z.object({
      studentId: z.string(),
      taskContentId: z.string(),
      taskStatus: z.enum(["未着手" , "取組中" , "レビュー待ち" , "完了"]),
    }),
    (result, c) => {
      if (!result.success) {
        return c.text("invalid body", 400);
      }

      return;
    }
  ),
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const taskRepository = new PostgresqlTaskRepository(database);
    const editTaskUseCase = new EditTaskUseCase(taskRepository);
    context.set("editTaskUseCase", editTaskUseCase);

    await next();
  }),
  async (context) => {
    try {
      const body = context.req.valid("json");

      const payload = await context.var.editTaskUseCase.invoke({
        taskId: body.taskContentId,
        taskStatus: body.taskStatus,
        studentId: body.studentId,
      });
      return context.json(payload);
    } catch (error) {
      if (error instanceof EditTaskUseCaseNotFoundError) {
        return context.text(error.message, 404);
      }

      throw error;
    }
  }
);
