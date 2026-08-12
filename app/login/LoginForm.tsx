"use client";

import { type FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Mode = "login" | "signup";

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        const result = await signIn("credentials", { email, password, redirect: false });
        if (result?.error) {
          setErrorMessage("이메일 또는 비밀번호가 올바르지 않습니다.");
          return;
        }

        router.push("/rooms");
        router.refresh();
        return;
      }

      const name = String(formData.get("name") ?? "");
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setErrorMessage(data?.error ?? "회원가입 중 문제가 발생했습니다. 다시 시도해 주세요.");
        return;
      }

      setMode("login");
      setSuccessMessage("회원가입이 완료되었습니다. 로그인해 주세요.");
    } catch {
      setErrorMessage(
        mode === "login"
          ? "로그인 중 문제가 발생했습니다. 다시 시도해 주세요."
          : "회원가입 중 문제가 발생했습니다. 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 rounded-lg border bg-muted p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => changeMode("login")}
          className={mode === "login" ? "rounded-md bg-white py-2 text-foreground shadow-sm transition-all" : "rounded-md py-2 text-muted-foreground transition-all"}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => changeMode("signup")}
          className={mode === "signup" ? "rounded-md bg-white py-2 text-foreground shadow-sm transition-all" : "rounded-md py-2 text-muted-foreground transition-all"}
        >
          회원가입
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        {mode === "signup" && <NameField />}
        <EmailField />
        <PasswordField showPassword={showPassword} mode={mode} onToggle={() => setShowPassword((value) => !value)} />

        {(errorMessage || successMessage) && (
          <p className={successMessage ? "text-sm text-green-600" : "text-sm text-destructive"} role={successMessage ? "status" : "alert"} aria-live="polite">
            {errorMessage || successMessage}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? (mode === "login" ? "로그인 중..." : "회원가입 중...") : mode === "login" ? "로그인" : "회원가입"}
        </Button>

        {mode === "login" && (
          <div className="text-center text-xs text-muted-foreground">
            <button type="button" className="hover:text-primary hover:underline">
              비밀번호를 잊으셨나요?
            </button>
          </div>
        )}
      </form>
    </>
  );
}

function NameField() {
  return (
    <div className="space-y-2">
      <Label htmlFor="name">이름</Label>
      <div className="relative">
        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="name" name="name" placeholder="홍길동" className="pl-9" required />
      </div>
    </div>
  );
}

function EmailField() {
  return (
    <div className="space-y-2">
      <Label htmlFor="email">이메일</Label>
      <div className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="email" name="email" type="email" placeholder="you@example.com" className="pl-9" autoComplete="email" required />
      </div>
    </div>
  );
}

function PasswordField({ showPassword, mode, onToggle }: { showPassword: boolean; mode: Mode; onToggle: () => void }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="password">비밀번호</Label>
      <div className="relative">
        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="px-9" autoComplete={mode === "login" ? "current-password" : "new-password"} required />
        <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label="비밀번호 표시">
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
