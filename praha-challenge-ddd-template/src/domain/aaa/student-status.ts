import { z } from "zod";

export type StudentStatusList = "在籍中" | "休会中" | "退会中";

// 参加者の在籍状態
export class StudentStatus {
  #status: StudentStatusList;

  private readonly StatusSchema = z.enum(["在籍中", "休会中", "退会中"]);

  constructor(status?: string) {
    if (status) {
      this.#status = this.StatusSchema.parse(status);
    } else {
      // 初期値は在籍中
      this.#status = "在籍中";
    }
  }

  get status() {
    return this.#status;
  }

  set status(status: StudentStatusList) {
    this.#status = status;
  }

  public canTeamAssignTeam(): boolean {
    return this.#status === "在籍中";
  }
}
