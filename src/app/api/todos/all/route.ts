import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";

// GET /api/todos/all - タスク一覧取得
export async function GET() {
  try {
    const tasks = await apiClient.get("/todos/all");
    return NextResponse.json(tasks);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "タスクの取得に失敗しました" },
      { status: 500 }
    );
  }
}
