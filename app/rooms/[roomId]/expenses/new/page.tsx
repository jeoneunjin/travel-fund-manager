import { withRoom } from "@/components/room-page";
import { NewExpenseForm } from "./new-expense-form";

export default async function NewExpensePage({
  params,
}: {
  params: { roomId: string };
}) {
  return withRoom(params.roomId, (room) => <NewExpenseForm room={room} />);
}
