import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "dotenv/config";
import { createStudentController } from "./presentation/student/create-student-controller";
import { editStudentStatusController } from "./presentation/student/edit-student-status-controller";
import { getStudentListController } from "./presentation/student/get-student-list-controller";
import { addTeamMemberController } from "./presentation/team/add-team-member-controller";
import { getTeamListController } from "./presentation/team/get-team-list-controller";
import { removeTeamMemberController } from "./presentation/team/remove-team-member-controller";
import { getTaskListController } from "./presentation/task/get-task-list-controller";
import { editTaskController } from "./presentation/task/edit-task-controller";

const app = new Hono();

// ヘルスチェック
app.get("/health", (c) =>
  c.json({
    message: "Health Check OK!",
  })
);

// 参加者の一覧取得、新規追加、更新（在籍ステータスを変更できること）
// 参加者の一覧取得
app.route("/", getStudentListController);

// 参加者の新規追加
app.route("/", createStudentController);

// // 参加者の更新（在籍ステータスを変更できること）
app.route("/", editStudentStatusController);

// (管理者)チームの一覧取得、更新（チームに所属する参加者を変更できること）
// チームの一覧取得
app.route("/", getTeamListController);

// チームの更新（チームに所属する参加者を変更できること）
app.route("/", addTeamMemberController);
app.route("/", removeTeamMemberController);

// (生徒)課題の更新（特定の参加者の課題進捗ステータスを変更できること）
app.route("/", editTaskController);

// (管理者)「特定の課題（複数可能）」が「特定の進捗ステータス」になっている参加者の一覧を、10人単位でページングして取得する
app.route("/", getTaskListController);

const port = 3000;
console.log(`Server is running on port ${port}`);

const server = serve({
  fetch: app.fetch,
  port,
});

if (import.meta.hot) {
  // HMR時に同一ポートでサーバーが立ち上がろうとする為、リロードが発生する前にサーバーを閉じる
  import.meta.hot.on("vite:beforeFullReload", () => {
    server.close();
  });
}
