import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { AppointmentQueue } from "@/features/appointments/components/AppointmentQueue";
import { MHLapPhieuCoc } from "@/features/deposits/components/MHLapPhieuCoc";
import type { Appointment } from "@/app/providers/workflow-store";

export const Route = createFileRoute("/sale/lap-phieu-coc")({
  component: RouteComponent,
});

function RouteComponent() {
  const [lichHenDaChon, setLichHenDaChon] = useState<Appointment | null>(null);
  const [maLichHenDaXuLy, setMaLichHenDaXuLy] = useState<string[]>([]);

  return (
    <main className="flex h-full min-h-0 bg-gray-50">
      <AppointmentQueue
        selectedId={lichHenDaChon?.id ?? null}
        excludedIds={maLichHenDaXuLy}
        onSelect={setLichHenDaChon}
      />
      {lichHenDaChon ? (
        <MHLapPhieuCoc
          lichHen={lichHenDaChon}
          khiHoanTat={(maLichHen) => {
            setMaLichHenDaXuLy((hienTai) => [...hienTai, maLichHen]);
            setLichHenDaChon(null);
          }}
        />
      ) : (
        <section className="flex flex-1 items-center justify-center text-sm text-gray-500">
          Chọn một lịch hẹn để lập phiếu cọc.
        </section>
      )}
    </main>
  );
}
