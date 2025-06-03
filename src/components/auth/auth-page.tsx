"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { RegisterForm } from "./register-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, isLoading, error } = useAuth();
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    const result = await login(username, password);
    result && router.push("/");
  };

  const handleRegister = async (
    username: string,
    email: string,
    password: string
  ) => {
    const result = await register(username, email, password);
    result && router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {isLogin ? (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setIsLogin(false)}
            isLoading={isLoading}
            error={error || undefined}
          />
        ) : (
          <RegisterForm
            onRegister={handleRegister}
            onLogin={handleLogin}
            onSwitchToLogin={() => setIsLogin(true)}
            isLoading={isLoading}
            error={error || undefined}
          />
        )}
      </div>
    </div>
  );
}
