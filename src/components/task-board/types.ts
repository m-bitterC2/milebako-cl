// ===== 型定義 =====
export interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  columnId: string // "todo" | "inprogress" | "done"
}

// カラム定義（固定）
export interface Column {
  id: string
  title: string
  tasks: Task[]
}
