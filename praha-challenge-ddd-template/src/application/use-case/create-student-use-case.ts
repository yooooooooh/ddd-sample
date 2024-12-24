import { Student } from "../../domain/aaa/student";
import type { StudentRepositoryInterface } from "../../domain/aaa/student-repository";
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
    private readonly StudentRepository: StudentRepositoryInterface,
    private readonly teamRepository: TeamRepositoryInterface
  ) {}

  public async invoke(
    input: CreateStudentUseCaseInput
  ): Promise<CreateStudentUseCasePayload> {
    const teamCreator = new TeamEditor(
      this.StudentRepository,
      this.teamRepository
    );

    return await teamCreator.create(new Student(input));
  }
}
