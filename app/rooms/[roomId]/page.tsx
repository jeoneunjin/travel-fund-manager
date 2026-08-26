import Link from "next/link";
import { ArrowRight, Plus, Receipt, Wallet, PiggyBank } from "lucide-react";
import { withRoom } from "@/components/room-page";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { categoryColor, categoryLabel } from "@/lib/constants";
import { getMember } from "@/lib/settlement";
import { formatDateShort, formatWon, formatWonShort } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function DashboardPage(
  props: {
    params: Promise<{ roomId: string }>;
  }
) {
  const params = await props.params;
  return withRoom(params.roomId, (room) => {
    const pct = room.useSaving && room.goalAmount > 0
      ? Math.min(100, Math.round((room.totalSaved / room.goalAmount) * 100))
      : 0;
    const recentExpenses = [...room.expenses]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);

    return (
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: savings status */}
        <div className="space-y-6">
          {/* Goal progress */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white/80">
                  목표 금액 대비 적립률
                </span>
                <Badge className="border-transparent bg-white/20 text-white">
                  {pct}%
                </Badge>
              </div>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-bold">
                  {formatWon(room.totalSaved)}
                </span>
                <span className="mb-1 text-sm text-white/70">
                  / {formatWonShort(room.goalAmount)}
                </span>
              </div>
            </div>
            <div className="p-5">
              <Progress value={pct} className="h-3" />
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>남은 금액 {formatWon(room.goalAmount - room.totalSaved)}</span>
                <span>목표 {formatWonShort(room.goalAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Member savings */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <PiggyBank className="h-4 w-4 text-primary" />
                멤버별 적립 현황
              </h2>
              <span className="text-xs text-muted-foreground">
                {room.members.length}명
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {room.members.map((m) => {
                const mp = room.useSaving && m.personalGoal > 0
                  ? Math.min(100, Math.round((m.personalSaved / m.personalGoal) * 100))
                  : 0;
                return (
                  <Card key={m.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={m.avatarUrl} alt={m.name} />
                          <AvatarFallback>{m.name.slice(0, 1)}</AvatarFallback>
                        </Avatar>
                        {m.isOwner && (
                          <span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-1 text-[8px] font-bold text-primary-foreground ring-2 ring-white">
                            방
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="truncate text-sm font-medium">
                            {m.name}
                          </span>
                          <span className="text-xs font-semibold text-primary">
                            {mp}%
                          </span>
                        </div>
                        <div className="mt-1.5">
                          <Progress value={mp} className="h-1.5" />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatWonShort(m.personalSaved)} / {formatWonShort(m.personalGoal)}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: expenses */}
        <div className="space-y-6">
          <Card className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">현재까지 지출</p>
                <p className="text-xl font-bold">
                  {formatWon(room.expenses.reduce((s, e) => s + e.amount, 0))}
                </p>
              </div>
            </div>
            <Button asChild size="lg" className="shadow-sm">
              <Link href={`/rooms/${room.id}/expenses/new`}>
                <Plus className="mr-1.5 h-4 w-4" />
                지출 등록
              </Link>
            </Button>
          </Card>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold">
                <Receipt className="h-4 w-4 text-primary" />
                최근 지출 내역
              </h2>
              <Link
                href={`/rooms/${room.id}/expenses`}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                전체보기
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <Card className="divide-y">
              {recentExpenses.map((e) => {
                const payer = getMember(room, e.payerId);
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 p-3.5 transition-colors hover:bg-accent/40"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={payer?.avatarUrl} alt={payer?.name ?? ""} />
                        <AvatarFallback>{payer?.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {e.title}
                        </span>
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
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {payer?.name} 결제 · {formatDateShort(e.date)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">
                        {formatWon(e.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {e.splitBetweenIds.length}인 분할
                      </div>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        </div>
      </div>
    );
  });
}
