namespace HomeStay.Presentation.Controllers;

using System.Security.Claims;
using HomeStay.Application.BusinessLogic;
using HomeStay.Presentation.Contracts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/dashboards")]
public sealed class DashboardController(TongQuanDashboard tongQuanDashboard) : ControllerBase
{
    [HttpGet("sale")]
    [Authorize(Roles = "Sale")]
    public async Task<IActionResult> LaySale()
    {
        Response.Headers.CacheControl = "no-store";
        var snapshot = await tongQuanDashboard.LaySale(User.FindFirstValue("MaNV"));
        return Ok(MapSale(snapshot));
    }

    [HttpGet("manager")]
    [Authorize(Roles = "QuanLy")]
    public async Task<IActionResult> LayManager()
    {
        Response.Headers.CacheControl = "no-store";
        var snapshot = await tongQuanDashboard.LayManager(User.FindFirstValue("MaNV"));
        return Ok(MapManager(snapshot));
    }

    [HttpGet("accountant")]
    [Authorize(Roles = "KeToan")]
    public async Task<IActionResult> LayAccountant()
    {
        Response.Headers.CacheControl = "no-store";
        var snapshot = await tongQuanDashboard.LayAccountant(User.FindFirstValue("MaNV"));
        return Ok(MapAccountant(snapshot));
    }

    [HttpGet("admin")]
    [Authorize(Roles = "QuanTri")]
    public async Task<IActionResult> LayAdmin()
    {
        Response.Headers.CacheControl = "no-store";
        var snapshot = await tongQuanDashboard.LayAdmin();
        return Ok(MapAdmin(snapshot));
    }

    private static SaleDashboardHttpResponse MapSale(SaleDashboardSnapshot snapshot) =>
        new(MapMeta(snapshot.Meta), MapKpis(snapshot.Kpis), MapTasks(snapshot.Tasks), MapQueue(snapshot.RecentAppointments));

    private static ManagerDashboardHttpResponse MapManager(ManagerDashboardSnapshot snapshot) =>
        new(MapMeta(snapshot.Meta), MapKpis(snapshot.Kpis), MapTasks(snapshot.Tasks), MapQueue(snapshot.HandoverQueue));

    private static AccountantDashboardHttpResponse MapAccountant(AccountantDashboardSnapshot snapshot) =>
        new(
            MapMeta(snapshot.Meta),
            MapKpis(snapshot.Kpis),
            MapTasks(snapshot.Tasks),
            MapQueue(snapshot.RecentTransactions),
            snapshot.ReceiptTrend.Select(x => new DashboardTrendPointHttpResponse(
                x.Label,
                x.Date.ToString("yyyy-MM-dd"),
                x.Value)).ToList());

    private static AdminDashboardHttpResponse MapAdmin(AdminDashboardSnapshot snapshot) =>
        new(
            MapMeta(snapshot.Meta),
            MapKpis(snapshot.Kpis),
            MapTasks(snapshot.Tasks),
            MapQueue(snapshot.ConfigRows),
            snapshot.BedStatusBreakdown.Select(x => new DashboardStatusBreakdownHttpResponse(x.Label, x.Count)).ToList(),
            snapshot.ActivePolicyCode,
            snapshot.ActivePolicyName);

    private static DashboardMetaHttpResponse MapMeta(DashboardMeta meta) =>
        new(meta.AsOf, meta.ScopeLabel, meta.MaCN, meta.TenChiNhanh);

    private static IReadOnlyList<DashboardKpiHttpResponse> MapKpis(IReadOnlyList<DashboardKpi> items) =>
        items.Select(x => new DashboardKpiHttpResponse(x.Key, x.Label, x.Value, x.Subtext, x.Tone)).ToList();

    private static IReadOnlyList<DashboardTaskHttpResponse> MapTasks(IReadOnlyList<DashboardTask> items) =>
        items.Select(x => new DashboardTaskHttpResponse(x.Text, x.Meta, x.To, x.Tone, x.Count)).ToList();

    private static IReadOnlyList<DashboardQueueItemHttpResponse> MapQueue(IReadOnlyList<DashboardQueueItem> items) =>
        items.Select(x => new DashboardQueueItemHttpResponse(
            x.Id, x.Title, x.Subtitle, x.Room, x.Status, x.TimeLabel, x.Amount, x.Extra, x.Tone)).ToList();
}
