import { z } from "zod";
import { ulid } from "../../libs/ulid";

export class Student {
  readonly #id: string;
  readonly #name: string;
  readonly #mailAddress: string;
  #enrollmentStatus: "在籍中" | "休会中" | "退会中";

  private readonly nameSchema = z
    .string()
    .min(1, "name must not be empty")
    .max(100, "name must be less than 100 characters");

  private readonly mailAddressSchema = z.string().email();

  private readonly statusSchema = z.enum(["在籍中", "休会中", "退会中"]);

  public constructor(
    props:
      | { name: string; mailAddress: string }
      | {
          id: string;
          name: string;
          mailAddress: string;
          enrollmentStatus: string;
        }
  ) {
    const fromData = "id" in props;

    if (fromData) {
      this.#id = props.id;
      this.#name = props.name;
      this.#mailAddress = props.mailAddress;
      this.#enrollmentStatus = this.statusSchema.parse(props.enrollmentStatus);
    } else {
      this.#id = ulid();
      this.#name = this.nameSchema.parse(props.name);
      this.#mailAddress = this.mailAddressSchema.parse(props.mailAddress);
      this.#enrollmentStatus = "在籍中";
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

  public get enrollmentStatus() {
    return this.#enrollmentStatus;
  }

  public setStatus(status: string): void {
    this.#enrollmentStatus = this.statusSchema.parse(status);
  }
}
