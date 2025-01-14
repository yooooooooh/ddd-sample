import type { Task } from "./task";

export type TaskRepositoryInterface = {
  save: (task: Task) => Promise<Task>;
  findById(taskId: string, studentId: string): Promise<Task | undefined>;
};
