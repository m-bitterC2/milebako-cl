import { type NextRequest, NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api";

// DELETE /api/todos/delete/[id] - タスク削除
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await apiClient.delete(`/todos/delete/${id}`);
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
