import type { StudentRepositoryInterface } from "../../domain/student/student-repository";
import { TeamEditor } from "../../domain/services/team-editor/team-editor";
import type { TeamRepositoryInterface } from "../../domain/team/team-repository";

export type EditStudentStatusUseCaseInput = {
  StudentId: string;
  status: string;
};

export type EditStudentStatusUseCasePayload = {
  Student: {
    id: string;
    name: string;
    mailAddress: string;
    status: string;
  };
  team?: {
    id: string;
    name: string;
    member: string[];
  };
};

export class EditStudentStatusUseCaseNotFoundError extends Error {
  public override readonly name = "EditStudentStatusUseCaseNotFoundError";

  public constructor() {
    super("Student not found");
  }
}

// - 参加者が減る場合（休会・退会）
//  - 参加者が減ることでチームが2名以下になってしまう場合、状況を早期に検知して運営側が解決できるよう**管理者のメールアドレス（今回の課題ではあなたのメールアドレス）宛にメールを送信**する。その際メール文面を見れば「どの参加者が減ったのか」「どのチームが2名以下になったのか」「そのチームの現在の参加者名」が分かるようにする
//     - 参加者が減ることでチームが1名になってしまう場合、残った参加者は**自動的に他のチームに合流する**必要がある
//         - 合流先は最も参加人数が少ないチームから自動的に選ばれる
//             - 参加人数が同じの場合はランダムに選択する
//             - 課題の簡略化のため、合流先の参加者には合流の許諾を得る必要なく、アプリケーションが自動的に（勝手に）チームを組み替えることとする
//         - もし合流可能なチームがない場合は、その旨を管理者にメールして連絡する。その際メール文を見れば「どの参加者が減ったのか」「どの参加者が合流先を探しているのか」が分かるようにしてください
export class EditStudentStatusUseCase {
  public constructor(
    private readonly studentRepository: StudentRepositoryInterface,
    private readonly teamRepository: TeamRepositoryInterface
  ) {}

  public async invoke(
    input: EditStudentStatusUseCaseInput
  ): Promise<EditStudentStatusUseCasePayload> {
    const student = await this.studentRepository.findById(input.StudentId);

    if (!student) {
      throw new EditStudentStatusUseCaseNotFoundError();
    }

    // inputのステータスが変わらない場合
    if (input.status === student.enrollmentStatus) {
      throw new EditStudentStatusUseCaseNotFoundError();
    }

    // ステータスを設定
    student.setStatus(input.status);

    const teamCreator = new TeamEditor(
      this.studentRepository,
      this.teamRepository
    );

    // 復帰する場合
    return student.enrollmentStatus === "在籍中"
      ? await teamCreator.create(student)
      : await teamCreator.reduceMember(student);
  }
}
