import { createFileRoute } from "@tanstack/react-router";

import { MHLapPhieuCoc } from "@/features/deposits/components/MHLapPhieuCoc";

export const Route = createFileRoute("/sale/lap-phieu-coc")({
  component: MHLapPhieuCoc,
});
