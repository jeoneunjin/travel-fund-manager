import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginBrand } from "./LoginBrand";
import { LoginForm } from "./LoginForm";
import { LoginSocialButtons } from "./LoginSocialButtons";
import { PageShell } from "@/components/site-header";

// 내부 경로만 신뢰: "/"로 시작하되 "//"(프로토콜-상대 URL)로 시작하면 오픈 리다이렉트이므로 거부
function safeCallbackUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.startsWith("/") && !value.startsWith("//") ? value : undefined;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string };
}) {
  const callbackUrl = safeCallbackUrl(searchParams.callbackUrl);

  const session = await auth();
  if (session?.user) redirect(callbackUrl ?? "/rooms");

  return (
    <PageShell className="flex min-h-[calc(100vh-3.5rem)] max-w-md items-center justify-center py-10">
      <div className="w-full space-y-6">
        <LoginBrand />
        <LoginForm callbackUrl={callbackUrl} />
        <LoginSocialButtons />
        <p className="text-center text-xs text-muted-foreground">
          계속 진행하면 이용약관과 개인정보처리방침에 동의합니다.
        </p>
      </div>
    </PageShell>
  );
}
