import { type NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import { headers } from "next/headers";

// POST /api/todos/create - タスク作成
export async function POST(request: NextRequest) {
  const authHeader = (await headers()).get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization ヘッダーが見つかりません" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const task = await apiClient.post("/todos/create", authHeader, body);
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
