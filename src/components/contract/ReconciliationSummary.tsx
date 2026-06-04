import { Coins, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReconciliationResult } from "@/lib/workflow-store";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + " VNĐ";
}

export function ReconciliationSummary({
  reconciliation,
  mode,
  className,
}: {
  reconciliation: ReconciliationResult;
  mode: "refund" | "collect" | "terminate";
  className?: string;
}) {
  const isRefund = reconciliation.netRefund > 0;
  const isCollect = reconciliation.additionalDue > 0;
  const headline = isRefund
    ? "Còn dư cọc — cần hoàn trả khách"
    : isCollect
      ? "Chi phí phát sinh vượt cọc — khách phải trả thêm"
      : "Đối soát hòa vốn — không phát sinh khoản thu/hoàn";

  const accent =
    mode === "refund"
      ? "border-emerald-200 bg-emerald-50/60"
      : mode === "collect"
        ? "border-rose-200 bg-rose-50/60"
        : "border-slate-200 bg-slate-50/60";

  return (
    <Card className={cn("rounded-lg border shadow-sm", accent, className)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Coins className="size-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-700">Thông tin đối soát</h3>
          <span className="ml-auto font-mono text-[10px] font-medium text-gray-500">
            CS {reconciliation.policyCode} • {reconciliation.refundRate}%
          </span>
        </div>

        <p className="text-xs text-gray-600">{headline}</p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <SummaryRow
            label="Tiền cọc ban đầu"
            value={formatCurrency(reconciliation.initialDeposit)}
            icon={<Wallet className="size-3" />}
          />
          <SummaryRow
            label="Tiền hoàn cơ bản"
            value={formatCurrency(reconciliation.baseRefund)}
            hint={`${reconciliation.refundRate}% cọc`}
          />
          <SummaryRow
            label="Tổng khấu trừ"
            value={formatCurrency(reconciliation.deductions)}
            tone={reconciliation.deductions > 0 ? "warn" : "muted"}
          />
          {mode !== "collect" && (
            <SummaryRow
              label="Tiền hoàn thực tế"
              value={formatCurrency(reconciliation.netRefund)}
              tone={reconciliation.netRefund > 0 ? "good" : "muted"}
            />
          )}
          {mode !== "refund" && (
            <SummaryRow
              label="Tiền khách phải trả thêm"
              value={formatCurrency(reconciliation.additionalDue)}
              tone={reconciliation.additionalDue > 0 ? "bad" : "muted"}
            />
          )}
        </div>

        {mode === "terminate" && (
          <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600">
            Hợp đồng chỉ được thanh lý khi mọi nghĩa vụ tài chính đã hoàn tất.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryRow({
  label,
  value,
  hint,
  icon,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "default" | "good" | "bad" | "warn" | "muted";
}) {
  const toneClass =
    tone === "good"
      ? "text-emerald-700"
      : tone === "bad"
        ? "text-rose-700"
        : tone === "warn"
          ? "text-amber-700"
          : tone === "muted"
            ? "text-gray-400"
            : "text-gray-800";
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] text-gray-500">
        {icon}
        {label}
        {hint && <span className="ml-1 text-gray-400">({hint})</span>}
      </p>
      <p className={cn("font-mono text-sm font-semibold", toneClass)}>{value}</p>
    </div>
  );
}
