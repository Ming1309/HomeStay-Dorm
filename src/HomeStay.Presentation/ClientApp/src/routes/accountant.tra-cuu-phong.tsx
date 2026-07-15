import { createFileRoute } from "@tanstack/react-router";
import { RoomLookupWorkspace } from "@/features/rooms/components/RoomLookupWorkspace";

export const Route = createFileRoute('/accountant/tra-cuu-phong')({
  component: RoomLookupWorkspace,
});
