"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Copy,
  Check,
  Share2,
  MessageCircle,
  Mail,
  Users,
  MapPin,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { dateRangeLabel, formatWonShort } from "@/lib/format";
import { PageShell } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import type { Room } from "@/lib/types";

export function InviteView({
  room,
  token,
  isLoggedIn,
  isMember,
}: {
  room: Room;
  token: string;
  isLoggedIn: boolean;
  isMember: boolean;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  const inviteUrl =
    typeof window !== "undefined" ? `${window.location.origin}/invite/${token}` : "";
  const pct = room.useSaving && room.goalAmount > 0
    ? Math.min(100, Math.round((room.totalSaved / room.goalAmount) * 100))
    : 0;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleJoin = async () => {
    setErrorMessage("");
    setSessionExpired(false);
    setIsJoining(true);
    try {
      const response = await fetch(`/api/invite/${token}/join`, { method: "POST" });
      const data = (await response.json().catch(() => null)) as
        | { room?: { id: string }; error?: string }
        | null;

      if (response.status === 401) {
        setErrorMessage("세션이 만료됐어요. 다시 로그인해 주세요.");
        setSessionExpired(true);
        return;
      }

      if (!response.ok || !data?.room) {
        setErrorMessage(data?.error ?? "방 참여 중 문제가 발생했습니다.");
        return;
      }

      router.push(`/rooms/${data.room.id}`);
    } catch {
      setErrorMessage("방 참여 중 문제가 발생했습니다.");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <PageShell className="max-w-2xl">
      <div className="mb-6 text-center">
        <Badge
          variant="outline"
          className="border-blue-200 bg-blue-50 text-blue-700"
        >
          초대장
        </Badge>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">{room.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {room.destination} 여행 자금방에 초대되셨어요!
        </p>
      </div>

      {/* Room summary */}
      <Card className="overflow-hidden">
        <div className="relative h-32 bg-gradient-to-br from-sky-400 to-blue-600">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_50%)]" />
          <div className="absolute bottom-4 left-5 right-5 flex flex-wrap gap-x-4 gap-y-1 text-white/90 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {room.destination}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              {dateRangeLabel(room.startDate, room.endDate)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {room.members.length}/{room.expectedPeople}명
            </span>
            <span className="flex items-center gap-1.5">
              <Wallet className="h-4 w-4" />
              목표 {formatWonShort(room.goalAmount)}
            </span>
          </div>
        </div>
        <div className="space-y-2 p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">적립 진행률</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} className="h-2" />
        </div>
      </Card>

      {/* Invite link */}
      <Card className="mt-4 overflow-hidden">
        <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Share2 className="h-4 w-4" />
            초대 코드 · 링크
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            아래 코드나 링크를 친구에게 공유해 함께 모아요.
          </p>
        </div>
        <div className="space-y-4 p-5">
          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              초대 코드
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 py-3 text-center font-mono text-lg font-bold tracking-widest text-blue-700">
                {token}
              </div>
              <Button
                variant="default"
                size="lg"
                onClick={() => copy(token)}
                className="px-4"
              >
                {copied ? (
                  <>
                    <Check className="mr-1.5 h-4 w-4" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-4 w-4" />
                    복사
                  </>
                )}
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-1.5 text-xs font-medium text-muted-foreground">
              초대 링크
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-lg border bg-muted px-4 py-3 text-sm text-muted-foreground">
                {inviteUrl}
              </div>
              <Button variant="outline" size="lg" onClick={() => copy(inviteUrl)} className="px-4">
                <Copy className="mr-1.5 h-4 w-4" />
                링크 복사
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <button
              onClick={() => copy(inviteUrl)}
              className="flex flex-col items-center gap-2 rounded-xl border bg-white py-4 text-xs font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                <MessageCircle className="h-5 w-5 text-yellow-600" />
              </span>
              카카오톡
            </button>
            <button
              onClick={() => copy(inviteUrl)}
              className="flex flex-col items-center gap-2 rounded-xl border bg-white py-4 text-xs font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Mail className="h-5 w-5 text-blue-600" />
              </span>
              이메일
            </button>
            <button
              onClick={() => copy(inviteUrl)}
              className="flex flex-col items-center gap-2 rounded-xl border bg-white py-4 text-xs font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent hover:shadow-md"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <Share2 className="h-5 w-5 text-slate-600" />
              </span>
              공유
            </button>
          </div>
        </div>
      </Card>

      {/* Members */}
      <Card className="mt-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">참여 중인 멤버</h2>
          <span className="text-xs text-muted-foreground">
            {room.members.length}명
          </span>
        </div>
        <ul className="mt-4 space-y-3">
          {room.members.map((m) => {
            const memberPct = room.useSaving && m.personalGoal > 0
              ? Math.min(100, Math.round((m.personalSaved / m.personalGoal) * 100))
              : 0;
            return (
              <li key={m.id} className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={m.avatarUrl} alt={m.name} />
                    <AvatarFallback>{m.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  {m.isOwner && (
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground ring-2 ring-white">
                      방
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{m.name}</span>
                    {m.isOwner && (
                      <Badge
                        variant="outline"
                        className="border-transparent bg-blue-50 px-1.5 py-0 text-[10px] text-blue-700"
                      >
                        방장
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <Progress value={memberPct} className="h-1.5 flex-1" />
                    <span className="text-xs text-muted-foreground">
                      {formatWonShort(m.personalSaved)} / {formatWonShort(m.personalGoal)}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {errorMessage && (
        <p className="mt-4 text-center text-sm text-destructive" role="alert" aria-live="polite">
          {errorMessage}
          {sessionExpired && (
            <>
              {" "}
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                className="underline"
              >
                로그인하러 가기
              </Link>
            </>
          )}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {!isLoggedIn ? (
          <Button
            size="lg"
            className="flex-1"
            onClick={() =>
              router.push(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`)
            }
          >
            로그인 후 참여
          </Button>
        ) : isMember ? (
          <Button
            size="lg"
            className="flex-1"
            onClick={() => router.push(`/rooms/${room.id}`)}
          >
            내 방으로 이동
          </Button>
        ) : (
          <Button size="lg" className="flex-1" onClick={handleJoin} disabled={isJoining}>
            {isJoining ? "참여하는 중..." : "방 참여하기"}
          </Button>
        )}
      </div>
    </PageShell>
  );
}
