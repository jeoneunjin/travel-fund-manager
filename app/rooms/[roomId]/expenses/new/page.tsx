import { withRoom } from "@/components/room-page";
import { NewExpenseForm } from "./new-expense-form";

export default async function NewExpensePage(
  props: {
    params: Promise<{ roomId: string }>;
  }
) {
  const params = await props.params;
  return withRoom(params.roomId, (room) => <NewExpenseForm room={room} />);
}
