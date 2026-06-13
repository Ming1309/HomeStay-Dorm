import { createFileRoute } from "@tanstack/react-router";

import { RoomLookupWorkspace } from "@/features/rooms/components/RoomLookupWorkspace";

export const Route = createFileRoute("/manager/tra-cuu-phong")({
  component: ManagerRoomLookupPage,
});

function ManagerRoomLookupPage() {
  return <RoomLookupWorkspace />;
}
