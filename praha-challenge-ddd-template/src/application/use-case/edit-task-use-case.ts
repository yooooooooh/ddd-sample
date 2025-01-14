import type { TaskRepositoryInterface } from "../../domain/task/task-repository";

export type EditTaskUseCaseInput = {
  taskId: string;
  studentId: string;
  taskStatus: "未着手" | "取組中" | "レビュー待ち" | "完了";
};

export type EditTaskUseCasePayload = {
  taskId: string;
  studentId: string;
  taskStatus: "未着手" | "取組中" | "レビュー待ち" | "完了";
};

export class EditTaskUseCaseNotFoundError extends Error {
  public override readonly name = "EditTaskUseCaseNotFoundError";

  public constructor() {
    super("task not found");
  }
}

export class EditTaskUseCase {
  public constructor(
    private readonly taskRepository: TaskRepositoryInterface
  ) {}

  public async invoke(
    input: EditTaskUseCaseInput
  ): Promise<EditTaskUseCasePayload> {
    const task = await this.taskRepository.findById(
      input.taskId,
      input.studentId
    );

    if (!task) {
      throw new EditTaskUseCaseNotFoundError();
    }

    task.updateStatus(input.taskStatus);

    const savedTask = await this.taskRepository.save(task);

    return {taskId: savedTask.id, studentId: task.studentId, taskStatus: savedTask.status};
  }
}
