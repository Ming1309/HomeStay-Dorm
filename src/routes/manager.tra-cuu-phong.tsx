import { createFileRoute } from "@tanstack/react-router";

import { RoleShell } from "@/components/app/RoleShell";
import { useRoleGuard } from "@/components/app/useRoleGuard";
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
