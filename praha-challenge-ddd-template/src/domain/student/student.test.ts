import { describe, expect, test } from "vitest";
import { Student } from "./student";
import { z } from "zod";

describe("student", () => {
  const id = "testId";
  const name = "testName";
  const mailAddress = "testAddress@test.com";
  const enrollmentStatus = "在籍中";

  describe("すべてのプロパティを指定して作成", () => {
    const student = new Student({id, name, mailAddress, enrollmentStatus})

    test("指定したプロパティが設定される", () => {
      expect(student.id).toBe(id);
      expect(student.name).toBe(name);
      expect(student.mailAddress).toBe(mailAddress);
      expect(student.enrollmentStatus).toBe(enrollmentStatus);
    });

    test("ステータスが異常な文字の場合、エラーが発生する", () => {
      const enrollmentStatus = "適当";
      expect(() => new Student({id, name, mailAddress, enrollmentStatus})).toThrow();
    });
  });

  describe("プロパティ一部なしで生成する場合", () => {
    const student = new Student({name, mailAddress})


    test("idがulidで生成される", () => {
      const generated = student.id;
      const isUlid = z.string().ulid().safeParse(generated);

      expect(isUlid.success).toBe(true);
    });

    test("指定したプロパティが設定される", () => {
      expect(student.name).toBe(name);
      expect(student.mailAddress).toBe(mailAddress);
    });

    test("ステータスは在籍中になる", () => {
      expect(student.enrollmentStatus).toBe("在籍中");
    });

    test("名前が空文字の場合、エラーが発生する", () => {
      const name = "";
      expect(() => new Student({name, mailAddress})).toThrow("name must not be empty");
    });

    test("名前が100文字以上の場合、エラーが発生する", () => {
      const name = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
      expect(() => new Student({name, mailAddress})).toThrow("name must be less than 100 characters");
    });

    test("メルアドの形式が以上な場合、エラーが発生する", () => {
      const mailAddress = "test";
      expect(() => new Student({name, mailAddress})).toThrow();
    });
  });

  describe("在籍状況を更新する場合", () => {
    const student = new Student({id, name, mailAddress, enrollmentStatus})

    test("正常に更新できる", () => {
      const enrollmentStatus = "休会中";
      student.setStatus(enrollmentStatus);
      expect(student.enrollmentStatus).toBe(enrollmentStatus);
    });

    test("ステータスが異常な文字の場合、エラーが発生する", () => {
      const enrollmentStatus = "適当";
      expect(() => student.setStatus(enrollmentStatus)).toThrow();
    });
  });
});
