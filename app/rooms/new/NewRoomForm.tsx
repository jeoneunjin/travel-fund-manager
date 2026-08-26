"use client";

import { type FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/site-header";
import { RoomDetailsFields } from "./RoomDetailsFields";
import { RoomPreview } from "./RoomPreview";

export function NewRoomForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [useSaving, setUseSaving] = useState(true);
  const [goalAmount, setGoalAmount] = useState("");
  const [people, setPeople] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthlyPreview = useMemo(() => {
    const goal = useSaving ? Number(goalAmount) || 0 : 0;
    const expectedPeople = Number(people) || 0;
    if (goal <= 0 || expectedPeople <= 0) return 0;
    return Math.round(goal / expectedPeople / 6);
  }, [goalAmount, people, useSaving]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          destination,
          startDate,
          endDate,
          useSaving,
          ...(useSaving ? { goalAmount: Number(goalAmount) } : {}),
          expectedPeople: Number(people),
        }),
      });
      const data = (await response.json().catch(() => null)) as {
        error?: string;
        room?: { id: string };
      } | null;

      if (!response.ok || !data?.room) {
        setErrorMessage(data?.error ?? "방 생성 중 문제가 발생했습니다. 다시 시도해 주세요.");
        return;
      }

      router.push(`/rooms/${data.room.id}`);
      router.refresh();
    } catch {
      setErrorMessage("방 생성 중 문제가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">새 방 만들기</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          여행 자금을 함께 모을 새 방을 생성합니다.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-3">
        <div className="space-y-5 md:col-span-2">
          <RoomDetailsFields
            title={title}
            destination={destination}
            startDate={startDate}
            endDate={endDate}
            useSaving={useSaving}
            goalAmount={goalAmount}
            people={people}
            isSubmitting={isSubmitting}
            onTitleChange={setTitle}
            onDestinationChange={setDestination}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onUseSavingChange={setUseSaving}
            onGoalAmountChange={setGoalAmount}
            onPeopleChange={setPeople}
          />

          {errorMessage && (
            <p className="text-sm text-destructive" role="alert" aria-live="polite">
              {errorMessage}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "방 만드는 중..." : "방 만들기"}
            </Button>
          </div>
        </div>

        <RoomPreview
          title={title}
          destination={destination}
          goalAmount={goalAmount}
          people={people}
          useSaving={useSaving}
          monthlyPreview={monthlyPreview}
        />
      </form>
    </PageShell>
  );
}
