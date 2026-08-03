import { withRoom } from "@/components/room-page";
import { ExpensesView } from "./expenses-view";

export default async function ExpensesPage({
  params,
}: {
  params: { roomId: string };
}) {
  return withRoom(params.roomId, (room) => <ExpensesView room={room} />);
}
