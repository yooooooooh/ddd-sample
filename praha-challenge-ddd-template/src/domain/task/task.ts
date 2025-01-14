import { z } from "zod";

export class Task {
  readonly #id: string;
  readonly #studentId: string;
  #status: "未着手" | "取組中" | "レビュー待ち" | "完了";

  private readonly statusSchema = z.enum(["未着手" , "取組中" , "レビュー待ち" , "完了"]);

  public constructor(
    props: {
          id: string;
          studentId: string;
          status: string;
        }
  ) {
    this.#id = props.id;
    this.#studentId = props.studentId;
    this.#status = this.statusSchema.parse(props.status);
  }

  public get id() {
    return this.#id;
  }

  public get studentId() {
    return this.#studentId;
  }

  public get status() {
    return this.#status;
  }

  public updateStatus(taskStatus: string): void {
    // バリデーション
    const updateStatus = this.statusSchema.parse(taskStatus)

    // - 「完了」は変更できない
    if (this.#status === "完了") return;

    if (
      // - 「未着手」は、「取組中」にのみ変更できる
      (this.#status === "未着手" && updateStatus === "取組中") ||
      // - 「取組中」は「レビュー待ち」にのみ変更できる
      (this.#status === "取組中" && updateStatus === "レビュー待ち") ||
      // - 「レビュー待ち」は、「取組中」もしくは「完了」に変更できる
      (this.#status === "レビュー待ち" &&
        (taskStatus === "取組中" || updateStatus === "完了"))
    ) {
      this.#status = updateStatus;
      return;
    }

    console.log(`タスクが変更できません。`);
    console.log(`現在のステータス:${this.#status}`);
    console.log(`変更のステータス:${taskStatus}`);
  }
}
