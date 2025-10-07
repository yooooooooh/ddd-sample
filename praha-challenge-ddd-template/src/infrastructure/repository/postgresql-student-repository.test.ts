import "dotenv/config";
import { describe, expect, test, beforeAll, afterAll } from "vitest";
import { PostgresqlStudentRepository } from "./postgresql-student-repository";
import { Student } from "../../domain/student/student";
import { getDatabase } from "../../libs/drizzle/get-database";
import { students } from "../../libs/drizzle/schema";
import { eq } from "drizzle-orm";

describe("PostgresqlStudentRepository (DB統合テスト)", () => {
  const db = getDatabase();
  const repository = new PostgresqlStudentRepository(db);
  const testStudentId = "01TEST0000000000000000000";

  afterAll(async () => {
    // テストデータのクリーンアップ
    await db.delete(students).where(eq(students.id, testStudentId));
  });

  test("学生を保存してIDで取得できる", async () => {
    // 新しい学生を作成
    const student = new Student({
      id: testStudentId,
      name: "テスト太郎",
      mailAddress: "test-integration@example.com",
      enrollmentStatus: "在籍中",
    });

    // DBに保存
    const savedStudent = await repository.save(student);

    // 保存された学生を確認
    expect(savedStudent.id).toBe(testStudentId);
    expect(savedStudent.name).toBe("テスト太郎");
    expect(savedStudent.mailAddress).toBe("test-integration@example.com");
    expect(savedStudent.enrollmentStatus).toBe("在籍中");

    // IDで取得
    const foundStudent = await repository.findById(testStudentId);

    // 取得した学生を確認
    expect(foundStudent).toBeDefined();
    expect(foundStudent?.id).toBe(testStudentId);
    expect(foundStudent?.name).toBe("テスト太郎");
    expect(foundStudent?.mailAddress).toBe("test-integration@example.com");
    expect(foundStudent?.enrollmentStatus).toBe("在籍中");
  });

  test("存在しないIDで取得するとundefinedが返る", async () => {
    const notExistId = "01NOTEXIST0000000000000000";
    const foundStudent = await repository.findById(notExistId);

    expect(foundStudent).toBeUndefined();
  });

  test("学生のステータスを更新できる", async () => {
    // 既存の学生を取得
    const student = await repository.findById(testStudentId);
    expect(student).toBeDefined();

    // ステータスを更新
    student!.setStatus("休会中");

    // DBに保存
    const updatedStudent = await repository.save(student!);

    // 更新された学生を確認
    expect(updatedStudent.enrollmentStatus).toBe("休会中");

    // DBから再取得して確認
    const foundStudent = await repository.findById(testStudentId);
    expect(foundStudent?.enrollmentStatus).toBe("休会中");
  });
});
