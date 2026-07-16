namespace HomeStay.Presentation.Contracts;

public sealed record DashboardMetaHttpResponse(
    DateTime AsOf,
    string ScopeLabel,
    string? MaCN,
    string? TenChiNhanh);

public sealed record DashboardKpiHttpResponse(
    string Key,
    string Label,
    string Value,
    string Subtext,
    string Tone);

public sealed record DashboardTaskHttpResponse(
    string Text,
    string Meta,
    string To,
    string Tone,
    int Count);

public sealed record DashboardQueueItemHttpResponse(
    string Id,
    string Title,
    string? Subtitle,
    string? Room,
    string? Status,
    string? TimeLabel,
    decimal? Amount,
    string? Extra,
    string Tone);

public sealed record DashboardTrendPointHttpResponse(
    string Label,
    string Date,
    decimal Value);

public sealed record DashboardStatusBreakdownHttpResponse(
    string Label,
    int Count);

public sealed record SaleDashboardHttpResponse(
    DashboardMetaHttpResponse Meta,
    IReadOnlyList<DashboardKpiHttpResponse> Kpis,
    IReadOnlyList<DashboardTaskHttpResponse> Tasks,
    IReadOnlyList<DashboardQueueItemHttpResponse> RecentAppointments);

public sealed record ManagerDashboardHttpResponse(
    DashboardMetaHttpResponse Meta,
    IReadOnlyList<DashboardKpiHttpResponse> Kpis,
    IReadOnlyList<DashboardTaskHttpResponse> Tasks,
    IReadOnlyList<DashboardQueueItemHttpResponse> HandoverQueue);

public sealed record AccountantDashboardHttpResponse(
    DashboardMetaHttpResponse Meta,
    IReadOnlyList<DashboardKpiHttpResponse> Kpis,
    IReadOnlyList<DashboardTaskHttpResponse> Tasks,
    IReadOnlyList<DashboardQueueItemHttpResponse> RecentTransactions,
    IReadOnlyList<DashboardTrendPointHttpResponse> ReceiptTrend);

public sealed record AdminDashboardHttpResponse(
    DashboardMetaHttpResponse Meta,
    IReadOnlyList<DashboardKpiHttpResponse> Kpis,
    IReadOnlyList<DashboardTaskHttpResponse> Tasks,
    IReadOnlyList<DashboardQueueItemHttpResponse> ConfigRows,
    IReadOnlyList<DashboardStatusBreakdownHttpResponse> BedStatusBreakdown,
    string? ActivePolicyCode,
    string? ActivePolicyName);
