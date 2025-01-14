import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { CreateStudentUseCase } from "../../application/use-case/create-student-use-case";
import { PostgresqlStudentRepository } from "../../infrastructure/repository/postgresql-student-repository";
import { PostgresqlTeamRepository } from "../../infrastructure/repository/postgresql-team-repository";
import { getDatabase } from "../../libs/drizzle/get-database";

type Env = {
  Variables: {
    createStudentUseCase: CreateStudentUseCase;
  };
};

export const createStudentController = new Hono<Env>();

createStudentController.post(
  "/students/new",
  zValidator(
    "json",
    z.object({ name: z.string(), mailAddress: z.string().email() }),
    (result, c) => {
      if (!result.success) {
        return c.text(`${result.error}`, 400);
      }
      return;
    }
  ),
  createMiddleware<Env>(async (context, next) => {
    const database = getDatabase();
    const StudentsRepository = new PostgresqlStudentRepository(database);
    const teamRepository = new PostgresqlTeamRepository(database);
    const createStudentsUseCase = new CreateStudentUseCase(
      StudentsRepository,
      teamRepository
    );
    context.set("createStudentUseCase", createStudentsUseCase);

    await next();
  }),
  async (context) => {
    const body = context.req.valid("json");

    const payload = await context.var.createStudentUseCase.invoke(body);
    return context.json(payload);
  }
);
