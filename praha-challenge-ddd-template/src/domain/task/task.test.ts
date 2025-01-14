import { describe, expect, test } from "vitest";
import { Task } from "./task";

describe("task", () => {
  const id = "testId";
  const studentId = "testStudentId";
  const status = "未着手";

  describe("すべてのプロパティを指定して作成", () => {
    const task = new Task({id, studentId, status})

    test("指定したプロパティが設定される", () => {
      expect(task.id).toBe(id);
      expect(task.studentId).toBe(studentId);
      expect(task.status).toBe(status);
    });

    test("設定されてるステータス以外だとエラーが発生する", () => {
      const status = "適当";
      expect(() => new Task({id, studentId, status})).toThrow();
    });
  });

  describe("ステータスを更新する場合", () => {
    test("設定されてるステータス以外だとエラーが発生する", () => {
      const task = new Task({id, studentId, status})
      expect(() => task.updateStatus("適当")).toThrow();
    });

    test("「未着手」は、「取組中」にのみ変更できる",()=>{
      const status = "未着手";
      const task = new Task({id, studentId, status})
      task.updateStatus("レビュー待ち");
      task.updateStatus("完了");
      expect(task.status).toBe(status);

      task.updateStatus("取組中");
      expect(task.status).toBe("取組中");
    })

    test("「取組中」は「レビュー待ち」にのみ変更できる",()=>{
      const status = "取組中";
      const task = new Task({id, studentId, status})
      task.updateStatus("未着手");
      task.updateStatus("完了");
      expect(task.status).toBe(status);

      task.updateStatus("レビュー待ち");
      expect(task.status).toBe("レビュー待ち");
    })

    test("「レビュー待ち」は、「未着手」に変更できない",()=>{
      const status = "レビュー待ち";
      const task = new Task({id, studentId, status})
      task.updateStatus("未着手");
      expect(task.status).toBe(status);
    })

    test("「レビュー待ち」は、「取組中」に変更できる",()=>{
      const status = "レビュー待ち";
      const task = new Task({id, studentId, status})
      task.updateStatus("取組中");
      expect(task.status).toBe("取組中");
    })

    test("「レビュー待ち」は、「完了」に変更できる",()=>{
      const status = "レビュー待ち";
      const task = new Task({id, studentId, status})
      task.updateStatus("完了");
      expect(task.status).toBe("完了");
    })

    test("「完了」は変更できない",()=>{
      const status = "完了";
      const task = new Task({id, studentId, status})
      task.updateStatus("未着手");
      task.updateStatus("取組中");
      task.updateStatus("レビュー待ち");
      expect(task.status).toBe("完了");
    })
  });
});
