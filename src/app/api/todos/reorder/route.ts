import { type NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import { headers } from "next/headers";

// PATCH /api/todos/reorder - タスク並び替え
export async function PATCH(request: NextRequest) {
  const authHeader = (await headers()).get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization ヘッダーが見つかりません" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const result = await apiClient.patch("/todos/reorder", authHeader, body);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "タスクの並び替えに失敗しました" },
      { status: 500 }
    );
  }
}
