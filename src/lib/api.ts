// ===== API設定 =====
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// ===== カスタムエラークラス =====
export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: any) {
    super(message);
    this.name = "ApiError";
  }
}

// ===== 共通APIクライアント =====
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // 共通のfetch関数
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });

      // 204 No Content の場合
      if (response.status === 204) {
        return null as T;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || `HTTP error! status: ${response.status}`,
          response.status,
          data.details
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError("予期しないエラーが発生しました", 500);
    }
  }

  // GET リクエスト
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  // POST リクエスト
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PATCH リクエスト
  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE リクエスト
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// ===== APIクライアントのインスタンス =====
export const apiClient = new ApiClient(API_BASE_URL);
