import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import {
  EditStudentStatusUseCase,
  EditStudentStatusUseCaseNotFoundError,
} from "../../application/use-case/edit-student-status-use-case";
import { PostgresqlStudentRepository } from "../../infrastructure/repository/postgresql-student-repository";
import { PostgresqlTeamRepository } from "../../infrastructure/repository/postgresql-team-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    editStudentStatusUseCase: EditStudentStatusUseCase;
  };
};

export const editStudentStatusController = new Hono<Env>();

editStudentStatusController.post(
  "/students/:id/edit",
  zValidator("param", z.object({ id: z.string() }), (result, c) => {
    if (!result.success) {
      return c.text("invalid id", 400);
    }
    return;
  }),
  zValidator(
    "json",
    z.object({ status: z.enum(["在籍中", "休会中", "退会中"]) }),
    (result, c) => {
      if (!result.success) {
        return c.text("invalid body", 400);
      }
      return;
    }
  ),
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const StudentsRepository = new PostgresqlStudentRepository(database);
    const teamRepository = new PostgresqlTeamRepository(database);
    const editStudentStatusUseCase = new EditStudentStatusUseCase(
      StudentsRepository,
      teamRepository
    );
    context.set("editStudentStatusUseCase", editStudentStatusUseCase);

    await next();
  }),
  async (context) => {
    try {
      const param = context.req.valid("param");
      const body = context.req.valid("json");

      const payload = await context.var.editStudentStatusUseCase.invoke({
        StudentId: param.id,
        status: body.status,
      });
      return context.json(payload);
    } catch (error) {
      if (error instanceof EditStudentStatusUseCaseNotFoundError) {
        return context.text(error.message, 404);
      }

      throw error;
    }
  }
);
