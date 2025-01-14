//「特定の課題（複数可能）」が
//「特定の進捗ステータス」になっていて
//「在籍中」になっている
// 参加者の一覧を、
// 10人単位でページングして取得する
export type TaskListQueryServicePayload = {
  students: {
    name: string;
  }[];
  nextPage: number;
};

export interface TaskListQueryServiceInterface {
  invoke: (value: {
    taskId: string;
    taskStatus: string;
    page?: number | undefined;
  }) => Promise<TaskListQueryServicePayload>;
}
