import { createFileRoute } from "@tanstack/react-router";

import { AdminRoomsBedsPage } from "@/features/administration/pages/AdminRoomsBedsPage";

export const Route = createFileRoute("/admin/rooms-beds")({ component: AdminRoomsBedsPage });
