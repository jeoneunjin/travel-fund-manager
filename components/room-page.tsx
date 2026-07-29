import { notFound } from "next/navigation";
import type { Room } from "@/lib/types";
import { getRoom } from "@/lib/db/room";
import { RoomShell } from "@/components/room-shell";

export async function withRoom(
  roomId: string,
  children: (room: Room) => React.ReactNode
) {
  const room = await getRoom(roomId);
  if (!room) notFound();
  return <RoomShell room={room}>{children(room)}</RoomShell>;
}