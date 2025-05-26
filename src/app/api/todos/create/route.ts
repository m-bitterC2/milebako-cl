import { type NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";

// POST /api/todos/create - タスク作成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = await apiClient.post("/todos/create", body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "タスクの作成に失敗しました" },
      { status: 500 }
    );
  }
}
