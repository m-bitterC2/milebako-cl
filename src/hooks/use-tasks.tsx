"use client";

import { useState, useEffect } from "react";
import type { Task } from "@/components/task-board/types";
import { ApiError } from "@/lib/api";

// ===== データ変換関数 =====
/** サーバーのデータ形式をクライアント形式に変換 */
const convertApiTaskToTask = (apiTask: any): Task => ({
  id: apiTask.id,
  title: apiTask.title,
  description: apiTask.description || "",
  priority: apiTask.priority.toLowerCase() as "low" | "medium" | "high",
  columnId: apiTask.columnId,
});

/** クライアントのデータ形式をサーバー形式に変換 */
const convertTaskToApiTask = (task: Omit<Task, "id">, position = 0) => ({
  title: task.title,
  description: task.description,
  priority: task.priority.toUpperCase() as "LOW" | "MEDIUM" | "HIGH",
  columnId: task.columnId,
  position,
});

// ===== カスタムフック =====
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isServerConnected, setIsServerConnected] = useState(false);

  /** API呼び出し関数 */
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || `HTTP error! status: ${response.status}`,
        response.status,
        errorData.details
      );
    }

    if (response.status === 204) {
      return null;
    }

    return await response.json();
  };

  /** 初期データ取得 */
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const apiTasks = await apiCall("/api/todos/all");
      const convertedTasks = apiTasks.map(convertApiTaskToTask);

      setTasks(convertedTasks);
      setIsServerConnected(true);
    } catch (err) {
      console.error("タスク取得エラー:", err);
      const errorMessage =
        err instanceof ApiError ? err.message : "タスクの取得に失敗しました";

      setError(errorMessage);
      setTasks([]);
      setIsServerConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  /** タスクの追加 */
  const addTask = async (
    columnId: string,
    taskData: Omit<Task, "id" | "columnId">
  ) => {
    if (!isServerConnected) {
      setError("サーバーに接続できません");
      return;
    }

    try {
      const columnTasks = tasks.filter((task) => task.columnId === columnId);
      const apiTaskData = convertTaskToApiTask(
        { ...taskData, columnId },
        columnTasks.length
      );

      const createdApiTask = await apiCall("/api/todos/create", {
        method: "POST",
        body: JSON.stringify(apiTaskData),
      });

      const newTask = convertApiTaskToTask(createdApiTask);
      setTasks((prev) => [...prev, newTask]);
    } catch (err) {
      const errorMessage =
        err instanceof ApiError ? err.message : "タスクの追加に失敗しました";
      throw new Error(errorMessage);
    }
  };

  /** タスクの更新 */
  const updateTask = async (updatedTask: Task) => {
    if (!isServerConnected) {
      setError("サーバーに接続できません");
      return;
    }

    try {
      setTasks((prev) =>
        prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
      );

      const apiTaskData = convertTaskToApiTask(updatedTask);
      await apiCall(`/api/todos/edit/${updatedTask.id}`, {
        method: "PATCH",
        body: JSON.stringify(apiTaskData),
      });
    } catch (err) {
      setTasks(tasks); // エラー時は元に戻す
      const errorMessage =
        err instanceof ApiError ? err.message : "タスクの更新に失敗しました";
      throw new Error(errorMessage);
    }
  };

  /** タスクの削除 */
  const deleteTask = async (taskId: string) => {
    if (!isServerConnected) {
      setError("サーバーに接続できません");
      return;
    }

    try {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));

      await apiCall(`/api/todos/delete/${taskId}`, {
        method: "DELETE",
      });
    } catch (err) {
      setTasks(tasks); // エラー時は元に戻す
      const errorMessage =
        err instanceof ApiError ? err.message : "タスクの削除に失敗しました";
      throw new Error(errorMessage);
    }
  };

  /** タスクの移動 */
  const moveTask = async (taskId: string, newColumnId: string) => {
    if (!isServerConnected) {
      setError("サーバーに接続できません");
      return;
    }

    try {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId ? { ...task, columnId: newColumnId } : task
        )
      );

      await apiCall(`/api/todos/edit/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ columnId: newColumnId }),
      });
    } catch (err) {
      setTasks(tasks); // エラー時は元に戻す
      const errorMessage =
        err instanceof ApiError ? err.message : "タスクの移動に失敗しました";
      throw new Error(errorMessage);
    }
  };

  /** タスクの並び替え */
  const reorderTasks = async (reorderedTasks: Task[]) => {
    if (!isServerConnected) {
      setError("サーバーに接続できません");
      return;
    }

    try {
      setTasks(reorderedTasks);

      const updatedPositions = reorderedTasks.map((task, index) => ({
        id: task.id,
        position: index,
      }));

      await apiCall("/api/todos/reorder", {
        method: "PATCH",
        body: JSON.stringify({ tasks: updatedPositions }),
      });
    } catch (err) {
      setTasks(tasks); // エラー時は元に戻す
      const errorMessage =
        err instanceof ApiError
          ? err.message
          : "タスクの並び替えに失敗しました";
      throw new Error(errorMessage);
    }
  };

  // ===== 初期化 =====
  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    isServerConnected,
    setTasks,
    setError,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks,
  };
}
