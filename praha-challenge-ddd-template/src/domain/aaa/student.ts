import { z } from "zod";
import { ulid } from "../../libs/ulid";
import { StudentStatus } from "./student-status";

export class Student {
  readonly #id: string;
  readonly #name: string;
  readonly #mailAddress: string;
  readonly #studentStatus: StudentStatus;

  private readonly nameSchema = z
    .string()
    .min(1, "name must not be empty")
    .max(100, "name must be less than 100 characters");

  private readonly mailAddressSchema = z.string().email();

  public constructor(
    props:
      | { name: string; mailAddress: string }
      | {
          id: string;
          name: string;
          mailAddress: string;
          studentStatus: string;
        }
  ) {
    const fromData = "id" in props;

    if (fromData) {
      this.#id = props.id;
      this.#name = props.name;
      this.#mailAddress = props.mailAddress;
      this.#studentStatus = new StudentStatus(props.studentStatus);
    } else {
      this.#id = ulid();
      this.#name = this.nameSchema.parse(props.name);
      this.#mailAddress = this.mailAddressSchema.parse(props.mailAddress);
      this.#studentStatus = new StudentStatus();
    }
  }

  public get id() {
    return this.#id;
  }

  public get name() {
    return this.#name;
  }

  public get mailAddress() {
    return this.#mailAddress;
  }

  public get studentStatus() {
    return this.#studentStatus.status;
  }

  public canAssignTeam() {
    return this.#studentStatus.canTeamAssignTeam();
  }

  public setStatus(status: StudentStatusList) {
    this.#studentStatus.status = status;
  }
}
