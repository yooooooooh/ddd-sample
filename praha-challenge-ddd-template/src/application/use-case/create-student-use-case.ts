import { Student } from "../../domain/student/student";
import type { StudentRepositoryInterface } from "../../domain/student/student-repository";
import { TeamEditor } from "../../domain/services/team-editor/team-editor";
import type { TeamRepositoryInterface } from "../../domain/team/team-repository";

export type CreateStudentUseCaseInput = {
  name: string;
  mailAddress: string;
};

export type CreateStudentUseCasePayload = {
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

export class CreateStudentUseCase {
  public constructor(
    private readonly studentRepository: StudentRepositoryInterface,
    private readonly teamRepository: TeamRepositoryInterface
  ) {}

  public async invoke(
    input: CreateStudentUseCaseInput
  ): Promise<CreateStudentUseCasePayload> {
    const teamCreator = new TeamEditor(
      this.studentRepository,
      this.teamRepository
    );

    return await teamCreator.create(new Student(input));
  }
}
