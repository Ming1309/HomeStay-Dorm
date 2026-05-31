import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { RoomLookupWorkspace } from "@/components/residence/RoomLookupWorkspace";

export const Route = createFileRoute("/accountant/tra-cuu-phong")({
  component: AccountantRoomLookupPage,
});

function AccountantRoomLookupPage() {
  const allowed = useRoleGuard("accountant");
  if (!allowed) return null;

  return (
    <RoleShell role="accountant" currentPath="/accountant/tra-cuu-phong">
      <RoomLookupWorkspace />
    </RoleShell>
  );
}
