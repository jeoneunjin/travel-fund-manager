import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteRoom, getRoom } from "@/lib/db/room";

export async function DELETE(_req: NextRequest, props: { params: Promise<{ roomId: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const room = await getRoom(params.roomId);
  if (!room) {
    return NextResponse.json({ error: "방을 찾을 수 없습니다." }, { status: 404 });
  }

  const me = room.members.find((m) => m.userId === session.user.id);
  if (!me?.isOwner) {
    return NextResponse.json({ error: "방장만 삭제할 수 있습니다." }, { status: 403 });
  }

  try {
    await deleteRoom(room.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "방 삭제 중 문제가 발생했습니다." }, { status: 500 });
  }
}
