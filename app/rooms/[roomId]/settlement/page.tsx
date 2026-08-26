import { withRoom } from "@/components/room-page";
import { SettlementView } from "./settlement-view";

export default async function SettlementPage(
  props: {
    params: Promise<{ roomId: string }>;
  }
) {
  const params = await props.params;
  return withRoom(params.roomId, (room) => <SettlementView room={room} />);
}
