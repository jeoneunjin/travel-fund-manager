import { auth } from "@/lib/auth";
import { getRoomByToken } from "@/lib/db/room";
import { PageShell } from "@/components/site-header";
import { InviteView } from "./invite-view";

export default async function InvitePage(
  props: {
    params: Promise<{ token: string }>;
  }
) {
  const params = await props.params;
  const { token } = params;
  const [session, room] = await Promise.all([auth(), getRoomByToken(token)]);

  if (!room) {
    return (
      <PageShell className="max-w-md py-20 text-center">
        <p className="text-muted-foreground">
          유효하지 않은 초대 링크입니다.
        </p>
      </PageShell>
    );
  }

  const isLoggedIn = !!session?.user;
  const isMember = session?.user
    ? room.members.some((m) => m.userId === session.user.id)
    : false;

  return (
    <InviteView room={room} token={token} isLoggedIn={isLoggedIn} isMember={isMember} />
  );
}
