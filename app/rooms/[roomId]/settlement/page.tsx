import { withRoom } from "@/components/room-page";
import { SettlementView } from "./settlement-view";

export default async function SettlementPage({
  params,
}: {
  params: { roomId: string };
}) {
  return withRoom(params.roomId, (room) => <SettlementView room={room} />);
}
