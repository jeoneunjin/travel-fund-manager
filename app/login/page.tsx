import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginBrand } from "./LoginBrand";
import { LoginForm } from "./LoginForm";
import { LoginSocialButtons } from "./LoginSocialButtons";
import { PageShell } from "@/components/site-header";

// 내부 경로만 신뢰: 고정 base로 해석했을 때 origin이 같아야 허용 (백슬래시 등 문자열 블랙리스트 우회 방지)
const CALLBACK_URL_BASE = "http://localhost";

function safeCallbackUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, CALLBACK_URL_BASE);
    return url.origin === CALLBACK_URL_BASE ? `${url.pathname}${url.search}${url.hash}` : undefined;
  } catch {
    return undefined;
  }
}

export default async function LoginPage(
  props: {
    searchParams: Promise<{ callbackUrl?: string }>;
  }
) {
  const searchParams = await props.searchParams;
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
