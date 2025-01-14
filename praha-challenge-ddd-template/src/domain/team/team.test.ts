import { describe, expect, test } from "vitest";
import { Team } from "./team";
import { z } from "zod";

describe("team", () => {
  const id = "testId";
  const name = "a";
  const member = ["member1", "member2", "member3", "member4"]

  describe("すべてのプロパティを指定して作成", () => {
    const team = new Team({id, name, member})

    test("指定したプロパティが設定される", () => {
      expect(team.id).toBe(id);
      expect(team.name).toBe(name);
      expect(team.member).toStrictEqual(member);
    });
  });

  describe("プロパティ一部なしで生成する場合", () => {
    const team = new Team({name, member})

    test("idがulidで生成される", () => {
      const generated = team.id;
      const isUlid = z.string().ulid().safeParse(generated);

      expect(isUlid.success).toBe(true);
    });

    test("指定したプロパティが設定される", () => {
      expect(team.name).toBe(name);
      expect(team.member).toStrictEqual(member);
    });

    test("名前がa-z以外の場合、エラーが発生する", () => {
      const name = "AAAA";
      expect(() => new Team({name, member})).toThrow();
    });
  });

  describe("チームメンバーが追加可能か確認する場合", () => {
    test("メンバーが2人の場合はtrueになる", () => {
      const member = ["member1", "member2"]
      const team = new Team({id, name, member})
      expect(team.getMaxAssignTeamMember()).toBeTruthy();
    });

    test("メンバーが3人はtrueになる", () => {
      const member = ["member1", "member2", "member3"]
      const team = new Team({id, name, member})
      expect(team.getMaxAssignTeamMember()).toBeTruthy();
    });

    test("メンバーが4人はfalseになる", () => {
      const member = ["member1", "member2", "member3", "member4"]
      const team = new Team({id, name, member})
      expect(team.getMaxAssignTeamMember()).toBeFalsy();
    });
  });

  describe("チームメンバーを登録する場合", () => {
    const id = "testId";
    const name = "a";
    const member = ["member1", "member2", "member3"]

    test("生徒が存在しない場合は追加できる", () => {
      const team = new Team({id, name, member})
      team.addMember("member4")
      expect(team.member).toStrictEqual(["member1","member2", "member3", "member4"]);
    });

    test("生徒が存在する場合はエラーになる", () => {
      const team = new Team({id, name, member})
      expect(() => team.addMember("member1")).toThrow("登録済みの生徒です。");
    });
  });

  describe("チームメンバーを削除する場合", () => {
    const id = "testId";
    const name = "a";
    const member = ["member1", "member2", "member3"]

    test("生徒が存在する場合は削除できる", () => {
      const team = new Team({id, name, member})
      team.removeMember("member1")
      expect(team.member).toStrictEqual(["member2", "member3"]);
    });

    test("生徒が存在しない場合はエラーになる", () => {
      const team = new Team({id, name, member})
      expect(() => team.removeMember("幻の生徒")).toThrow("存在しない生徒です。");
    });
  });
});
