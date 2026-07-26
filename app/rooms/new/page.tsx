"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Plane, Wallet, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/site-header";
import { formatWon } from "@/lib/format";

export default function NewRoomPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [people, setPeople] = useState("");

  const monthlyPreview = useMemo(() => {
    const goal = Number(goalAmount) || 0;
    const p = Number(people) || 0;
    if (goal <= 0 || p <= 0) return 0;
    // assume 6 months saving window
    const months = 6;
    return Math.round(goal / p / months);
  }, [goalAmount, people]);

  return (
    <PageShell className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">새 방 만들기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          여행 자금을 함께 모을 새 방을 생성합니다.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          router.push("/rooms/okinawa-2026");
        }}
        className="grid gap-6 md:grid-cols-3"
      >
        <div className="space-y-5 md:col-span-2">
          <Card className="space-y-5 p-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                여행 제목 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Plane className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="title"
                  placeholder="예: 오키나와 4박 5일"
                  className="pl-9"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">여행지</Label>
              <Input
                id="destination"
                placeholder="예: 오키나와"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start">
                  시작일 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="start"
                    type="date"
                    className="pl-9"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">
                  종료일 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="end"
                    type="date"
                    className="pl-9"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="goal">
                  목표 금액 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="goal"
                    type="number"
                    min={0}
                    step={10000}
                    placeholder="3000000"
                    className="pl-9 pr-12"
                    value={goalAmount}
                    onChange={(e) => setGoalAmount(e.target.value)}
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    원
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="people">
                  예상 인원 <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="people"
                    type="number"
                    min={1}
                    placeholder="4"
                    className="pl-9 pr-12"
                    value={people}
                    onChange={(e) => setPeople(e.target.value)}
                    required
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    명
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              취소
            </Button>
            <Button type="submit">방 만들기</Button>
          </div>
        </div>

        {/* Live preview */}
        <div className="md:col-span-1">
          <Card className="sticky top-20 overflow-hidden p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              실시간 미리보기
            </div>
            <h3 className="mt-1 text-lg font-bold">
              {title || "여행 제목"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {destination || "여행지"}
            </p>

            <div className="mt-5 rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 p-4">
              <div className="text-xs text-muted-foreground">
                1인당 월 적립 예상액
              </div>
              <div className="mt-1 text-2xl font-bold text-primary">
                {formatWon(monthlyPreview)}
              </div>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>목표 금액</span>
                  <span className="font-medium text-foreground">
                    {goalAmount ? formatWon(Number(goalAmount)) : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>예상 인원</span>
                  <span className="font-medium text-foreground">
                    {people || "—"}명
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>적립 기간</span>
                  <span className="font-medium text-foreground">6개월</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              생성 후 초대 링크로 멤버를 초대하면, 각자의 적립 목표가 자동으로
              분배됩니다.
            </p>
          </Card>
        </div>
      </form>
    </PageShell>
  );
}
