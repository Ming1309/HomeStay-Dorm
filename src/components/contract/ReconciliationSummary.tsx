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
  paidAmount = 0,
  className,
}: {
  reconciliation: ReconciliationResult;
  mode: "refund" | "collect" | "terminate";
  paidAmount?: number;
  className?: string;
}) {
  const isRefund = reconciliation.netRefund > 0;
  const isCollect = reconciliation.additionalDue > 0;
  const remainingDebt = Math.max(reconciliation.additionalDue - paidAmount, 0);
  const headline = isRefund
    ? "Còn dư cọc — cần hoàn trả khách"
    : isCollect
      ? "Chi phí phát sinh vượt cọc — khách phải trả thêm"
      : "Đối soát hòa vốn — không phát sinh khoản thu/hoàn";
  const isTerminate = mode === "terminate";

  const accent =
    mode === "refund"
      ? "border-emerald-200 bg-emerald-50/60"
      : mode === "collect"
        ? "border-rose-200 bg-rose-50/60"
        : "border-slate-200 bg-slate-50/60";

  return (
    <Card className={cn("rounded-lg border", accent, className)}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <Coins className="size-4 text-gray-600" />
          <h3 className="text-xs font-semibold text-gray-700">
            {isTerminate ? "Kết quả đối soát đã chốt" : "Thông tin đối soát"}
          </h3>
          <span className="ml-auto font-mono text-[10px] font-medium text-gray-500">
            CS {reconciliation.policyCode} • {reconciliation.refundRate}%
          </span>
        </div>

        <p className="text-xs text-gray-600">
          {isTerminate
            ? "Dữ liệu do Kế toán lập, Quản lý chỉ xem và xác nhận trước khi thanh lý."
            : headline}
        </p>

        {isTerminate ? (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-md border border-gray-200 bg-white p-3">
              <h4 className="mb-3 text-[11px] font-semibold text-gray-700">Kết quả đối soát</h4>
              <div className="space-y-2 text-sm">
                <SummaryRow
                  label="Tiền cọc ban đầu"
                  value={formatCurrency(reconciliation.initialDeposit)}
                  icon={<Wallet className="size-3" />}
                />
                <SummaryRow
                  label="Tổng khấu trừ"
                  value={formatCurrency(reconciliation.deductions)}
                  tone={reconciliation.deductions > 0 ? "warn" : "muted"}
                />
                <SummaryRow
                  label="Tiền hoàn cơ bản"
                  value={formatCurrency(reconciliation.baseRefund)}
                  hint={`${reconciliation.refundRate}% cọc`}
                />
                <SummaryRow
                  label="Tiền hoàn thực tế"
                  value={formatCurrency(reconciliation.netRefund)}
                  tone={reconciliation.netRefund > 0 ? "good" : "muted"}
                />
              </div>
            </div>
            <div
              className={cn(
                "rounded-md border bg-white p-3",
                remainingDebt > 0 ? "border-rose-200" : "border-emerald-200",
              )}
            >
              <h4 className="mb-3 text-[11px] font-semibold text-gray-700">Công nợ phát sinh</h4>
              <div className="space-y-2 text-sm">
                <SummaryRow
                  label="Tiền khách phải trả thêm"
                  value={formatCurrency(reconciliation.additionalDue)}
                  tone={reconciliation.additionalDue > 0 ? "bad" : "muted"}
                />
                <SummaryRow
                  label="Khách đã thanh toán"
                  value={formatCurrency(paidAmount)}
                  tone={paidAmount > 0 ? "good" : "muted"}
                />
                <SummaryRow
                  label="Còn phải thu"
                  value={formatCurrency(remainingDebt)}
                  tone={remainingDebt > 0 ? "bad" : "good"}
                  important
                />
              </div>
            </div>
          </div>
        ) : (
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
        )}

        {isTerminate ? (
          <div
            className={cn(
              "rounded-md border px-3 py-2 text-[11px]",
              remainingDebt > 0
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-emerald-200 bg-emerald-50 text-emerald-700",
            )}
          >
            {remainingDebt > 0
              ? "Khách còn công nợ chưa thanh toán. Không thể thanh lý hợp đồng."
              : "Đủ điều kiện tài chính để thanh lý."}
          </div>
        ) : null}
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
  important = false,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "default" | "good" | "bad" | "warn" | "muted";
  important?: boolean;
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
      <p className={cn("font-mono font-semibold", important ? "text-base" : "text-sm", toneClass)}>
        {value}
      </p>
    </div>
  );
}
