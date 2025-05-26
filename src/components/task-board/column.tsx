"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import type { Column as ColumnType, Task } from "./types"
import { TaskCard } from "./task-card"

// ===== カラムコンポーネント =====
interface ColumnProps {
  column: ColumnType
  onAddTask: (columnId: string) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

export function Column({ column, onAddTask, onEditTask, onDeleteTask }: ColumnProps) {
  // カラム全体をドロップゾーンとして設定（空のカラムにもドロップ可能）
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 transition-colors ${
        isOver ? "ring-2 ring-blue-500 dark:ring-blue-400" : ""
      }`}
    >
      {/* カラムヘッダー */}
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">{column.title}</h2>
          <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">
            {column.tasks.length}
          </Badge>
        </div>
        {/* タスク追加ボタン */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onAddTask(column.id)}
          className="w-full mt-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Plus className="h-4 w-4 mr-1" />
          タスクを追加
        </Button>
      </div>

      {/* タスクリスト */}
      <div className="p-4 space-y-3 min-h-[200px]">
        <SortableContext items={column.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} onDelete={onDeleteTask} />
          ))}
        </SortableContext>

        {/* 空のカラム用のメッセージ */}
        {column.tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
            ここにタスクをドロップ
          </div>
        )}
      </div>
    </div>
  )
}
