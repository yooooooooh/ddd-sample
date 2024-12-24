import { describe, expect, test } from "vitest";
import { Task } from "./task";
import { StudentStatus } from "./student-status";

describe("student-status", () => {
  describe("すべてのプロパティを指定して生徒状態を作成", () => {
    const status = "休会中";
    const studentStatus = new StudentStatus()

    test("指定したプロパティが設定される", () => {
      expect(task.id).toBe(id);
      expect(task.title).toBe(title);
      expect(task.isDone).toBe(done);
    });
  });

  describe("タイトルが空文字の場合", () => {
    const title = "";

    test("エラーが発生する", () => {
      expect(() => new Task({ title })).toThrow("title must not be empty");
    });
  });

  describe("タイトルが100文字を超える場合", () => {
    const title = "a".repeat(101);

    test("エラーが発生する", () => {
      expect(() => new Task({ title })).toThrow(
        "title must be less than 100 characters",
      );
    });
  });

  describe("タイトルを編集する", () => {
    const before = "ご飯を炊く";
    const after = "パスタを茹でる";
    const task = new Task({ title: before });
    task.edit(after);

    test("タイトルが更新される", () => {
      expect(task.title).toBe(after);
    });
  });

  describe("タイトルを空文字に編集する", () => {
    const before = "掃除機をかける";
    const after = "";
    const task = new Task({ title: before });

    test("エラーが発生する", () => {
      expect(() => task.edit(after)).toThrow("title must not be empty");
    });
  });

  describe("タイトルを100文字を超える文字列に編集する", () => {
    const before = "ご飯を炊く";
    const after = "a".repeat(101);
    const task = new Task({ title: before });

    test("エラーが発生する", () => {
      expect(() => task.edit(after)).toThrow(
        "title must be less than 100 characters",
      );
    });
  });

  describe("タスクを完了にする", () => {
    const task = new Task({ title: "洗濯機を回す" });
    task.makeAsDone();

    test("タスクが完了状態になる", () => {
      expect(task.isDone).toBe(true);
    });
  });
});
