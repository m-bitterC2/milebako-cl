"use client"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, GripVertical } from "lucide-react"
import type { Task } from "./types"
import { PRIORITY_COLORS, PRIORITY_LABELS } from "./constants"

// ===== タスクカードコンポーネント =====
interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  // ドラッグ&ドロップ機能のためのフック
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  // ドラッグ中は元のタスクを非表示にして、DragOverlayとの重複を防ぐ
  if (isDragging) {
    return (
      <Card ref={setNodeRef} style={style} className="opacity-0" {...attributes} {...listeners}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-grab active:cursor-grabbing transition-colors hover:shadow-md dark:hover:shadow-lg"
      {...attributes}
      {...listeners}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-gray-900 dark:text-gray-100">{task.title}</CardTitle>
          <div className="flex items-center gap-1">
            {/* 編集ボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // ドラッグイベントとの競合を防ぐ
                onEdit(task)
              }}
              className="h-6 w-6 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Edit className="h-3 w-3" />
            </Button>
            {/* 削除ボタン */}
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // ドラッグイベントとの競合を防ぐ
                onDelete(task.id)
              }}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            {/* ドラッグハンドル */}
            <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
        <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>優先度: {PRIORITY_LABELS[task.priority]}</Badge>
      </CardContent>
    </Card>
  )
}
