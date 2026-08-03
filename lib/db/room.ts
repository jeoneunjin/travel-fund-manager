// lib/db/room.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import type { Room, Member, Expense, SettlementRow, Transfer } from "@/lib/types";

// 쿼리에 실제로 쓰는 include 절 — 이 상수를 타입 계산에도 그대로 재사용함
const roomInclude = {
  members: { include: { user: true } },
  expenses: { include: { shares: true } },
} satisfies Prisma.RoomInclude;

// 위 include 절 그대로 반영된 타입 — schema.prisma가 바뀌면 이 타입도 자동으로 같이 바뀜
type DbRoom = Prisma.RoomGetPayload<{ include: typeof roomInclude }>;

// Prisma에서 가져온 raw 데이터를 화면이 기대하는 Room 타입 모양으로 변환
function toRoom(dbRoom: DbRoom): Room {
  return {
    id: dbRoom.id,
    title: dbRoom.title,
    destination: dbRoom.destination,
    startDate: dbRoom.startDate.toISOString(),
    endDate: dbRoom.endDate.toISOString(),
    goalAmount: dbRoom.goalAmount,
    totalSaved: dbRoom.members.reduce((sum, m) => sum + m.personalSaved, 0),
    expectedPeople: dbRoom.expectedPeople,
    status: dbRoom.status.toLowerCase() as Room["status"],
    inviteToken: dbRoom.inviteToken,
    members: dbRoom.members.map(
      (m): Member => ({
        id: m.id,
        userId: m.userId,
        name: m.user.name,
        avatarUrl: m.user.avatarUrl ?? "",
        isOwner: m.isOwner,
        personalGoal: m.personalGoal,
        personalSaved: m.personalSaved,
      })
    ),
    expenses: dbRoom.expenses.map(
      (e): Expense => ({
        id: e.id,
        title: e.title,
        amount: e.amount,
        payerId: e.payerId,
        splitBetweenIds: e.shares.map((s) => s.memberId),
        date: e.date.toISOString(),
        category: e.category.toLowerCase() as Expense["category"],
        place: e.place ?? undefined,
      })
    ),
  };
}

function fetchRoomRaw(where: Prisma.RoomWhereUniqueInput) {
  return prisma.room.findUnique({ where, include: roomInclude });
}

export async function getRooms(): Promise<Room[]> {
  const rooms = await prisma.room.findMany({ include: roomInclude, orderBy: { startDate: "asc" } });
  return rooms.map(toRoom);
}

export async function getRoom(roomId: string): Promise<Room | undefined> {
  const room = await fetchRoomRaw({ id: roomId });
  return room ? toRoom(room) : undefined;
}

export async function getRoomByToken(token: string): Promise<Room | undefined> {
  const room = await fetchRoomRaw({ inviteToken: token });
  return room ? toRoom(room) : undefined;
}

export function totalExpenses(room: Room): number {
  return room.expenses.reduce((sum, e) => sum + e.amount, 0);
}

// 정산 계산 로직은 mock-data.ts에 있던 걸 그대로 재사용 (순수 함수라 손댈 필요 없음)
export function computeSettlement(room: Room): {
  rows: SettlementRow[];
  transfers: Transfer[];
} {
  const paidByMember = new Map<string, number>();
  const burdenByMember = new Map<string, number>();
  room.members.forEach((m) => {
    paidByMember.set(m.id, 0);
    burdenByMember.set(m.id, 0);
  });
  room.expenses.forEach((e) => {
    paidByMember.set(e.payerId, (paidByMember.get(e.payerId) ?? 0) + e.amount);
    const share = e.amount / e.splitBetweenIds.length;
    e.splitBetweenIds.forEach((id) => {
      burdenByMember.set(id, (burdenByMember.get(id) ?? 0) + share);
    });
  });

  const rows: SettlementRow[] = room.members.map((m) => {
    const paid = paidByMember.get(m.id) ?? 0;
    const burden = Math.round(burdenByMember.get(m.id) ?? 0);
    return { memberId: m.id, paid, burden, diff: Math.round(paid - burden) };
  });

  const debtors = rows.filter((r) => r.diff < 0).sort((a, b) => a.diff - b.diff);
  const creditors = rows.filter((r) => r.diff > 0).sort((a, b) => b.diff - a.diff);

  const transfers: Transfer[] = [];
  let i = 0;
  let j = 0;
  const remaining = rows.map((r) => ({ ...r }));
  while (i < debtors.length && j < creditors.length) {
    const d = remaining.find((r) => r.memberId === debtors[i].memberId)!;
    const c = remaining.find((r) => r.memberId === creditors[j].memberId)!;
    const amount = Math.min(-d.diff, c.diff);
    if (amount > 0) {
      transfers.push({ fromId: d.memberId, toId: c.memberId, amount });
      d.diff += amount;
      c.diff -= amount;
    }
    if (Math.abs(d.diff) < 1) i++;
    if (Math.abs(c.diff) < 1) j++;
  }

  return { rows, transfers };
}

export function getMember(room: Room, memberId: string) {
  return room.members.find((m) => m.id === memberId);
}