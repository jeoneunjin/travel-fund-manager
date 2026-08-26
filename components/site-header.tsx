"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowLeft, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    setCanGoBack(window.history.length > 1);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4">
        {canGoBack && pathname !== "/" && pathname !== "/rooms" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="뒤로가기"
            className="-ml-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Link href="/rooms" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight text-foreground">
            트래블펀드
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Button
            asChild
            variant={pathname === "/rooms" ? "secondary" : "ghost"}
            size="sm"
          >
            <Link href="/rooms">내 방</Link>
          </Button>
          {session?.user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function PageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-6", className)}>
      {children}
    </div>
  );
}
