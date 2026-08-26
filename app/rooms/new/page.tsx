import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { NewRoomForm } from "./NewRoomForm";

export default async function NewRoomPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <NewRoomForm />;
}
