"use client";

import { type MouseEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Room } from "@/lib/types";

// 방장 전용 — 확인 다이얼로그를 거쳐 방을 완전히 삭제 (되돌릴 수 없음)
export function DeleteRoomButton({ room }: { room: Room }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isOwner = room.members.some((m) => m.userId === session?.user?.id && m.isOwner);
  if (!isOwner) return null;

  const handleDelete = async (event: MouseEvent) => {
    event.preventDefault(); // 실패 시 다이얼로그를 열어둔 채 에러를 보여주기 위해 자동 닫힘 방지
    setErrorMessage("");
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/rooms/${room.id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setErrorMessage(data?.error ?? "방 삭제 중 문제가 발생했습니다.");
        return;
      }
      setOpen(false);
      router.push("/rooms");
      router.refresh();
    } catch {
      setErrorMessage("방 삭제 중 문제가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label="방 삭제"
          title="방 삭제"
          className="h-9 w-9 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>&ldquo;{room.title}&rdquo; 방을 삭제할까요?</AlertDialogTitle>
          <AlertDialogDescription>
            지출 내역, 정산 기록, 멤버 정보가 모두 삭제되고 되돌릴 수 없어요.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "삭제하는 중..." : "삭제"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
