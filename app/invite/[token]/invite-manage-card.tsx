"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { RoomInvite } from "@/lib/types";

// 방장 전용 — 이메일 지정 초대 폼 + 대기 중인 초대 목록.
// invite-view.tsx가 200줄 넘게 비대해지는 걸 막기 위해 분리함
export function InviteManageCard({
  roomId,
  invites,
}: {
  roomId: string;
  invites: RoomInvite[];
}) {
  const [pendingInvites, setPendingInvites] = useState(invites);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const handleInvite = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setInviteError("");
    setIsInviting(true);
    try {
      const response = await fetch(`/api/rooms/${roomId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setInviteError(data?.error ?? "초대 중 문제가 발생했습니다.");
        return;
      }

      setPendingInvites((prev) => [
        { email: inviteEmail.trim().toLowerCase(), invitedAt: new Date().toISOString() },
        ...prev,
      ]);
      setInviteEmail("");
    } catch {
      setInviteError("초대 중 문제가 발생했습니다.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Card className="mt-4 p-5">
      <h2 className="text-sm font-semibold">이메일로 초대하기</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        초대한 이메일로 로그인(또는 회원가입 후 로그인)한 사람만 이 방에 참여할 수 있어요.
        링크·코드와 함께 초대한 이메일 주소를 정확히 전달해 주세요.
      </p>
      <form onSubmit={handleInvite} className="mt-3 flex items-center gap-2">
        <Input
          type="email"
          required
          placeholder="friend@example.com"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
        />
        <Button type="submit" disabled={isInviting}>
          {isInviting ? "초대하는 중..." : "초대"}
        </Button>
      </form>
      {inviteError && (
        <p className="mt-2 text-sm text-destructive" role="alert" aria-live="polite">
          {inviteError}
        </p>
      )}
      {pendingInvites.length > 0 && (
        <ul className="mt-4 space-y-2">
          {pendingInvites.map((invite) => (
            <li
              key={invite.email}
              className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
            >
              <span className="truncate">{invite.email}</span>
              <Badge variant="outline" className="border-transparent bg-amber-50 text-amber-700">
                대기중
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
