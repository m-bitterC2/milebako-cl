"use client";

import { useRouter } from "next/navigation";
import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  useMemo,
  useCallback,
} from "react";

// ===== 型定義 =====
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isServerConnected: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
}

// ===== Context作成 =====
const AuthContext = createContext<AuthContextType | null>(null);

// ===== AuthProvider =====
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isServerConnected, setIsServerConnected] = useState(true);
  const router = useRouter();

  // ===== API呼び出し関数 =====
  const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      // サーバーが応答した場合は接続状態を更新
      setIsServerConnected(true);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (err) {
      // ネットワークエラーまたはサーバー無応答の場合
      if (err instanceof TypeError && err.message.includes("fetch")) {
        setIsServerConnected(false);
        throw new Error(
          "サーバーに接続できません。サーバーが起動していない可能性があります。"
        );
      }
      throw err;
    }
  };

  // ===== 認証情報をローカルストレージに保存 =====
  const saveAuthToCookies = useCallback((user: User, token: string) => {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
  }, []);

  // ===== 認証情報をローカルストレージから削除 =====
  const clearAuthFromCookies = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  }, []);

  // ===== 認証関数 =====
  const login = useCallback(
    async (username: string, password: string) => {
      clearError();
      try {
        setIsLoading(true);
        setError(null);

        const data = await apiCall("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });

        setUser(data.user);
        setToken(data.token);
        saveAuthToCookies(data.user, data.token);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "ログインに失敗しました");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthToCookies]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      clearError();
      try {
        setIsLoading(true);
        setError(null);

        const data = await apiCall("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, email, password }),
        });

        setUser(data.user);
        setToken(data.token);
        saveAuthToCookies(data.user, data.token);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "登録に失敗しました");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [saveAuthToCookies]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setError(null);
    clearAuthFromCookies();
  }, [clearAuthFromCookies]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ===== 初期化（クライアントサイドでのフォールバック） =====
  useEffect(() => {
    // サーバーサイドで初期化されていない場合のフォールバック
    if (!user && !token) {
      const savedToken = localStorage.getItem("auth_token");
      const savedUser = localStorage.getItem("auth_user");

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error("Failed to restore auth from localStorage:", error);
          clearAuthFromCookies();
        }
      } else {
        router.push("/auth");
      }
    }
  }, [user, token, clearAuthFromCookies]);

  const contextValue: AuthContextType = useMemo(
    () => ({
      user,
      token,
      isLoading,
      error,
      isServerConnected,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, error, isServerConnected, login, register, logout]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// ===== カスタムフック =====
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
