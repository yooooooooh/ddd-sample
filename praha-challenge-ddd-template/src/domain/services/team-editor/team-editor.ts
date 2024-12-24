import { Student } from "../../aaa/student";
import { StudentRepositoryInterface } from "../../aaa/student-repository";
import { Team } from "../../team/team";
import type { TeamRepositoryInterface } from "../../team/team-repository";

export class TeamEditor {
  public constructor(
    private readonly StudentRepository: StudentRepositoryInterface,
    private readonly teamRepository: TeamRepositoryInterface
  ) {}

  // 最も参加人数が少ないチームを取得する
  private async getMinMemberTeam() {
    // 全てのチームメンバーの人数を取得
    const teams = await this.teamRepository.getAllTeam();

    console.log(teams);

    // 最も参加人数が少ないチームのメンバー数
    const minMemberTeamLength = teams.reduce<number>(
      (acc, currentValue) =>
        acc < currentValue.member.length ? acc : currentValue.member.length,
      Number.MAX_SAFE_INTEGER
    );

    console.log(minMemberTeamLength);

    // 最も参加人数が少ないチームを取得
    const mimMemberTeams = teams.filter(
      (team) => team.member.length === minMemberTeamLength
    );

    console.log(mimMemberTeams);

    // 最も参加人数が少ないチームが2つ以上ある場合
    if (mimMemberTeams.length >= 2) {
      // 配列からランダムに選ぶためのインデックス
      const randomIndex = Math.floor(Math.random() * mimMemberTeams.length);
      // ランダムに選ばれたチーム
      return mimMemberTeams[randomIndex];
    }

    // その他
    return mimMemberTeams[0];
  }

  private async getNewTeamName() {
    // 全てのチームメンバーの人数を取得
    const teams = await this.teamRepository.getAllTeam();

    // 全てのチーム名を取得
    const teamNames = teams.reduce<string[]>((acc, currentValue) => {
      acc.push(currentValue.name);
      return acc;
    }, []);

    // アルファベットの配列を作成
    const alphabets = Array.apply(null, new Array(26)).map((_, i) => {
      return String.fromCharCode("a".charCodeAt(0) + i);
    }, {});

    // 名付け可能なチーム名を取得
    const availableTeamNames = alphabets.filter((value) =>
      teamNames.includes(value)
    );

    // 名付け可能なチーム名がない場合
    if (typeof availableTeamNames[0] === "undefined") {
      throw new Error("チームが作成できません");
    }

    return availableTeamNames[0];
  }

  // チームを分割して保存する
  private async splitTeam(team: Team) {
    // 3人を取得
    const splitTeamMember = team.member.slice(0, 3);
    // 3人を脱退
    for (const memberId of splitTeamMember) {
      team.removeMember(memberId);
    }

    // 新しいチーム名の取得
    const getNewTeamName = await this.getNewTeamName();

    const newTeam = new Team({
      name: getNewTeamName,
      member: splitTeamMember,
    });

    return { newTeam, StudentTeam: team };
  }

  private async assignTeam(Student: Student) {
    try {
      // もっとも参加人数が少ないチームを取得
      const minMemberTeam = await this.getMinMemberTeam();

      // チームがない場合
      if (typeof minMemberTeam === "undefined") {
        throw new Error("参加人数が少ないチームが存在しません。");
      }

      // チームに参加させる
      minMemberTeam.addMember(Student.id);

      // チームが５名になった場合
      if (minMemberTeam.member.length >= 5) {
        const { newTeam, StudentTeam } = await this.splitTeam(minMemberTeam);
        // 新しいチームを保存
        await this.teamRepository.save(newTeam);

        // チームを保存する
        const saveTeam = await this.teamRepository.save(StudentTeam);
        return saveTeam;
      }

      // チームを保存する
      const saveTeam = await this.teamRepository.save(minMemberTeam);
      return saveTeam;
    } catch (error) {
      // もし合流可能なチームがない場合は、その旨を管理者にメールして連絡する。
      // その際メール文を見れば「どの参加者が合流先を探しているのか」が分かるようにしてください
      console.log(error);
      console.log("sendMail: youさんにメールを送信しました");
      console.log(
        "sendMail:",
        `合流先を探してる参加者: ID:${Student.id} 名前：${Student.name}`
      );
    }
  }

  public async create(Student: Student) {
    // 参加者の保存
    const savedStudent = await this.StudentRepository.save(Student);

    // チームへの参加
    const assignTeam = await this.assignTeam(savedStudent);
    const StudentData = {
      id: savedStudent.id,
      name: savedStudent.name,
      mailAddress: savedStudent.mailAddress,
      status: savedStudent.studentStatus,
    };

    return assignTeam
      ? {
          Student: StudentData,
          team: {
            id: assignTeam.id,
            name: assignTeam.name,
            member: assignTeam.member,
          },
        }
      : {
          Student: StudentData,
        };
  }

  public async reduceMember(Student: Student) {
    // 参加者の保存
    const savedStudent = await this.StudentRepository.save(Student);

    const StudentData = {
      id: savedStudent.id,
      name: savedStudent.name,
      mailAddress: savedStudent.mailAddress,
      status: savedStudent.studentStatus,
    };

    // 参加者のチームを取得
    const team = await this.teamRepository.findByStudentId(Student.id);

    // チームがない場合
    if (!team) throw new Error("チームがありません");

    // チームから削除
    team.removeMember(Student.id);

    //  参加者が減ることでチームが2名以下になってしまう場合
    if (team.member.length <= 2) {
      // 状況を早期に検知して運営側が解決できるよう管理者のメールアドレス（今回の課題ではあなたのメールアドレス）宛にメールを送信する。
      // その際メール文面を見れば「どの参加者が減ったのか」「どのチームが2名以下になったのか」「そのチームの現在の参加者名」が分かるようにする
      console.log("sendMail: youさんにメールを送信しました");
      console.log(
        "sendMail:",
        `減った参加者: ID:${Student.id} 名前：${Student.name}`
      );
      console.log(
        "sendMail:",
        `減ったチーム: ID:${team.id} 名前：${team.name}`
      );
      for (const memberId in team.member) {
        const Student = await this.StudentRepository.findById(memberId);
        console.log(
          "sendMail:",
          `現在の参加者: ID:${Student?.id} 名前：${Student?.name}`
        );
      }
      // 参加者が減ることでチームが1名になってしまう場合、残った参加者は**自動的に他のチームに合流する**必要がある
      if (team.member[0] && team.member.length === 1) {
        const Student = await this.StudentRepository.findById(team.member[0]);

        // チームがない場合
        if (!Student) throw new Error("存在しない参加者です。");

        // チームへの参加
        await this.assignTeam(Student);
      }
    }

    return {
      Student: StudentData,
    };
  }
}
