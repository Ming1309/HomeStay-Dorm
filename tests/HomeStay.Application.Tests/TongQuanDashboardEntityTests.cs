namespace HomeStay.Application.Tests;

using HomeStay.Application.BusinessLogic;
using Xunit;

public sealed class TongQuanDashboardEntityTests
{
    [Fact]
    public void Snapshot_Sale_GiuNguyenCauTrucVaMetaChiNhanh()
    {
        var asOf = new DateTime(2026, 7, 16, 8, 30, 0);
        var snapshot = new SaleDashboardSnapshot
        {
            Meta = new DashboardMeta
            {
                AsOf = asOf,
                ScopeLabel = "Chi nhánh CN01",
                MaCN = "CN01",
                TenChiNhanh = "Chi nhánh 1",
            },
            Kpis =
            [
                new DashboardKpi
                {
                    Key = "lich-hen-hom-nay",
                    Label = "Lịch hẹn hôm nay",
                    Value = "2",
                    Subtext = "1 lịch đã xác nhận",
                    Tone = "blue",
                },
            ],
            Tasks =
            [
                new DashboardTask
                {
                    Text = "2 lịch hẹn hôm nay",
                    Meta = "Ưu tiên gọi xác nhận",
                    To = "/sale/tra-cuu-lich-hen",
                    Tone = "orange",
                    Count = 2,
                },
            ],
            RecentAppointments =
            [
                new DashboardQueueItem
                {
                    Id = "LH0001",
                    Title = "Nguyễn Văn A",
                    Room = "P101",
                    Status = "Đã xác nhận",
                    TimeLabel = "09:30 hôm nay",
                    Tone = "green",
                },
            ],
        };

        Assert.Equal("CN01", snapshot.Meta.MaCN);
        Assert.Equal("Chi nhánh CN01", snapshot.Meta.ScopeLabel);
        Assert.Single(snapshot.Kpis);
        Assert.Equal("/sale/tra-cuu-lich-hen", snapshot.Tasks[0].To);
        Assert.DoesNotContain(snapshot.RecentAppointments, x => x.Title.Contains("SDT", StringComparison.OrdinalIgnoreCase));
    }

    [Fact]
    public void Snapshot_Accountant_TachKhoanChoThuVaGiaoDich()
    {
        var snapshot = new AccountantDashboardSnapshot
        {
            Meta = new DashboardMeta
            {
                AsOf = DateTime.Now,
                ScopeLabel = "Chi nhánh CN01",
                MaCN = "CN01",
            },
            Kpis =
            [
                new DashboardKpi
                {
                    Key = "gia-tri-cho-thu",
                    Label = "Giá trị chờ thu",
                    Value = "1,500,000 VNĐ",
                    Subtext = "1 HĐ · 0 thu thêm · 0 bồi thường",
                    Tone = "orange",
                },
            ],
            Tasks = [],
            RecentTransactions =
            [
                new DashboardQueueItem
                {
                    Id = "PT0001",
                    Title = "Khách A",
                    Room = "P101",
                    Amount = 1_500_000m,
                    Extra = "Thu",
                    Tone = "green",
                },
                new DashboardQueueItem
                {
                    Id = "PHC0001",
                    Title = "Khách B",
                    Room = "P202",
                    Amount = 500_000m,
                    Extra = "Hoàn",
                    Tone = "orange",
                },
            ],
            ReceiptTrend =
            [
                new DashboardTrendPoint
                {
                    Date = new DateOnly(2026, 7, 16),
                    Label = "16/07",
                    Value = 1_500_000m,
                },
            ],
        };

        Assert.Equal("Giá trị chờ thu", snapshot.Kpis[0].Label);
        Assert.DoesNotContain(snapshot.Kpis, x => x.Label.Contains("Công nợ", StringComparison.OrdinalIgnoreCase));
        Assert.Contains(snapshot.RecentTransactions, x => x.Extra == "Hoàn");
        Assert.Single(snapshot.ReceiptTrend);
    }

    [Fact]
    public void Snapshot_Admin_PhamViToanHeThong()
    {
        var snapshot = new AdminDashboardSnapshot
        {
            Meta = new DashboardMeta
            {
                AsOf = DateTime.Now,
                ScopeLabel = "Toàn hệ thống",
            },
            Kpis =
            [
                new DashboardKpi
                {
                    Key = "phong-giuong",
                    Label = "Tổng phòng / giường",
                    Value = "10 / 40",
                    Subtext = "Danh mục đang quản trị",
                    Tone = "blue",
                },
            ],
            Tasks = [],
            ConfigRows = [],
            BedStatusBreakdown =
            [
                new DashboardStatusBreakdown { Label = "Trống", Count = 12 },
                new DashboardStatusBreakdown { Label = "Đang sử dụng", Count = 20 },
            ],
            ActivePolicyCode = "CS0001",
            ActivePolicyName = "Chính sách chuẩn",
        };

        Assert.Equal("Toàn hệ thống", snapshot.Meta.ScopeLabel);
        Assert.Null(snapshot.Meta.MaCN);
        Assert.Equal("CS0001", snapshot.ActivePolicyCode);
        Assert.Equal(2, snapshot.BedStatusBreakdown.Count);
    }

    [Fact]
    public void TongQuanDashboard_KhoiTao_KhongNull()
    {
        var service = new TongQuanDashboard(() => throw new InvalidOperationException("Không tạo phiên trong unit test."), TimeProvider.System);
        Assert.NotNull(service);
    }
}
