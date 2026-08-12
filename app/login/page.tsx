import { LoginBrand } from "./LoginBrand";
import { LoginForm } from "./LoginForm";
import { LoginSocialButtons } from "./LoginSocialButtons";
import { PageShell } from "@/components/site-header";

export default function LoginPage() {
  return (
    <PageShell className="flex min-h-[calc(100vh-3.5rem)] max-w-md items-center justify-center py-10">
      <div className="w-full space-y-6">
        <LoginBrand />
        <LoginForm />
        <LoginSocialButtons />
        <p className="text-center text-xs text-muted-foreground">
          계속 진행하면 이용약관과 개인정보처리방침에 동의합니다.
        </p>
      </div>
    </PageShell>
  );
}
