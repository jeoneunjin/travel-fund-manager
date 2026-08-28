import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import {
  createRoomInvite,
  getPendingInvites,
  getRoom,
  RoomInviteAlreadyMemberError,
  RoomInviteAlreadyPendingError,
} from "@/lib/db/room";

const createInviteSchema = z.object({
  email: z.string().trim().email(),
});

async function requireOwner(roomId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 }) };
  }

  const room = await getRoom(roomId);
  if (!room) {
    return { error: NextResponse.json({ error: "방을 찾을 수 없습니다." }, { status: 404 }) };
  }

  const me = room.members.find((m) => m.userId === session.user.id);
  if (!me?.isOwner) {
    return { error: NextResponse.json({ error: "방장만 초대할 수 있습니다." }, { status: 403 }) };
  }

  return { room };
}

export async function GET(_req: NextRequest, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  const result = await requireOwner(params.roomId);
  if (result.error) return result.error;

  const invites = await getPendingInvites(result.room.id);
  return NextResponse.json({ invites });
}

export async function POST(req: NextRequest, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  const result = await requireOwner(params.roomId);
  if (result.error) return result.error;

  if (result.room.status !== "saving") {
    return NextResponse.json(
      { error: "여행이 시작된 방에는 초대할 수 없습니다." },
      { status: 409 },
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = createInviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "이메일 형식이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    await createRoomInvite(result.room.id, parsed.data.email);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof RoomInviteAlreadyMemberError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof RoomInviteAlreadyPendingError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: "초대 중 문제가 발생했습니다." }, { status: 500 });
  }
}
