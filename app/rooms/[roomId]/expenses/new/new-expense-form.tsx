"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Receipt, Wallet, Users, CalendarDays } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryLabel,
  expenseCategories,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { formatWon } from "@/lib/format";
import type { ExpenseCategory, Room } from "@/lib/types";

export function NewExpenseForm({ room }: { room: Room }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [payerId, setPayerId] = useState<string>(room.members[0]?.id ?? "");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(room.members.map((m) => m.id))
  );
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [category, setCategory] = useState<ExpenseCategory>("food");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numericAmount = Number(amount) || 0;
  const perPerson =
    selected.size > 0 ? Math.round(numericAmount / selected.size) : 0;

  const toggleMember = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/rooms/${room.id}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: numericAmount,
          payerId,
          splitBetweenIds: Array.from(selected),
          category,
          date,
        }),
      });
      const data = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setErrorMessage(data?.error ?? "지출 등록 중 문제가 발생했습니다.");
        return;
      }

      router.push(`/rooms/${room.id}/expenses`);
    } catch {
      setErrorMessage("지출 등록 중 문제가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">지출 등록</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          새로운 지출 내역을 등록하고 정산 대상을 선택하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Card className="space-y-5 p-6">
          <div className="space-y-2">
            <Label htmlFor="title">
              장소 / 항목명 <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Receipt className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="title"
                placeholder="예: 나하 공항 택시"
                className="pl-9"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">
                금액 <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Wallet className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  step={100}
                  placeholder="8200"
                  className="pl-9 pr-12"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  원
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">카테고리</Label>
              <Select
                value={category}
                onValueChange={(v) => setCategory(v as ExpenseCategory)}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {categoryLabel[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">날짜 (선택)</Label>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                className="pl-9"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Payer selection */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold">
            결제자 <span className="text-destructive">*</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            지출을 결제한 멤버를 한 명 선택하세요.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {room.members.map((m) => {
              const active = payerId === m.id;
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => setPayerId(m.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all",
                    active
                      ? "border-primary bg-blue-50"
                      : "border-transparent bg-muted/40 hover:bg-muted"
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={m.avatarUrl} alt={m.name} />
                    <AvatarFallback>{m.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{m.name}</span>
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Split between */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              정산 대상 <span className="text-destructive">*</span>
            </h2>
            <button
              type="button"
              onClick={() =>
                setSelected(
                  selected.size === room.members.length
                    ? new Set()
                    : new Set(room.members.map((m) => m.id))
                )
              }
              className="text-xs text-primary hover:underline"
            >
              {selected.size === room.members.length ? "전체 해제" : "전체 선택"}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            기본 전체 선택. 제외할 멤버를 해제할 수 있습니다.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {room.members.map((m) => {
              const active = selected.has(m.id);
              return (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all",
                    active
                      ? "border-primary bg-blue-50"
                      : "border-transparent bg-muted/40 opacity-60 hover:opacity-100"
                  )}
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={m.avatarUrl} alt={m.name} />
                    <AvatarFallback>{m.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-medium">{m.name}</span>
                  {active && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Live preview */}
          <div className="mt-5 flex items-center justify-between rounded-lg bg-gradient-to-br from-sky-50 to-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              {selected.size}인 분할 시
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                {formatWon(perPerson)}
              </div>
              <div className="text-xs text-muted-foreground">1인당</div>
            </div>
          </div>
        </Card>

        {errorMessage && (
          <p className="text-sm text-destructive" role="alert" aria-live="polite">
            {errorMessage}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            취소
          </Button>
          <Button type="submit" disabled={selected.size === 0 || isSubmitting}>
            {isSubmitting ? "등록하는 중..." : "등록하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}
