namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class TongQuanDashboard
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public TongQuanDashboard(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<SaleDashboardSnapshot> LaySale(string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await DashboardTongHop.LaySale(nhanVien.MaCN, nhanVien.TenChiNhanh, AsOf());
    }

    public async Task<ManagerDashboardSnapshot> LayManager(string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await DashboardTongHop.LayManager(nhanVien.MaCN, nhanVien.TenChiNhanh, AsOf());
    }

    public async Task<AccountantDashboardSnapshot> LayAccountant(string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await DashboardTongHop.LayAccountant(nhanVien.MaCN, nhanVien.TenChiNhanh, AsOf());
    }

    public async Task<AdminDashboardSnapshot> LayAdmin()
    {
        using var phien = _taoPhienDuLieu();
        return await DashboardTongHop.LayAdmin(AsOf());
    }

    private DateTime AsOf() => _timeProvider.GetLocalNow().DateTime;
}
