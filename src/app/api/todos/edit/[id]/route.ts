import { type NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import { headers } from "next/headers";

// PATCH /api/todos/edit/[id] - タスク更新
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = (await headers()).get("authorization");

  if (!authHeader) {
    return NextResponse.json(
      { error: "Authorization ヘッダーが見つかりません" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const task = await apiClient.patch(`/todos/edit/${id}`, authHeader, body);
    return NextResponse.json(task);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "タスクの更新に失敗しました" },
      { status: 500 }
    );
  }
}
