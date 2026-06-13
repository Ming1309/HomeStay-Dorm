import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  Calculator,
  CheckCircle2,
  FileText,
  Receipt,
  Search,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";


import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import {
  useWorkflowStore,
  type AssetRecovery,
  type AssetRecoveryItem,
  type ContractItem,
  type DepositRequest,
  type DepositPolicyVersion,
} from "@/app/providers/workflow-store";

type ReconciliationProfile =
  | {
      kind: "contract";
      id: string;
      customerCode: string;
      customerName: string;
      phone: string;
      room: string;
      createdAt: string;
      returnedAt: string;
      initialDeposit: number;
      contract: ContractItem;
      deposit?: never;
    }
  | {
      kind: "cancelled_deposit";
      id: string;
      customerCode: string;
      customerName: string;
      phone: string;
      room: string;
      createdAt: string;
      returnedAt: string;
      initialDeposit: number;
      deposit: DepositRequest;
      contract?: never;
    };

type DeductionRow = {
  id: string;
  type: "Điện nước" | "Dịch vụ" | "Bồi thường";
  content: string;
  date: string;
  amount: number;
  status: "Chưa thanh toán";
};



export function AccountantReconciliationPage() {

  const { contracts, depositRequests, depositPolicies, assetRecoveries } = useWorkflowStore();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

  const activePolicy = useMemo(() => getActivePolicy(depositPolicies), [depositPolicies]);
  const profiles = useMemo(
    () => buildProfiles(contracts, depositRequests),
    [contracts, depositRequests],
  );
  const filteredProfiles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return profiles;
    return profiles.filter((profile) =>
      [profile.id, profile.customerName, profile.room, profile.customerCode]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [profiles, query]);

  const selected =
    filteredProfiles.find((profile) => profile.id === selectedId) ?? filteredProfiles[0] ?? null;

  const calculation = useMemo(() => {
    if (!selected || !activePolicy) return null;
    return calculateReconciliation(selected, activePolicy, assetRecoveries);
  }, [activePolicy, assetRecoveries, selected]);



  const handleCreate = () => {
    if (!selected || !calculation) return;
    const code = `PDS-${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}`;
    setIssuedCode(code);
    toast.success("Lập phiếu đối soát thành công", {
      description: `${code} đã chốt và gửi thông báo sang Quản lý.`,
      icon: <CheckCircle2 className="size-4 text-emerald-600" />,
    });
  };

  return (
      <div className="flex h-full overflow-hidden bg-gray-50">
        <aside className="flex w-[360px] shrink-0 flex-col border-r border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-4">
            <h1 className="text-base font-bold text-gray-900">Lập phiếu đối soát</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tính toán hoàn cọc, khấu trừ và chốt kết quả tài chính
            </p>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm hồ sơ, khách hàng, phòng…"
                className="h-10 rounded-lg border-gray-200 pl-9 text-sm shadow-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filteredProfiles.length > 0 ? (
              filteredProfiles.map((profile) => (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(profile.id);
                    setIssuedCode(null);
                  }}
                  className={cn(
                    "mb-2 w-full rounded-lg border px-3 py-3 text-left transition-colors",
                    selected?.id === profile.id
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-bold text-blue-700">
                        {getProfileDisplayId(profile)}
                      </p>
                      <p className="mt-1 truncate text-sm font-semibold text-gray-900">
                        {profile.customerName}
                      </p>
                    </div>
                    <Badge className="shrink-0 bg-amber-100 text-[10px] font-semibold text-amber-700">
                      Chờ đối soát
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="text-gray-500">{getRoomBedSummary(profile)}</span>
                    <span className="font-mono font-bold text-gray-800">
                      {formatCurrency(profile.initialDeposit)}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
                Không có hồ sơ nào đang chờ đối soát.
              </div>
            )}
          </div>
        </aside>

        {!selected || !calculation || !activePolicy ? (
          <section className="flex flex-1 items-center justify-center bg-gray-50/60">
            <p className="text-sm text-gray-500">Chọn hồ sơ để lập phiếu đối soát.</p>
          </section>
        ) : (
          <section className="flex h-full flex-1 flex-col overflow-hidden">
            <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-700">
                    {getProfileDisplayId(selected)}
                  </span>
                  <h2 className="truncate text-base font-bold text-gray-900">
                    {selected.customerName}
                  </h2>
                  {selected.kind === "cancelled_deposit" && (
                    <Badge className="h-5 bg-blue-100 text-[10px] font-semibold text-blue-700">
                      {getProfileTypeLabel(selected)}
                    </Badge>
                  )}
                  <Badge className="h-5 bg-amber-100 text-[10px] font-semibold text-amber-700">
                    Chờ đối soát
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-gray-500">{getRoomBedSummary(selected)}</p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Kết quả tạm tính
                </p>
                <p
                  className={cn(
                    "font-mono text-lg font-bold",
                    calculation.finalAmount >= 0 ? "text-emerald-700" : "text-rose-700",
                  )}
                >
                  {formatCurrency(Math.abs(calculation.finalAmount))}
                </p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mx-auto max-w-6xl space-y-4">
                <Card title="Thông tin hồ sơ">
                  <ProfileInfo profile={selected} />
                </Card>

                <Card
                  title="Chính sách hoàn cọc áp dụng"
                  icon={<FileText className="size-4 text-blue-600" />}
                >
                  <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3 text-sm text-gray-700">
                      <PolicyLine
                        label="Đã đặt cọc nhưng chưa ký hợp đồng"
                        value={activePolicy.tiLeChuaKy}
                      />
                      <PolicyLine
                        label={`Đã ký hợp đồng, lưu trú dưới ${activePolicy.mocLuuTru} tháng`}
                        value={activePolicy.tiLeTruocHanNganHan}
                      />
                      <PolicyLine
                        label={`Đã ký hợp đồng, lưu trú trên ${activePolicy.mocLuuTru} tháng`}
                        value={activePolicy.tiLeTruocHanDaiHan}
                      />
                      <PolicyLine label="Hết hạn hợp đồng" value={activePolicy.tiLeDungHan} />
                    </div>
                    <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                      <Info label="Chính sách" value={activePolicy.maChinhSach} mono />
                      <div className="mt-3 grid gap-2">
                        <SummaryLine label="Tiền cọc ban đầu" value={calculation.initialDeposit} />
                        <SummaryLine
                          label="Tỷ lệ hoàn cọc"
                          textValue={`${calculation.refundRate}%`}
                        />
                        <SummaryLine
                          label="Số tiền hoàn cọc cơ bản"
                          value={calculation.baseRefund}
                          highlight
                        />
                      </div>
                    </div>
                  </div>
                </Card>

                <Card
                  title="Các khoản khấu trừ phát sinh"
                  icon={<Receipt className="size-4 text-blue-600" />}
                >
                  {selected.kind === "cancelled_deposit" ? (
                    <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-3 text-sm text-blue-800">
                      Phiếu cọc đã hủy, áp dụng chính sách hoàn cọc. Không phát sinh khấu trừ từ hóa
                      đơn lưu trú.
                    </div>
                  ) : (
                    <DeductionTable rows={calculation.deductions} />
                  )}
                  <div className="mt-3 grid gap-3 md:grid-cols-5">
                    <SummaryLine
                      label="Tiền thuê còn nợ"
                      value={calculation.deductionTotals.rent}
                    />
                    <SummaryLine
                      label="Điện nước/Dịch vụ"
                      value={calculation.deductionTotals.service}
                    />
                    <SummaryLine
                      label="Bồi thường/Hư hỏng"
                      value={calculation.deductionTotals.compensation}
                    />
                    <SummaryLine label="Khoản phạt" value={calculation.deductionTotals.penalty} />
                    <SummaryLine
                      label="Tổng khấu trừ"
                      value={calculation.totalDeductions}
                      highlight
                    />
                  </div>
                </Card>

                <Card
                  title="Kết quả đối soát"
                  icon={<Calculator className="size-4 text-blue-600" />}
                >
                  <CalculationSummary calculation={calculation} />
                  <ResultFormula calculation={calculation} />
                  <ResultBanner amount={calculation.finalAmount} />
                </Card>
              </div>
            </div>

            <footer className="sticky bottom-0 flex min-h-16 items-center justify-between border-t border-gray-200 bg-white px-5 py-3">
              <div className="text-xs text-gray-500">
                {issuedCode ? (
                  <span className="font-semibold text-emerald-700">
                    Đã chốt phiếu đối soát {issuedCode}
                  </span>
                ) : (
                  <span>Hệ thống sẽ gửi thông báo sang Quản lý sau khi tạo phiếu.</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  className="h-9 bg-blue-600 hover:bg-blue-700"
                  onClick={handleCreate}
                >
                  <CheckCircle2 className="size-4" />
                  Tạo phiếu đối soát
                </Button>
                {issuedCode && calculation.finalAmount > 0 && (
                  <Button type="button" variant="outline" className="h-9" asChild>
                    <Link to="/accountant/refunds">
                      Lập phiếu hoàn cọc
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
                {issuedCode && calculation.finalAmount < 0 && (
                  <Button type="button" variant="outline" className="h-9" asChild>
                    <Link to="/accountant/thanh-toan-tra-phong">
                      Thanh toán trả phòng
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>
            </footer>
          </section>
        )}
      </div>
  );
}

function buildProfiles(
  contracts: ContractItem[],
  depositRequests: DepositRequest[],
): ReconciliationProfile[] {
  const contractProfiles: ReconciliationProfile[] = contracts
    .filter((contract) => contract.status === "pending_settlement")
    .map((contract) => ({
      kind: "contract",
      id: contract.id,
      customerCode: getCustomerCode(contract.id),
      customerName: contract.customerName,
      phone: contract.phone,
      room: contract.room,
      createdAt: contract.rentalPeriod.split(" - ")[0] ?? formatDate(new Date(contract.createdAt)),
      returnedAt: contract.rentalPeriod.split(" - ")[1] ?? formatDate(new Date()),
      initialDeposit: contract.invoiceTotal,
      contract,
    }));

  const cancelledDeposits: ReconciliationProfile[] = depositRequests
    .filter((deposit) => deposit.status === "cancelled" && (deposit.depositAmount ?? 0) > 0)
    .map((deposit) => ({
      kind: "cancelled_deposit",
      id: deposit.code,
      customerCode: getCustomerCode(deposit.id),
      customerName: deposit.customerName,
      phone: deposit.phone,
      room: deposit.room,
      createdAt: formatDate(new Date(deposit.createdAt)),
      returnedAt: formatDate(new Date(deposit.updatedAt)),
      initialDeposit: deposit.depositAmount ?? 0,
      deposit,
    }));

  return [...contractProfiles, ...cancelledDeposits];
}

function calculateReconciliation(
  profile: ReconciliationProfile,
  policy: DepositPolicyVersion,
  assetRecoveries: AssetRecovery[],
) {
  const refundRate = getRefundRate(profile, policy);
  const baseRefund = Math.round(profile.initialDeposit * (refundRate / 100));
  const deductions =
    profile.kind === "contract" ? buildDeductions(profile.contract, assetRecoveries) : [];
  const totalDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);
  const finalAmount = baseRefund - totalDeductions;
  const deductionTotals = {
    rent: 0,
    service: deductions
      .filter((item) => item.type === "Điện nước" || item.type === "Dịch vụ")
      .reduce((sum, item) => sum + item.amount, 0),
    compensation: deductions
      .filter((item) => item.type === "Bồi thường")
      .reduce((sum, item) => sum + item.amount, 0),
    penalty: 0,
  };
  return {
    initialDeposit: profile.initialDeposit,
    refundRate,
    baseRefund,
    deductions,
    deductionTotals,
    totalDeductions,
    finalAmount,
  };
}

function buildDeductions(contract: ContractItem, assetRecoveries: AssetRecovery[]): DeductionRow[] {
  const recovery = assetRecoveries.find((item) => item.contractId === contract.id);
  const invoiceDate = recovery ? formatDate(new Date(recovery.recordedAt)) : "03/06/2026";
  const compensationTotal =
    recovery?.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) ?? 0;

  return [
    {
      id: "HD-DV-002",
      type: "Dịch vụ",
      content: "Phí vệ sinh cuối kỳ",
      date: invoiceDate,
      amount: 150000,
      status: "Chưa thanh toán",
    },
    {
      id: "HD-BT-003",
      type: "Bồi thường",
      content: "Bồi thường hư hỏng tài sản",
      date: invoiceDate,
      amount: compensationTotal,
      status: "Chưa thanh toán",
    },
  ];
}

function ProfileInfo({ profile }: { profile: ReconciliationProfile }) {
  const rental = getRentalDisplay(profile);
  if (profile.kind === "cancelled_deposit") {
    return (
      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <Info label="Mã phiếu cọc" value={profile.id} mono />
        <Info label="Mã khách hàng" value={profile.customerCode} mono />
        <Info label="Họ tên khách hàng" value={profile.customerName} />
        <Info label="Số điện thoại" value={profile.phone} mono />
        <Info label="Hình thức thuê" value={rental.typeLabel} />
        <Info label="Phòng" value={rental.room} mono />
        {rental.bed && <Info label="Giường" value={rental.bed} mono />}
        <Info label="Ngày đặt cọc" value={profile.createdAt} />
        <Info label="Ngày hủy cọc" value={profile.returnedAt} />
        <Info label="Tiền cọc đã thanh toán" value={formatCurrency(profile.initialDeposit)} mono />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-5">
      <Info label="Mã hợp đồng" value={getProfileDisplayId(profile)} mono />
      <Info label="Mã khách hàng" value={profile.customerCode} mono />
      <Info label="Họ tên khách hàng" value={profile.customerName} />
      <Info label="Số điện thoại" value={profile.phone} mono />
      <Info label="Hình thức thuê" value={rental.typeLabel} />
      <Info label="Phòng" value={rental.room} mono />
      {rental.bed && <Info label="Giường" value={rental.bed} mono />}
      <Info label="Ngày nhận phòng" value={profile.createdAt} />
      <Info label="Ngày trả phòng" value={profile.returnedAt} />
      <Info
        label="Thời gian lưu trú"
        value={getStayDuration(profile.createdAt, profile.returnedAt)}
      />
      <Info label="Tiền cọc ban đầu" value={formatCurrency(profile.initialDeposit)} mono />
    </div>
  );
}

function DeductionTable({ rows }: { rows: DeductionRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-6 text-center text-sm text-gray-500">
        Không có khoản khấu trừ phát sinh.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-lg border border-gray-100">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
          <tr>
            <th className="px-3 py-2">Mã hóa đơn</th>
            <th className="px-3 py-2">Loại hóa đơn</th>
            <th className="px-3 py-2">Nội dung</th>
            <th className="px-3 py-2">Ngày lập</th>
            <th className="px-3 py-2 text-right">Số tiền</th>
            <th className="px-3 py-2">Trạng thái hóa đơn</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {rows.map((row) => (
            <tr key={row.id} className="align-top">
              <td className="px-3 py-3 font-mono text-xs font-semibold text-blue-700">{row.id}</td>
              <td className="px-3 py-3 text-gray-700">{row.type}</td>
              <td className="px-3 py-3 font-medium text-gray-900">{row.content}</td>
              <td className="px-3 py-3 text-gray-600">{row.date}</td>
              <td className="px-3 py-3 text-right font-mono font-semibold text-rose-700">
                {formatCurrency(row.amount)}
              </td>
              <td className="px-3 py-3">
                <Badge className="bg-orange-100 text-orange-700">{row.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultBanner({ amount }: { amount: number }) {
  if (amount > 0) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
        <p className="text-sm font-bold text-emerald-700">Số tiền khách được hoàn</p>
        <p className="mt-1 font-mono text-2xl font-bold text-emerald-800">
          {formatCurrency(amount)}
        </p>
      </div>
    );
  }
  if (amount < 0) {
    return (
      <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-4">
        <p className="text-sm font-bold text-rose-700">Số tiền khách phải đóng thêm</p>
        <p className="mt-1 font-mono text-2xl font-bold text-rose-800">
          {formatCurrency(Math.abs(amount))}
        </p>
      </div>
    );
  }
  return (
    <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-4">
      <p className="text-sm font-bold text-gray-700">Không phát sinh hoàn/thu thêm</p>
      <p className="mt-1 font-mono text-2xl font-bold text-gray-900">0 VNĐ</p>
    </div>
  );
}

function CalculationSummary({
  calculation,
}: {
  calculation: ReturnType<typeof calculateReconciliation>;
}) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Chi tiết tính toán
      </p>
      <div className="mt-3 space-y-2 text-sm">
        <ResultLine label="Tiền cọc ban đầu" value={formatCurrency(calculation.initialDeposit)} />
        <ResultLine label="Tỷ lệ hoàn cọc" value={`${calculation.refundRate}%`} />
        <ResultLine
          label="Số tiền hoàn cọc cơ bản"
          value={formatCurrency(calculation.baseRefund)}
        />
        <ResultLine label="Tổng khấu trừ" value={formatCurrency(calculation.totalDeductions)} />
      </div>
    </div>
  );
}

function ResultFormula({
  calculation,
}: {
  calculation: ReturnType<typeof calculateReconciliation>;
}) {
  return (
    <div className="mt-3 rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Công thức</p>
      <p className="mt-2 font-medium text-gray-800">
        Số tiền cuối cùng = Số tiền hoàn cọc cơ bản - Tổng khấu trừ
      </p>
      <p className="mt-1 font-mono text-sm font-bold text-gray-900">
        {formatCurrency(calculation.baseRefund)} - {formatCurrency(calculation.totalDeductions)} ={" "}
        {formatCurrency(Math.abs(calculation.finalAmount))}
      </p>
    </div>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
      <span className="text-gray-600">{label}</span>
      <span className="font-mono font-bold text-gray-900">{value}</span>
    </div>
  );
}

function Card({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-gray-500">{label}</p>
      <p className={cn("mt-0.5 text-sm text-gray-900", mono && "font-mono")}>{value}</p>
    </div>
  );
}

function PolicyLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className="font-mono font-bold text-gray-900">{value}%</span>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  textValue,
  highlight,
}: {
  label: string;
  value?: number;
  textValue?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2",
        highlight ? "border-blue-100 bg-blue-50" : "border-gray-100 bg-white",
      )}
    >
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={cn(
          "mt-1 font-mono text-sm font-bold",
          highlight ? "text-blue-700" : "text-gray-900",
        )}
      >
        {textValue ?? formatCurrency(value ?? 0)}
      </p>
    </div>
  );
}

function getActivePolicy(policies: DepositPolicyVersion[]) {
  return (
    policies.find((policy) => {
      const today = new Date();
      const start = new Date(`${policy.ngayApDung}T00:00:00`);
      const end = policy.ngayKetThuc ? new Date(`${policy.ngayKetThuc}T23:59:59`) : null;
      return start <= today && (!end || end >= today);
    }) ??
    policies[0] ??
    null
  );
}

function getRefundRate(profile: ReconciliationProfile, policy: DepositPolicyVersion) {
  if (profile.kind === "cancelled_deposit") return policy.tiLeChuaKy;
  const months = getStayMonths(profile.createdAt, profile.returnedAt);
  if (months >= 12) return policy.tiLeDungHan;
  if (months < policy.mocLuuTru) return policy.tiLeTruocHanNganHan;
  return policy.tiLeTruocHanDaiHan;
}

function getProfileTypeLabel(profile: ReconciliationProfile) {
  return profile.kind === "contract" ? "" : "Phiếu cọc đã hủy";
}

function getProfileDisplayId(profile: ReconciliationProfile) {
  return profile.kind === "contract" ? profile.id.replace("-PC", "-") : profile.id;
}

function getRoomBedSummary(profile: ReconciliationProfile) {
  const rental = getRentalDisplay(profile);
  return rental.bed ? `${rental.room} · ${rental.bed}` : `${rental.room} · Nguyên phòng`;
}

function getRentalDisplay(profile: ReconciliationProfile): {
  typeLabel: "Ở ghép" | "Nguyên phòng";
  room: string;
  bed?: string;
} {
  if (profile.kind === "cancelled_deposit") {
    const isShared = profile.deposit.rentalType === "shared";
    return {
      typeLabel: isShared ? "Ở ghép" : "Nguyên phòng",
      room: profile.room,
      bed: isShared ? getBedDisplayCode(profile.deposit.selectedBedIds[0]) : undefined,
    };
  }

  const bedByContract: Record<string, string> = {
    "HD-PC015": "G02",
  };
  const bed = bedByContract[profile.id];
  return {
    typeLabel: bed ? "Ở ghép" : "Nguyên phòng",
    room: profile.room,
    bed,
  };
}

function getBedDisplayCode(bedId: string | undefined) {
  if (!bedId) return undefined;
  const bedNumber = bedId.split("-").at(-1);
  return bedNumber ? `G${bedNumber.padStart(2, "0")}` : undefined;
}

function getStayDuration(start: string, end: string) {
  const months = getStayMonths(start, end);
  return months > 0 ? `${months} tháng` : "Dưới 1 tháng";
}

function getStayMonths(start: string, end: string) {
  const startDate = parseViDate(start);
  const endDate = parseViDate(end);
  const diff = Math.max(endDate.getTime() - startDate.getTime(), 0);
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
}

function parseViDate(value: string) {
  const parts = value.split("/");
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  return new Date(value);
}

function getCustomerCode(id: string) {
  return `KH-${id.replace(/\D/g, "").padStart(5, "0").slice(-5)}`;
}

function formatCurrency(amount: number) {
  return `${new Intl.NumberFormat("vi-VN").format(Math.max(amount, 0))} VNĐ`;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN").format(date);
}
