import { z } from "zod";

const metaSchema = z.object({
  asOf: z.string().min(1),
  scopeLabel: z.string().min(1),
  maCN: z.string().nullish(),
  tenChiNhanh: z.string().nullish(),
});

const kpiSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.string().min(1),
  subtext: z.string(),
  tone: z.string().min(1),
});

const taskSchema = z.object({
  text: z.string().min(1),
  meta: z.string(),
  to: z.string().min(1),
  tone: z.string().min(1),
  count: z.number().int().nonnegative(),
});

const queueItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().nullish(),
  room: z.string().nullish(),
  status: z.string().nullish(),
  timeLabel: z.string().nullish(),
  amount: z.number().nullish(),
  extra: z.string().nullish(),
  tone: z.string().min(1),
});

const trendPointSchema = z.object({
  label: z.string().min(1),
  date: z.string().min(1),
  value: z.number(),
});

const statusBreakdownSchema = z.object({
  label: z.string().min(1),
  count: z.number().int().nonnegative(),
});

const saleSchema = z.object({
  meta: metaSchema,
  kpis: z.array(kpiSchema),
  tasks: z.array(taskSchema),
  recentAppointments: z.array(queueItemSchema),
});

const managerSchema = z.object({
  meta: metaSchema,
  kpis: z.array(kpiSchema),
  tasks: z.array(taskSchema),
  handoverQueue: z.array(queueItemSchema),
});

const accountantSchema = z.object({
  meta: metaSchema,
  kpis: z.array(kpiSchema),
  tasks: z.array(taskSchema),
  recentTransactions: z.array(queueItemSchema),
  receiptTrend: z.array(trendPointSchema),
});

const adminSchema = z.object({
  meta: metaSchema,
  kpis: z.array(kpiSchema),
  tasks: z.array(taskSchema),
  configRows: z.array(queueItemSchema),
  bedStatusBreakdown: z.array(statusBreakdownSchema),
  activePolicyCode: z.string().nullish(),
  activePolicyName: z.string().nullish(),
});

export type DashboardTone = "blue" | "green" | "orange" | "red";
export type DashboardMeta = z.infer<typeof metaSchema>;
export type DashboardKpi = z.infer<typeof kpiSchema>;
export type DashboardTask = z.infer<typeof taskSchema>;
export type DashboardQueueItem = z.infer<typeof queueItemSchema>;
export type DashboardTrendPoint = z.infer<typeof trendPointSchema>;
export type DashboardStatusBreakdown = z.infer<typeof statusBreakdownSchema>;
export type SaleDashboard = z.infer<typeof saleSchema>;
export type ManagerDashboard = z.infer<typeof managerSchema>;
export type AccountantDashboard = z.infer<typeof accountantSchema>;
export type AdminDashboard = z.infer<typeof adminSchema>;

const errorSchema = z.object({
  message: z.string().optional(),
  Message: z.string().optional(),
});

async function readError(response: Response, fallback: string): Promise<Error> {
  const payload = errorSchema.safeParse(await response.json().catch(() => null));
  return new Error(
    payload.success ? (payload.data.message ?? payload.data.Message ?? fallback) : fallback,
  );
}

async function readJson<T>(
  response: Response,
  schema: z.ZodType<T>,
  fallback: string,
): Promise<T> {
  if (!response.ok) throw await readError(response, fallback);
  const parsed = schema.safeParse(await response.json());
  if (!parsed.success) throw new Error("Dữ liệu dashboard từ máy chủ không đúng định dạng.");
  return parsed.data;
}

export const dashboardKeys = {
  all: ["dashboards"] as const,
  sale: () => [...dashboardKeys.all, "sale"] as const,
  manager: () => [...dashboardKeys.all, "manager"] as const,
  accountant: () => [...dashboardKeys.all, "accountant"] as const,
  admin: () => [...dashboardKeys.all, "admin"] as const,
};

export const dashboardService = {
  async getSale(signal?: AbortSignal): Promise<SaleDashboard> {
    return readJson(
      await fetch("/api/dashboards/sale", { signal, credentials: "include" }),
      saleSchema,
      "Không thể tải tổng quan Sale.",
    );
  },
  async getManager(signal?: AbortSignal): Promise<ManagerDashboard> {
    return readJson(
      await fetch("/api/dashboards/manager", { signal, credentials: "include" }),
      managerSchema,
      "Không thể tải tổng quan Quản lý.",
    );
  },
  async getAccountant(signal?: AbortSignal): Promise<AccountantDashboard> {
    return readJson(
      await fetch("/api/dashboards/accountant", { signal, credentials: "include" }),
      accountantSchema,
      "Không thể tải tổng quan Kế toán.",
    );
  },
  async getAdmin(signal?: AbortSignal): Promise<AdminDashboard> {
    return readJson(
      await fetch("/api/dashboards/admin", { signal, credentials: "include" }),
      adminSchema,
      "Không thể tải tổng quan Admin.",
    );
  },
};
