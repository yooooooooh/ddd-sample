import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  text,
  varchar,
} from "drizzle-orm/pg-core";

export const students = pgTable("students", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  mailAddress: varchar("mail_address").unique().notNull(),
  status: varchar("status").notNull(),
});

export const studentsRelations = relations(students, ({ many }) => ({
  teamMember: many(teamMember),
  tasks: many(tasks),
}));

export const teams = pgTable("teams", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull().unique(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMember: many(teamMember),
}));

export const teamMember = pgTable(
  "team_member",
  {
    studentId: varchar("students_id").references(() => students.id),
    teamId: varchar("team_id").references(() => teams.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.studentId, t.teamId] }),
  })
);

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  team: one(teams, {
    fields: [teamMember.teamId],
    references: [teams.id],
  }),
  students: one(students, {
    fields: [teamMember.studentId],
    references: [students.id],
  }),
}));

export const tasks = pgTable(
  "tasks",
  {
    taskContentId: varchar("task_content_id").notNull().references(() => taskContents.id),
    taskStatusId: integer("task_status_id").notNull().references(() => taskStatus.id),
    studentId: varchar("student_id").notNull().references(() => students.id),
  },
  (table) => {
    return {
      pk: primaryKey({
        columns: [table.taskContentId, table.studentId],
      }),
    };
  }
);

export const taskRelations = relations(tasks, ({ one }) => ({
  students: one(students, {
    fields: [tasks.studentId],
    references: [students.id],
  }),
  taskContent: one(taskContents, {
    fields: [tasks.taskContentId],
    references: [taskContents.id],
  }),
  taskStatus: one(taskStatus, {
    fields: [tasks.taskStatusId],
    references: [taskStatus.id],
  }),
}));

export const taskContents = pgTable("task_contents", {
  id: varchar("id").primaryKey(),
  title: varchar("title").notNull(),
  content: text("content"),
});

export const taskContentRelations = relations(taskContents, ({ one }) => ({
  task: one(tasks, {
    fields: [taskContents.id],
    references: [tasks.taskContentId],
  }),
}));

export const taskStatus = pgTable("task_status", {
  id: integer("id").primaryKey(),
  name: varchar("name").unique().notNull(),
});

export const taskStatusRelations = relations(taskStatus, ({ one }) => ({
  task: one(tasks, {
    fields: [taskStatus.id],
    references: [tasks.taskContentId],
  }),
}));
