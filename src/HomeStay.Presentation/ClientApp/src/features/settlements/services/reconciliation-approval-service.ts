import { z } from "zod";

const finiteMoney = z.number().finite().nonnegative();
const resultType = z.enum(["Hoan", "ThuThem", "HoaVon"]);
const dateString = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !Number.isNaN(Date.parse(value)), "Ngày không đúng định dạng.");

const queueItemSchema = z
  .object({
    maPDS: z.string().trim().min(1),
    maHD: z.string().trim().min(1).nullable().optional(),
    maPhieuCoc: z.string().trim().min(1),
    ngayDoiSoat: dateString,
    tenKhachHang: z.string().trim().min(1),
    soDienThoai: z.string(),
    phong: z.string().trim().min(1),
    loaiKetQua: resultType,
    soTienKetQua: finiteMoney,
    trangThai: z.literal("ChoXacNhan"),
  })
  .strict();

const invoiceSchema = z
  .object({
    maHoaDon: z.string().trim().min(1),
    loaiHoaDon: z.string().trim().min(1),
    tongTien: finiteMoney,
    ngayLap: dateString,
  })
  .strict();

const detailSchema = z
  .object({
    maPDS: z.string().trim().min(1),
    maHD: z.string().trim().min(1).nullable().optional(),
    maPhieuCoc: z.string().trim().min(1),
    ngayDoiSoat: dateString,
    tenKhachHang: z.string().trim().min(1),
    soDienThoai: z.string(),
    email: z.string(),
    soGiayTo: z.string(),
    phong: z.string().trim().min(1),
    soTienCoc: finiteMoney.positive(),
    tyLeHoanCoc: z.number().finite().min(0).max(1),
    tienHoanCoBan: finiteMoney,
    tongKhauTru: finiteMoney,
    tienHoan: finiteMoney,
    tienThuThem: finiteMoney,
    loaiKetQua: resultType,
    soTienKetQua: finiteMoney,
    trangThai: z.literal("ChoXacNhan"),
    ghiChu: z.string().nullable().optional(),
    duDieuKienXacNhan: z.boolean(),
    lyDoKhongDuDieuKien: z.string().nullable().optional(),
    hoaDons: z.array(invoiceSchema),
  })
  .strict();

export type ReconciliationApprovalQueueItem = z.infer<typeof queueItemSchema>;
export type ReconciliationApprovalDetail = z.infer<typeof detailSchema>;
export type ReconciliationResultType = z.infer<typeof resultType>;

export class ReconciliationApprovalApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ReconciliationApprovalApiError";
  }
}

async function readJson(response: Response) {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Không thể xử lý yêu cầu. Vui lòng thử lại.";
    throw new ReconciliationApprovalApiError(message, response.status);
  }
  return payload;
}

function parseContract<T>(schema: z.ZodType<T>, payload: unknown): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ReconciliationApprovalApiError(
      "Dữ liệu xác nhận đối soát không đúng định dạng. Vui lòng tải lại hệ thống.",
    );
  }
  return result.data;
}

export async function loadReconciliationApprovalQueue(signal?: AbortSignal) {
  const payload = await readJson(
    await fetch("/api/reconciliation-approvals/cho-xac-nhan", { signal }),
  );
  return parseContract(z.array(queueItemSchema), payload);
}

export async function loadReconciliationApprovalDetail(maPDS: string, signal?: AbortSignal) {
  const payload = await readJson(
    await fetch(`/api/reconciliation-approvals/${encodeURIComponent(maPDS)}`, { signal }),
  );
  return parseContract(detailSchema, payload);
}

export async function confirmReconciliationApproval(
  maPDS: string,
  request: { khachHangDongY: true },
) {
  await readJson(
    await fetch(`/api/reconciliation-approvals/${encodeURIComponent(maPDS)}/xac-nhan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }),
  );
}
