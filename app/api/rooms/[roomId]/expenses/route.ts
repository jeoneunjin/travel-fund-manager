import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createExpense, getRoom } from "@/lib/db/room";

const createExpenseSchema = z.object({
  title: z.string().trim().min(1).max(100),
  amount: z.number().int().positive(),
  payerId: z.string(),
  splitBetweenIds: z
    .array(z.string())
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, "중복된 멤버가 있습니다."),
  category: z.enum(["food", "lodging", "transport", "activity", "shopping", "etc"]),
  date: z.coerce.date(),
  place: z.string().trim().min(1).max(100).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { roomId: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const room = await getRoom(params.roomId);
  if (!room) {
    return NextResponse.json({ error: "방을 찾을 수 없습니다." }, { status: 404 });
  }

  const isMember = room.members.some((m) => m.userId === session.user.id);
  if (!isMember) {
    return NextResponse.json({ error: "이 방의 멤버가 아닙니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  const memberIds = new Set(room.members.map((m) => m.id));
  const { payerId, splitBetweenIds } = parsed.data;
  if (!memberIds.has(payerId) || !splitBetweenIds.every((id) => memberIds.has(id))) {
    return NextResponse.json(
      { error: "이 방의 멤버가 아닌 대상이 포함되어 있습니다." },
      { status: 400 },
    );
  }

  try {
    const expense = await createExpense({ roomId: room.id, ...parsed.data });
    return NextResponse.json({ expense }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "지출 등록 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
