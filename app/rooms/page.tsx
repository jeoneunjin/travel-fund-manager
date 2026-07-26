import Link from "next/link";
import { Plus, MapPin, Users, CalendarDays } from "lucide-react";
import { mockRooms, statusMeta } from "@/lib/mock-data";
import { dDayLabel, dateRangeLabel, formatWon, formatWonShort } from "@/lib/format";
import { PageShell } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function RoomsPage() {
  return (
    <PageShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">내 방</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            참여 중인 여행 자금방 {mockRooms.length}개
          </p>
        </div>
        <Button asChild>
          <Link href="/rooms/new">
            <Plus className="mr-1.5 h-4 w-4" />
            새 방 만들기
          </Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {mockRooms.map((room) => {
          const status = statusMeta[room.status];
          const pct = Math.min(
            100,
            Math.round((room.totalSaved / room.goalAmount) * 100)
          );
          return (
            <Link key={room.id} href={`/rooms/${room.id}`} className="block">
              <Card className="group h-full overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="relative h-28 bg-gradient-to-br from-sky-400 to-blue-600">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_50%)]" />
                  <div className="absolute left-4 top-4 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-transparent bg-white/90 text-xs",
                        status.className
                      )}
                    >
                      {status.label}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="border-transparent bg-white/90 text-xs text-blue-700"
                    >
                      {dDayLabel(room.startDate)}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-center gap-1.5 text-white/90">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {room.destination}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div>
                    <h3 className="font-semibold leading-tight group-hover:text-primary">
                      {room.title}
                    </h3>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {dateRangeLabel(room.startDate, room.endDate)}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">적립 진행률</span>
                      <span className="font-semibold text-foreground">
                        {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatWonShort(room.totalSaved)}</span>
                      <span>목표 {formatWonShort(room.goalAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3">
                    <div className="flex -space-x-2">
                      {room.members.slice(0, 4).map((m) => (
                        <Avatar
                          key={m.id}
                          className="h-7 w-7 border-2 border-white"
                        >
                          <AvatarImage src={m.avatarUrl} alt={m.name} />
                          <AvatarFallback className="text-[10px]">
                            {m.name.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {room.members.length}/{room.expectedPeople}명
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}

        {/* New room card */}
        <Link
          href="/rooms/new"
          className="flex min-h-[260px] items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-sm font-medium">새 방 만들기</span>
          </div>
        </Link>
      </div>
    </PageShell>
  );
}
