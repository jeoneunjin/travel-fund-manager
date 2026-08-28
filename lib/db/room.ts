// lib/db/room.ts
import { prisma } from "@/lib/prisma";
import { Prisma, $Enums } from "@/lib/generated/prisma/client";
import { randomBytes } from "crypto";
import type { Room, Member, Expense } from "@/lib/types";

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

export class RoomInviteRequiredError extends Error {
  constructor() {
    super("초대받은 이메일이 아닙니다.");
  }
}

// User.email에 대소문자 정규화가 없어서(가입 시점 원문 그대로 저장) 초대 이메일과
// 비교할 때 양쪽 다 이 함수로 맞춰야 함
function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// 쿼리에 실제로 쓰는 include 절 — 이 상수를 타입 계산에도 그대로 재사용함
const roomInclude = {
  members: { include: { user: true } },
  expenses: { include: { shares: true } },
} satisfies Prisma.RoomInclude;

// 위 include 절 그대로 반영된 타입 — schema.prisma가 바뀌면 이 타입도 자동으로 같이 바뀜
type DbRoom = Prisma.RoomGetPayload<{ include: typeof roomInclude }>;

// expense + shares raw 데이터를 화면이 기대하는 Expense 타입 모양으로 변환
// toRoom()과 createExpense() 양쪽에서 재사용
function toExpense(e: DbRoom["expenses"][number]): Expense {
  return {
    id: e.id,
    title: e.title,
    amount: e.amount,
    payerId: e.payerId,
    splitBetweenIds: e.shares.map((s) => s.memberId),
    date: e.date.toISOString(),
    category: e.category.toLowerCase() as Expense["category"],
    place: e.place ?? undefined,
  };
}

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
    expenses: dbRoom.expenses.map(toExpense),
  };
}

function fetchRoomRaw(where: Prisma.RoomWhereUniqueInput) {
  return prisma.room.findUnique({ where, include: roomInclude });
}

// 로그인한 유저가 멤버로 속한 방만 반환 — 전체 방 목록을 노출하지 않기 위해 userId 필터 필수
export async function getRooms(userId: string): Promise<Room[]> {
  const rooms = await prisma.room.findMany({
    where: { members: { some: { userId } } },
    include: roomInclude,
    orderBy: { startDate: "asc" },
  });
  return rooms.map(toRoom);
}

export async function getRoom(roomId: string): Promise<Room | undefined> {
  const room = await fetchRoomRaw({ id: roomId });
  return room ? toRoom(room) : undefined;
}

// 방장 전용 — 호출부(API route)에서 isOwner 확인 후 불러야 함.
// 연관 데이터(지출, 멤버, 초대)를 관계 역순으로 함께 삭제
export async function deleteRoom(roomId: string): Promise<void> {
  await prisma.$transaction([
    prisma.expenseShare.deleteMany({ where: { expense: { roomId } } }),
    prisma.expense.deleteMany({ where: { roomId } }),
    prisma.roomMember.deleteMany({ where: { roomId } }),
    prisma.roomInvite.deleteMany({ where: { roomId } }),
    prisma.room.delete({ where: { id: roomId } }),
  ]);
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

export async function joinRoomByInviteToken(token: string, userId: string, email: string) {
  const normalizedEmail = normalizeEmail(email);

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

          const invite = await tx.roomInvite.findUnique({
            where: { roomId_email: { roomId: room.id, email: normalizedEmail } },
          });
          if (!invite || invite.status !== "PENDING") throw new RoomInviteRequiredError();

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

          await tx.roomInvite.update({
            where: { id: invite.id },
            data: { status: "ACCEPTED", acceptedAt: new Date() },
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

export class RoomInviteAlreadyMemberError extends Error {
  constructor() {
    super("이미 참여 중인 이메일입니다.");
  }
}

export class RoomInviteAlreadyPendingError extends Error {
  constructor() {
    super("이미 초대한 이메일입니다.");
  }
}

// 방장 전용 — 호출부(API route)에서 isOwner 확인 후 불러야 함
export async function createRoomInvite(roomId: string, email: string) {
  const normalizedEmail = normalizeEmail(email);

  const existingMember = await prisma.roomMember.findFirst({
    where: { roomId, user: { email: normalizedEmail } },
    select: { id: true },
  });
  if (existingMember) throw new RoomInviteAlreadyMemberError();

  try {
    return await prisma.roomInvite.create({
      data: { roomId, email: normalizedEmail },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new RoomInviteAlreadyPendingError();
    }
    throw error;
  }
}

// 방장 전용 — 대기 중인 초대만 반환 (수락된 건은 room.members에 이미 나오므로 제외)
export async function getPendingInvites(roomId: string) {
  const invites = await prisma.roomInvite.findMany({
    where: { roomId, status: "PENDING" },
    orderBy: { invitedAt: "desc" },
    select: { email: true, invitedAt: true },
  });
  return invites.map((i) => ({ email: i.email, invitedAt: i.invitedAt.toISOString() }));
}

export type CreateExpenseInput = {
  roomId: string;
  title: string;
  amount: number;
  payerId: string;
  splitBetweenIds: string[];
  category: Expense["category"];
  date: Date;
  place?: string;
};

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const expense = await prisma.expense.create({
    data: {
      roomId: input.roomId,
      title: input.title,
      amount: input.amount,
      payerId: input.payerId,
      place: input.place,
      date: input.date,
      category: input.category.toUpperCase() as $Enums.ExpenseCategory,
      shares: { create: input.splitBetweenIds.map((memberId) => ({ memberId })) },
    },
    include: { shares: true },
  });

  return toExpense(expense);
}

// totalExpenses/computeSettlement/getMember는 client component도 import하는 순수 함수라
// prisma를 불러오는 이 파일에서 빠져나가 lib/settlement.ts로 이동함
