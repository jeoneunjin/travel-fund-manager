import { notFound } from "next/navigation";
import type { Room } from "@/lib/types";
import { getRoom } from "@/lib/mock-data";
import { RoomShell } from "@/components/room-shell";

export function withRoom(
  roomId: string,
  children: (room: Room) => React.ReactNode
) {
  const room = getRoom(roomId);
  if (!room) notFound();
  return <RoomShell room={room}>{children(room)}</RoomShell>;
}
