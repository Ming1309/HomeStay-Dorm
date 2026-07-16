namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class DashboardMeta
{
    public DateTime AsOf { get; init; }
    public string ScopeLabel { get; init; } = string.Empty;
    public string? MaCN { get; init; }
    public string? TenChiNhanh { get; init; }
}

public sealed class DashboardKpi
{
    public string Key { get; init; } = string.Empty;
    public string Label { get; init; } = string.Empty;
    public string Value { get; init; } = string.Empty;
    public string Subtext { get; init; } = string.Empty;
    public string Tone { get; init; } = "blue";
}

public sealed class DashboardTask
{
    public string Text { get; init; } = string.Empty;
    public string Meta { get; init; } = string.Empty;
    public string To { get; init; } = string.Empty;
    public string Tone { get; init; } = "blue";
    public int Count { get; init; }
}

public sealed class DashboardQueueItem
{
    public string Id { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Subtitle { get; init; }
    public string? Room { get; init; }
    public string? Status { get; init; }
    public string? TimeLabel { get; init; }
    public decimal? Amount { get; init; }
    public string? Extra { get; init; }
    public string Tone { get; init; } = "blue";
}

public sealed class DashboardTrendPoint
{
    public string Label { get; init; } = string.Empty;
    public DateOnly Date { get; init; }
    public decimal Value { get; init; }
}

public sealed class DashboardStatusBreakdown
{
    public string Label { get; init; } = string.Empty;
    public int Count { get; init; }
}

public sealed class SaleDashboardSnapshot
{
    public DashboardMeta Meta { get; init; } = new();
    public IReadOnlyList<DashboardKpi> Kpis { get; init; } = [];
    public IReadOnlyList<DashboardTask> Tasks { get; init; } = [];
    public IReadOnlyList<DashboardQueueItem> RecentAppointments { get; init; } = [];
}

public sealed class ManagerDashboardSnapshot
{
    public DashboardMeta Meta { get; init; } = new();
    public IReadOnlyList<DashboardKpi> Kpis { get; init; } = [];
    public IReadOnlyList<DashboardTask> Tasks { get; init; } = [];
    public IReadOnlyList<DashboardQueueItem> HandoverQueue { get; init; } = [];
}

public sealed class AccountantDashboardSnapshot
{
    public DashboardMeta Meta { get; init; } = new();
    public IReadOnlyList<DashboardKpi> Kpis { get; init; } = [];
    public IReadOnlyList<DashboardTask> Tasks { get; init; } = [];
    public IReadOnlyList<DashboardQueueItem> RecentTransactions { get; init; } = [];
    public IReadOnlyList<DashboardTrendPoint> ReceiptTrend { get; init; } = [];
}

public sealed class AdminDashboardSnapshot
{
    public DashboardMeta Meta { get; init; } = new();
    public IReadOnlyList<DashboardKpi> Kpis { get; init; } = [];
    public IReadOnlyList<DashboardTask> Tasks { get; init; } = [];
    public IReadOnlyList<DashboardQueueItem> ConfigRows { get; init; } = [];
    public IReadOnlyList<DashboardStatusBreakdown> BedStatusBreakdown { get; init; } = [];
    public string? ActivePolicyCode { get; init; }
    public string? ActivePolicyName { get; init; }
}

public sealed class DashboardTongHop
{
    public static Task<SaleDashboardSnapshot> LaySale(string maCN, string? tenChiNhanh, DateTime asOf) =>
        DashboardDB.LaySale(maCN, tenChiNhanh, asOf);

    public static Task<ManagerDashboardSnapshot> LayManager(string maCN, string? tenChiNhanh, DateTime asOf) =>
        DashboardDB.LayManager(maCN, tenChiNhanh, asOf);

    public static Task<AccountantDashboardSnapshot> LayAccountant(string maCN, string? tenChiNhanh, DateTime asOf) =>
        DashboardDB.LayAccountant(maCN, tenChiNhanh, asOf);

    public static Task<AdminDashboardSnapshot> LayAdmin(DateTime asOf) =>
        DashboardDB.LayAdmin(asOf);
}
