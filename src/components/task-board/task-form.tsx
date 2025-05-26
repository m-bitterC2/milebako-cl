"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task } from "./types";
import { COLUMN_DEFINITIONS } from "./constants";

// ===== タスク作成・編集フォームコンポーネント =====
interface TaskFormProps {
  task?: Task; // 編集時のみ渡される
  onSave: (task: Omit<Task, "id" | "columnId">, columnId?: string) => void;
  onCancel: () => void;
  showColumnSelect?: boolean; // カラム選択を表示するかどうか
}

export function TaskForm({
  task,
  onSave,
  onCancel,
  showColumnSelect = false,
}: TaskFormProps) {
  // フォームの状態管理
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(
    task?.priority || "medium"
  );
  const [columnId, setColumnId] = useState(task?.columnId || "todo");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(
        { title, description, priority },
        showColumnSelect ? columnId : undefined
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          placeholder="タスクタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
      <div>
        <Textarea
          placeholder="説明"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="dark:bg-gray-800 dark:border-gray-700"
        />
      </div>
      <div>
        <Select
          value={priority}
          onValueChange={(value: "low" | "medium" | "high") =>
            setPriority(value)
          }
        >
          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
            <SelectValue placeholder="優先度を選択" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">優先度: 低</SelectItem>
            <SelectItem value="medium">優先度: 中</SelectItem>
            <SelectItem value="high">優先度: 高</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* カラム選択（編集時のみ表示） */}
      {showColumnSelect && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            移動先
          </label>
          <Select value={columnId} onValueChange={setColumnId}>
            <SelectTrigger className="dark:bg-gray-800 dark:border-gray-700">
              <SelectValue placeholder="移動先を選択" />
            </SelectTrigger>
            <SelectContent>
              {COLUMN_DEFINITIONS.map((column) => (
                <SelectItem key={column.id} value={column.id}>
                  {column.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {task ? "更新" : "追加"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
