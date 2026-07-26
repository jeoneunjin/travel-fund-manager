"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Filter, Wallet, Users } from "lucide-react";
import { withRoom } from "@/components/room-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  categoryColor,
  categoryLabel,
  expenseCategories,
  getMember,
} from "@/lib/mock-data";
import { formatDate, formatWon } from "@/lib/format";
import { cn } from "@/lib/utils";

export default function ExpensesPage({
  params,
}: {
  params: { roomId: string };
}) {
  return withRoom(params.roomId, (room) => {
    const [memberFilter, setMemberFilter] = useState<string>("all");
    const [categoryFilter, setCategoryFilter] = useState<string>("all");

    const filtered = useMemo(() => {
      return [...room.expenses]
        .sort((a, b) => b.date.localeCompare(a.date))
        .filter((e) => memberFilter === "all" || e.payerId === memberFilter)
        .filter(
          (e) => categoryFilter === "all" || e.category === categoryFilter
        );
    }, [room.expenses, memberFilter, categoryFilter]);

    const total = filtered.reduce((s, e) => s + e.amount, 0);

    return (
      <div className="space-y-5">
        {/* Summary */}
        <Card className="flex items-center justify-between p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-primary">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                총 지출액 ({filtered.length}건)
              </p>
              <p className="text-xl font-bold">{formatWon(total)}</p>
            </div>
          </div>
          <Button asChild>
            <Link href={`/rooms/${room.id}/expenses/new`}>
              <Plus className="mr-1.5 h-4 w-4" />
              지출 등록
            </Link>
          </Button>
        </Card>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            필터
          </div>
          <Select value={memberFilter} onValueChange={setMemberFilter}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="결제자" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 멤버</SelectItem>
              {room.members.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="카테고리" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 카테고리</SelectItem>
              {expenseCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {categoryLabel[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <Card className="divide-y">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              조건에 맞는 지출 내역이 없습니다.
            </div>
          ) : (
            filtered.map((e) => {
              const payer = getMember(room, e.payerId);
              const perPerson = Math.round(e.amount / e.splitBetweenIds.length);
              return (
                <div
                  key={e.id}
                  className="flex items-center gap-3 p-4 transition-colors hover:bg-accent/40"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={payer?.avatarUrl} alt={payer?.name ?? ""} />
                    <AvatarFallback>{payer?.name.slice(0, 1)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{e.title}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "border-transparent px-1.5 py-0 text-[10px]",
                          categoryColor[e.category]
                        )}
                      >
                        {categoryLabel[e.category]}
                      </Badge>
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{payer?.name} 결제</span>
                      <span>·</span>
                      <span>{formatDate(e.date)}</span>
                      {e.place && (
                        <>
                          <span>·</span>
                          <span className="truncate">{e.place}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {formatWon(e.amount)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {e.splitBetweenIds.length}인 · {formatWon(perPerson)}/인
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </Card>
      </div>
    );
  });
}
