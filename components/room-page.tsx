import { notFound, redirect } from "next/navigation";
import type { Room } from "@/lib/types";
import { getRoom } from "@/lib/db/room";
import { auth } from "@/lib/auth";
import { RoomShell } from "@/components/room-shell";

export async function withRoom(
  roomId: string,
  children: (room: Room) => React.ReactNode
) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const room = await getRoom(roomId);
  if (!room) notFound();

  // 방 존재 여부를 노출하지 않기 위해 비멤버는 404로 처리
  const isMember = room.members.some((m) => m.userId === session.user.id);
  if (!isMember) notFound();

  return <RoomShell room={room}>{children(room)}</RoomShell>;
}