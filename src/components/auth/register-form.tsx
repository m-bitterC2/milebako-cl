"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, UserPlus } from "lucide-react";

interface RegisterFormProps {
  onRegister: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  onLogin: (username: string, password: string) => Promise<void>;
  onSwitchToLogin: () => void;
  isLoading?: boolean;
  error?: string;
}

export function RegisterForm({
  onRegister,
  onSwitchToLogin,
  isLoading = false,
  error,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // パスワード強度チェック
  const passwordStrength = {
    hasMinLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      username.trim() &&
      email.trim() &&
      password &&
      isPasswordValid &&
      passwordsMatch
    ) {
      await onRegister(username.trim(), email.trim(), password);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
          <UserPlus className="h-6 w-6" />
          新規登録
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              ユーザー名
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ユーザー名を入力（3-30文字、英数字_-のみ）"
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              メールアドレス
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              required
              disabled={isLoading}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              パスワード
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="パスワードを入力"
                required
                disabled={isLoading}
                className="w-full pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* パスワード強度インジケーター */}
            {password && (
              <div className="space-y-1 text-xs">
                <div
                  className={`${
                    passwordStrength.hasMinLength
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ✓ 8文字以上
                </div>
                <div
                  className={`${
                    passwordStrength.hasUpperCase
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ✓ 大文字を含む
                </div>
                <div
                  className={`${
                    passwordStrength.hasLowerCase
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ✓ 小文字を含む
                </div>
                <div
                  className={`${
                    passwordStrength.hasNumber
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  ✓ 数字を含む
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              パスワード確認
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="パスワードを再入力"
                required
                disabled={isLoading}
                className="w-full pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            {confirmPassword && !passwordsMatch && (
              <div className="text-xs text-red-600">
                パスワードが一致しません
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              !username.trim() ||
              !email.trim() ||
              !password ||
              !confirmPassword ||
              !isPasswordValid ||
              !passwordsMatch
            }
          >
            {isLoading ? "登録中..." : "新規登録"}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            既にアカウントをお持ちの方は{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
              disabled={isLoading}
            >
              ログイン
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
