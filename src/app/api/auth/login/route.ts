import { apiClient } from "@/lib/api";
import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await apiClient.post("/auth/login", "", body);
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "ログインに失敗しました" },
      { status: 500 }
    );
  }
}
