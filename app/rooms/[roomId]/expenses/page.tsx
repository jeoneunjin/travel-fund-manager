import { withRoom } from "@/components/room-page";
import { ExpensesView } from "./expenses-view";

export default async function ExpensesPage(
  props: {
    params: Promise<{ roomId: string }>;
  }
) {
  const params = await props.params;
  return withRoom(params.roomId, (room) => <ExpensesView room={room} />);
}
