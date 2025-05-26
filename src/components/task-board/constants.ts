// 固定のカラム定義
export const COLUMN_DEFINITIONS = [
  { id: "todo", title: "やること" },
  { id: "inprogress", title: "進行中" },
  { id: "done", title: "完了" },
] as const

// 優先度に応じた色設定（ダークモード対応）
export const PRIORITY_COLORS = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export const PRIORITY_LABELS = {
  low: "低",
  medium: "中",
  high: "高",
}
