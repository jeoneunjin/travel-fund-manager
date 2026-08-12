import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createRoom } from "@/lib/db/room";

const createRoomSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    destination: z.string().trim().min(1).max(100),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    useSaving: z.boolean(),
    goalAmount: z.number().int().positive().optional(),
    expectedPeople: z.number().int().min(1).max(100),
  })
  .superRefine((data, context) => {
    if (data.endDate < data.startDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endDate"],
        message: "종료일은 시작일보다 빠를 수 없습니다.",
      });
    }

    if (data.useSaving && data.goalAmount === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["goalAmount"],
        message: "적립을 사용하는 방은 목표 금액이 필요합니다.",
      });
    }
  });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createRoomSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const room = await createRoom({ ...parsed.data, ownerId: session.user.id });
    return NextResponse.json({ room }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "방 생성 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
