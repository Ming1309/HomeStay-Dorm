import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/contract")({
  beforeLoad: () => {
    throw redirect({
      to: "/sale/lap-hop-dong",
    });
  },
});
