import { createFileRoute } from "@tanstack/react-router";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
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
