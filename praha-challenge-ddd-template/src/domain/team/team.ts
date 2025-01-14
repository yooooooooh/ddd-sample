import { ulid } from "ulid";
import { z } from "zod";

// TODO: チームの名前は重複不可
export class Team {
  readonly #id: string;
  readonly #name: string;
  readonly #member: string[];
  readonly MIN_TEAM_MEMBER = 2;
  readonly MAX_TEAM_MEMBER = 4;

  private readonly nameSchema = z.custom<string>((value) => {
    if (typeof value !== "string") {
      return false;
    }
    return /^[a-z]/.test(value);
  });

  public constructor(
    props:
      | { name: string; member: string[] }
      | { id: string; name: string; member: string[] },
  ) {
    const fromData = "id" in props;

    if (fromData) {
      this.#id = props.id;
      this.#name = props.name;
      this.#member = props.member;
    } else {
      this.#id = ulid();
      this.#name = this.nameSchema.parse(props.name);
      this.#member = props.member;
    }
  }

  public get id() {
    return this.#id;
  }

  public get name() {
    return this.#name;
  }

  public get member() {
    return this.#member;
  }

  public getMaxAssignTeamMember() {
    return this.#member.length < this.MAX_TEAM_MEMBER;
  }

  public addMember(id: string) {
    if (this.#member.includes(id)) {
      throw new Error("登録済みの生徒です。");
    }

    this.#member.push(id);
  }

  public removeMember(id: string) {
    const index = this.#member.indexOf(id);

    if (index === -1) {
      throw new Error("存在しない生徒です。");
    }

    this.#member.splice(index, 1);
  }
}
