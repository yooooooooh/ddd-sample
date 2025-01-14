import { eq } from "drizzle-orm";
import type { Database } from "../../libs/drizzle/get-database";
import { students, teams, teamMember } from "../../libs/drizzle/schema";
import {
  TeamListQueryServiceInterface,
  TeamListQueryServicePayload,
} from "../../application/query-service/team-list-query-service";

export class PostgresqlTeamListQueryService
  implements TeamListQueryServiceInterface
{
  public constructor(private readonly database: Database) {}

  public async invoke(): Promise<TeamListQueryServicePayload> {
    const data = await this.database
      .select({
        id: teams.id,
        name: teams.name,
        student: {
          id: students.id,
          name: students.name,
          mailAddress: students.mailAddress,
        },
      })
      .from(teamMember)
      .innerJoin(teams, eq(teamMember.teamId, teams.id))
      .innerJoin(students, eq(teamMember.studentId, students.id));

    return data.reduce<
      {
        id: string;
        team: string;
        member: {
          id: string;
          name: string;
          mailAddress: string;
        }[];
      }[]
    >((acc, { id, name, student }) => {
      const index = acc.findIndex((obj) => obj.id === id);

      if (index === -1) {
        acc.push({ id: id, team: name, member: [student] });
      } else {
        acc[index]?.member.push(student);
      }

      return acc;
    }, []);
  }
}
