import { Student } from "./student";

export type StudentRepositoryInterface = {
  save: (Student: Student) => Promise<Student>;
  findById(id: string): Promise<Student | undefined>;
};
