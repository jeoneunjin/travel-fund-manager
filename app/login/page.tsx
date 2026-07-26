"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PageShell } from "@/components/site-header";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);

  return (
    <PageShell className="flex min-h-[calc(100vh-3.5rem)] max-w-md items-center justify-center py-10">
      <div className="w-full space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Compass className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight">트래블펀드</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            함께 모으고, 함께 쓰고, 깔끔하게 정산하세요.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="grid grid-cols-2 rounded-lg border bg-muted p-1 text-sm font-medium">
          <button
            onClick={() => setMode("login")}
            className={
              "rounded-md py-2 transition-all " +
              (mode === "login"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground")
            }
          >
            로그인
          </button>
          <button
            onClick={() => setMode("signup")}
            className={
              "rounded-md py-2 transition-all " +
              (mode === "signup"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground")
            }
          >
            회원가입
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            router.push("/rooms");
          }}
          className="space-y-4 rounded-xl border bg-white p-6 shadow-sm"
        >
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">이름</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="name" placeholder="홍길동" className="pl-9" required />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                className="px-9"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="비밀번호 표시"
              >
                {showPw ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            {mode === "login" ? "로그인" : "회원가입"}
          </Button>

          {mode === "login" && (
            <div className="text-center text-xs text-muted-foreground">
              <button className="hover:text-primary hover:underline">
                비밀번호를 잊으셨나요?
              </button>
            </div>
          )}
        </form>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">또는</span>
          <Separator className="flex-1" />
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => router.push("/rooms")}
            className="flex w-full items-center justify-center gap-2 rounded-lg border bg-white py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <span className="text-base font-bold text-yellow-500">K</span>
            카카오톡으로 시작
          </button>
          <button
            onClick={() => router.push("/rooms")}
            className="flex w-full items-center justify-center gap-2 rounded-lg border bg-white py-2.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
              />
            </svg>
            Google로 시작
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          계속 진행하면 이용약관과 개인정보처리방침에 동의합니다.
        </p>
      </div>
    </PageShell>
  );
}
