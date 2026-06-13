import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/accountant/receipts")({
  beforeLoad: () => {
    throw redirect({ to: "/accountant/payments" });
  },
});
