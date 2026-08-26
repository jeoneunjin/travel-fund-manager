"use client";

import { useState } from "react";
import { Check, ArrowRight, Handshake, CheckCircle2, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { computeSettlement, getMember, totalExpenses } from "@/lib/settlement";
import { formatWon } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/types";

export function SettlementView({ room }: { room: Room }) {
  const { rows, transfers } = computeSettlement(room);
  const total = totalExpenses(room);
  const [done, setDone] = useState(false);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
              <Handshake className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-white/80">정산 대상 총액</p>
              <p className="text-2xl font-bold">{formatWon(total)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/80">참여 인원</p>
            <p className="text-2xl font-bold">{room.members.length}명</p>
          </div>
        </div>
      </Card>

      {/* Member summary table */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">멤버별 정산 요약</h2>
        <Card className="overflow-hidden">
          {/* Desktop table */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">멤버</th>
                  <th className="px-4 py-3 text-right font-medium">낸 금액</th>
                  <th className="px-4 py-3 text-right font-medium">부담액</th>
                  <th className="px-4 py-3 text-right font-medium">차액</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((r) => {
                  const m = getMember(room, r.memberId);
                  const receives = r.diff >= 0;
                  return (
                    <tr key={r.memberId} className="hover:bg-accent/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={m?.avatarUrl} alt={m?.name ?? ""} />
                            <AvatarFallback>{m?.name.slice(0, 1)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{m?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {formatWon(r.paid)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                        {formatWon(r.burden)}
                      </td>
                      <td
                        className={cn(
                          "px-4 py-3 text-right font-semibold tabular-nums",
                          receives ? "text-emerald-600" : "text-rose-600"
                        )}
                      >
                        {receives ? "+" : "-"}
                        {formatWon(Math.abs(r.diff))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y sm:hidden">
            {rows.map((r) => {
              const m = getMember(room, r.memberId);
              const receives = r.diff >= 0;
              return (
                <div key={r.memberId} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={m?.avatarUrl} alt={m?.name ?? ""} />
                        <AvatarFallback>{m?.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{m?.name}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent",
                        receives
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-rose-50 text-rose-700"
                      )}
                    >
                      {receives ? "받을 금액" : "보낼 금액"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="text-muted-foreground">낸 금액</div>
                      <div className="mt-0.5 font-semibold tabular-nums">
                        {formatWon(r.paid)}
                      </div>
                    </div>
                    <div className="rounded-md bg-muted/50 p-2">
                      <div className="text-muted-foreground">부담액</div>
                      <div className="mt-0.5 font-semibold tabular-nums">
                        {formatWon(r.burden)}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "rounded-md p-2",
                        receives ? "bg-emerald-50" : "bg-rose-50"
                      )}
                    >
                      <div
                        className={cn(
                          "text-muted-foreground",
                          receives ? "text-emerald-700" : "text-rose-700"
                        )}
                      >
                        차액
                      </div>
                      <div
                        className={cn(
                          "mt-0.5 font-semibold tabular-nums",
                          receives ? "text-emerald-600" : "text-rose-600"
                        )}
                      >
                        {receives ? "+" : "-"}
                        {formatWon(Math.abs(r.diff))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Transfer guide */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">최종 송금 안내</h2>
        <Card className="divide-y">
          {transfers.length === 0 ? (
            <div className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              정산할 송금 내역이 없습니다. 모든 멤버가 정확히 나누어 결제했어요.
            </div>
          ) : (
            transfers.map((t, i) => {
              const from = getMember(room, t.fromId);
              const to = getMember(room, t.toId);
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40"
                >
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={from?.avatarUrl} alt={from?.name ?? ""} />
                        <AvatarFallback>{from?.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{from?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-primary">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={to?.avatarUrl} alt={to?.name ?? ""} />
                        <AvatarFallback>{to?.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{to?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-primary tabular-nums">
                      {formatWon(t.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>

      {/* Complete button */}
      <Card
        className={cn(
          "flex flex-col items-center gap-3 p-6 text-center transition-colors sm:flex-row sm:justify-between sm:text-left",
          done && "border-emerald-200 bg-emerald-50/50"
        )}
      >
        <div className="flex items-center gap-3">
          {done ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          ) : (
            <Handshake className="h-8 w-8 text-primary" />
          )}
          <div>
            <h3 className="font-semibold">
              {done ? "정산이 완료되었습니다" : "모든 송금을 마치셨나요?"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {done
                ? "즐거운 여행이 되셨기를 바랍니다!"
                : "완료 처리를 누르면 정산이 종료됩니다."}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setDone(true)}
          disabled={done}
          variant={done ? "secondary" : "default"}
          size="lg"
          className="w-full sm:w-auto"
        >
          {done ? (
            <>
              <Check className="mr-1.5 h-4 w-4" />
              완료됨
            </>
          ) : (
            "정산 완료 처리"
          )}
        </Button>
      </Card>
    </div>
  );
}
