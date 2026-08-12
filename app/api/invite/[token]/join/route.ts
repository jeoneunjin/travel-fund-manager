import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { joinRoomByInviteToken, RoomJoinNotAllowedError } from "@/lib/db/room";

const inviteTokenSchema = z
  .string()
  .trim()
  .min(1)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/);

export async function POST(
  _request: NextRequest,
  { params }: { params: { token: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const parsed = inviteTokenSchema.safeParse(params.token);
  if (!parsed.success) {
    return NextResponse.json({ error: "초대 코드가 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const result = await joinRoomByInviteToken(parsed.data, session.user.id);
    if (!result) {
      return NextResponse.json({ error: "유효하지 않은 초대 링크입니다." }, { status: 404 });
    }

    return NextResponse.json(
      result,
      { status: result.alreadyMember ? 200 : 201 },
    );
  } catch (error) {
    if (error instanceof RoomJoinNotAllowedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { error: "방 참여 중 문제가 발생했습니다." },
      { status: 500 },
    );
  }
}
