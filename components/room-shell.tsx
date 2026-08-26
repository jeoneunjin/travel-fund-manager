"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Receipt,
  Handshake,
  Users,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Room } from "@/lib/types";
import { dDayLabel, dateRangeLabel } from "@/lib/format";
import { statusMeta } from "@/lib/constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const subNav = [
  { key: "dashboard", label: "대시보드", icon: LayoutDashboard, segment: "" },
  { key: "expenses", label: "지출", icon: Receipt, segment: "/expenses" },
  { key: "settlement", label: "정산", icon: Handshake, segment: "/settlement" },
];

export function RoomShell({
  room,
  children,
}: {
  room: Room;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/rooms/${room.id}`;
  const status = statusMeta[room.status];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      {/* Room header */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight md:text-2xl">
              {room.title}
            </h1>
            <Badge
              variant="outline"
              className={cn("border-transparent", status.className)}
            >
              {status.label}
            </Badge>
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700"
            >
              {dDayLabel(room.startDate)}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {room.destination} · {dateRangeLabel(room.startDate, room.endDate)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2">
            {room.members.slice(0, 5).map((m) => (
              <Avatar
                key={m.id}
                className="h-9 w-9 border-2 border-white"
                title={m.name + (m.isOwner ? " (방장)" : "")}
              >
                <AvatarImage src={m.avatarUrl} alt={m.name} />
                <AvatarFallback>{m.name.slice(0, 1)}</AvatarFallback>
              </Avatar>
            ))}
            <Link
              href={`/invite/${room.inviteToken}`}
              aria-label="멤버 초대"
              title="멤버 초대"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white bg-primary text-primary-foreground shadow-sm transition-all hover:scale-105 hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{room.members.length}명</span>
          </div>
        </div>
      </div>

      {/* Sub navigation */}
      <nav className="mt-4 flex gap-1 overflow-x-auto border-b scrollbar-hide">
        {subNav.map((item) => {
          const href = base + item.segment;
          const active =
            item.segment === ""
              ? pathname === base
              : pathname.startsWith(href);
          const Icon = item.icon;
          return (
            <Link
              key={item.key}
              href={href}
              className={cn(
                "relative flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {active && (
                <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-6">{children}</div>
    </div>
  );
}
