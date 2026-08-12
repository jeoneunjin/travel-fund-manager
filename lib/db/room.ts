// lib/db/room.ts
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { randomBytes } from "crypto";
import type { Room, Member, Expense, SettlementRow, Transfer } from "@/lib/types";

const INVITE_TOKEN_RETRY_COUNT = 3;
const JOIN_ROOM_RETRY_COUNT = 3;

export type CreateRoomInput = {
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  useSaving: boolean;
  goalAmount?: number;
  expectedPeople: number;
  ownerId: string;
};

export class RoomJoinNotAllowedError extends Error {
  constructor() {
    super("여행이 시작된 방에는 참여할 수 없습니다.");
  }
}

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
    useSaving: dbRoom.useSaving,
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

function createInviteToken(): string {
  return randomBytes(12).toString("base64url");
}

export async function createRoom(input: CreateRoomInput) {
  const goalAmount = input.useSaving ? input.goalAmount! : 0;
  // expectedPeople은 예상치라 실제 인원과 다를 수 있음 — 초대 참여 API에서 재계산 필요
  const personalGoal = input.useSaving ? Math.round(goalAmount / input.expectedPeople) : 0;

  for (let attempt = 0; attempt < INVITE_TOKEN_RETRY_COUNT; attempt += 1) {
    try {
      return await prisma.room.create({
        data: {
          title: input.title,
          destination: input.destination,
          startDate: input.startDate,
          endDate: input.endDate,
          useSaving: input.useSaving,
          goalAmount,
          expectedPeople: input.expectedPeople,
          inviteToken: createInviteToken(),
          members: {
            create: {
              userId: input.ownerId,
              isOwner: true,
              personalGoal,
              personalSaved: 0,
            },
          },
        },
        select: { id: true, inviteToken: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < INVITE_TOKEN_RETRY_COUNT - 1
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("초대 토큰 생성에 실패했습니다.");
}

async function findExistingRoomMember(token: string, userId: string) {
  return prisma.room.findUnique({
    where: { inviteToken: token },
    select: {
      id: true,
      inviteToken: true,
      members: {
        where: { userId },
        select: { id: true },
      },
    },
  });
}

export async function joinRoomByInviteToken(token: string, userId: string) {
  for (let attempt = 0; attempt < JOIN_ROOM_RETRY_COUNT; attempt += 1) {
    try {
      const result = await prisma.$transaction(
        async (tx) => {
          const room = await tx.room.findUnique({
            where: { inviteToken: token },
            select: {
              id: true,
              inviteToken: true,
              useSaving: true,
              goalAmount: true,
              status: true,
              members: {
                where: { userId },
                select: { id: true },
              },
            },
          });

          if (!room) return null;
          if (room.members.length > 0) {
            return { room: { id: room.id, inviteToken: room.inviteToken }, alreadyMember: true };
          }
          if (room.status !== "SAVING") throw new RoomJoinNotAllowedError();

          await tx.roomMember.create({
            data: {
              roomId: room.id,
              userId,
              isOwner: false,
              personalGoal: 0,
              personalSaved: 0,
            },
          });

          if (room.useSaving) {
            const members = await tx.roomMember.findMany({
              where: { roomId: room.id },
              orderBy: { id: "asc" },
              select: { id: true },
            });
            const baseGoal = Math.floor(room.goalAmount / members.length);
            const remainder = room.goalAmount % members.length;

            await Promise.all(
              members.map((member, index) =>
                tx.roomMember.update({
                  where: { id: member.id },
                  data: { personalGoal: baseGoal + (index < remainder ? 1 : 0) },
                }),
              ),
            );
          }

          return { room: { id: room.id, inviteToken: room.inviteToken }, alreadyMember: false };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );

      return result;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        const existingRoom = await findExistingRoomMember(token, userId);
        if (existingRoom?.members.length) {
          return {
            room: { id: existingRoom.id, inviteToken: existingRoom.inviteToken },
            alreadyMember: true,
          };
        }
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2034" &&
        attempt < JOIN_ROOM_RETRY_COUNT - 1
      ) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("방 참여 처리에 실패했습니다.");
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
