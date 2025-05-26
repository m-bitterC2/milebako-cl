import type { Task, Column } from "./types"
import { COLUMN_DEFINITIONS } from "./constants"

// ===== ユーティリティ関数 =====
// タスクをカラム別にグループ化する関数
export const groupTasksByColumn = (tasks: Task[]): Column[] => {
  return COLUMN_DEFINITIONS.map((columnDef) => ({
    id: columnDef.id,
    title: columnDef.title,
    tasks: tasks.filter((task) => task.columnId === columnDef.id),
  }))
}
