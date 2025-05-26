"use client";

import { useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ThemeToggle } from "../theme-toggle";
import type { Task } from "./types";
import { COLUMN_DEFINITIONS } from "./constants";
import { groupTasksByColumn } from "./utils";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { Column } from "./column";
import { useTasks } from "@/hooks/use-tasks";

// ===== メインのタスクボードコンポーネント =====
export default function TaskBoard() {
  // ===== カスタムフック使用 =====
  const {
    tasks,
    isLoading,
    error,
    isServerConnected,
    setError,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
  } = useTasks();

  // ===== 状態管理 =====
  const [activeTask, setActiveTask] = useState<Task | null>(null); // ドラッグ中のタスク
  const [editingTask, setEditingTask] = useState<Task | null>(null); // 編集中のタスク
  const [isAddingTask, setIsAddingTask] = useState<string | null>(null); // タスク追加中のカラムID

  // タスクをカラム別にグループ化
  const columns = groupTasksByColumn(tasks);

  // ===== ドラッグ&ドロップのセンサー設定 =====
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px移動でドラッグ開始
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms長押しでドラッグ開始（スクロールとの競合を防ぐ）
        tolerance: 5, // 5pxの許容範囲
      },
    })
  );

  /** ドラッグ開始時の処理 */
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((task) => task.id === active.id);
    setActiveTask(task || null);
  };

  /** ドラッグ終了時の処理 */
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return; // ドロップ先がない場合は何もしない

    const activeTaskId = active.id as string;
    const overTaskId = over.id as string;

    const activeTask = tasks.find((task) => task.id === activeTaskId);
    if (!activeTask) return;

    try {
      // ケース1: カラムにドロップした場合
      const overColumn = COLUMN_DEFINITIONS.find(
        (col) => col.id === overTaskId
      );
      if (overColumn && activeTask.columnId !== overColumn.id) {
        await moveTask(activeTaskId, overColumn.id);
        return;
      }

      // ケース2: 他のタスクにドロップした場合
      const overTask = tasks.find((task) => task.id === overTaskId);
      if (!overTask) return;

      if (activeTask.columnId === overTask.columnId) {
        // 同じカラム内での並び替え
        const columnTasks = tasks.filter(
          (task) => task.columnId === activeTask.columnId
        );
        const activeIndex = columnTasks.findIndex(
          (task) => task.id === activeTaskId
        );
        const overIndex = columnTasks.findIndex(
          (task) => task.id === overTaskId
        );

        const reorderedColumnTasks = arrayMove(
          columnTasks,
          activeIndex,
          overIndex
        );
        const otherTasks = tasks.filter(
          (task) => task.columnId !== activeTask.columnId
        );
        const newTasks = [...otherTasks, ...reorderedColumnTasks];

        await reorderTasks(newTasks);
      } else {
        // 異なるカラム間での移動
        await moveTask(activeTaskId, overTask.columnId);
      }
    } catch (err) {
      console.error("ドラッグ&ドロップエラー:", err);
      alert(err instanceof Error ? err.message : "操作に失敗しました");
    }
  };

  /** タスク追加ハンドラー */
  const handleAddTask = async (
    columnId: string,
    taskData: Omit<Task, "id" | "columnId">
  ) => {
    try {
      await addTask(columnId, taskData);
      setIsAddingTask(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "タスクの追加に失敗しました");
    }
  };

  /** タスク更新ハンドラー */
  const handleUpdateTask = async (
    taskData: Omit<Task, "id" | "columnId">,
    newColumnId?: string
  ) => {
    if (!editingTask) return;

    try {
      const updatedTask: Task = {
        ...editingTask,
        ...taskData,
        columnId: newColumnId || editingTask.columnId,
      };

      await updateTask(updatedTask);
      setEditingTask(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : "タスクの更新に失敗しました");
    }
  };

  /** タスク削除ハンドラー */
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (err) {
      alert(err instanceof Error ? err.message : "タスクの削除に失敗しました");
    }
  };

  // ===== ローディング・エラー状態 =====
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center gap-2">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-tight">
            Milebako
          </h1>
          <h2 className="text-slate-800 dark:text-slate-200 tracking-tight">
            － 今日やること、ここで見える化 －
          </h2>
        </div>
        <div className="relative w-20 h-20">
          {/* 外側の回転リング */}
          <div className="w-20 h-20 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin"></div>
          {/* 内側のパルス・円 */}
          <div className="absolute inset-3 w-14 h-14 bg-blue-500/20 rounded-full animate-pulse"></div>
          <div className="absolute inset-6 w-8 h-8 bg-blue-500 rounded-full animate-ping"></div>
        </div>
        <div className="space-y-2">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            コンテンツを読み込んでいます...
          </p>
        </div>
      </div>
    );
  }

  // ===== レンダリング =====
  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              Milebako
            </h1>
            {/* サーバー接続状態表示 */}
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isServerConnected ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isServerConnected ? "サーバー接続中" : "オフライン"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTasks}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              更新
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-red-700 dark:text-red-300">
                <strong>接続エラー:</strong> {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
              >
                ✕
              </button>
            </div>
            <div className="mt-2 text-sm text-red-600 dark:text-red-400">
              サーバーが起動していない場合は、以下のコマンドで起動してください：
              <br />
              <code className="bg-red-200 dark:bg-red-800 px-2 py-1 rounded">
                npm run dev
              </code>{" "}
              (サーバーディレクトリで実行)
            </div>
          </div>
        )}

        {/* ドラッグ&ドロップコンテキスト */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* カラムグリッド */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                onAddTask={setIsAddingTask}
                onEditTask={setEditingTask}
                onDeleteTask={handleDeleteTask}
              />
            ))}
          </div>

          {/* ドラッグ中のタスクを表示するオーバーレイ */}
          <DragOverlay>
            {activeTask ? (
              <div className="rotate-3 scale-105">
                <TaskCard
                  task={activeTask}
                  onEdit={() => {}}
                  onDelete={() => {}}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* タスク追加ダイアログ */}
        <Dialog
          open={!!isAddingTask}
          onOpenChange={() => setIsAddingTask(null)}
        >
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">
                新しいタスクを追加
              </DialogTitle>
            </DialogHeader>
            {isAddingTask && (
              <TaskForm
                onSave={(taskData) => handleAddTask(isAddingTask, taskData)}
                onCancel={() => setIsAddingTask(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* タスク編集ダイアログ */}
        <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
          <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">
                タスクを編集
              </DialogTitle>
            </DialogHeader>
            {editingTask && (
              <TaskForm
                task={editingTask}
                onSave={handleUpdateTask}
                onCancel={() => setEditingTask(null)}
                showColumnSelect={true} // 編集時はカラム選択を表示
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
