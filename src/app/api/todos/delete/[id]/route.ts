import { type NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";
import { headers } from "next/headers";

// DELETE /api/todos/delete/[id] - タスク削除
export async function DELETE(
  _request: NextRequest,
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
    await apiClient.delete(`/todos/delete/${id}`, authHeader);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      );
    }
    return NextResponse.json(
      { error: "タスクの削除に失敗しました" },
      { status: 500 }
    );
  }
}
