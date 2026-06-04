import { createFileRoute } from "@tanstack/react-router";

import { SaleShell } from "@/components/app/SaleShell";
import { RoomLookupWorkspace } from "@/components/residence/RoomLookupWorkspace";

export const Route = createFileRoute("/sale/tra-cuu-phong")({
  component: SaleRoomLookupPage,
});

function SaleRoomLookupPage() {
  return (
    <SaleShell currentPath="/sale/tra-cuu-phong" showWorkspaceNav>
      <RoomLookupWorkspace />
    </SaleShell>
  );
}
