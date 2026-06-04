import { createFileRoute } from "@tanstack/react-router";

import { RoleShell, useRoleGuard } from "@/components/app/RoleShell";
import { RoomLookupWorkspace } from "@/components/residence/RoomLookupWorkspace";

export const Route = createFileRoute("/manager/tra-cuu-phong")({
  component: ManagerRoomLookupPage,
});

function ManagerRoomLookupPage() {
  const allowed = useRoleGuard("manager");
  if (!allowed) return null;

  return (
    <RoleShell role="manager" currentPath="/manager/tra-cuu-phong">
      <RoomLookupWorkspace />
    </RoleShell>
  );
}
