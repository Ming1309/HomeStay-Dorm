using System;
using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class LapPhieuHoanCocEntityTests
{
    [Fact]
    public void TaoPhieuHoanCoc_ValidParameters_CreatesSuccessfully()
    {
        var now = new DateTime(2026, 7, 13, 12, 0, 0);
        var phieuHoanCoc = PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", 1060000m, "ChuyenKhoan", "Tài khoản nhận", "NV02", now);

        Assert.NotNull(phieuHoanCoc);
        Assert.StartsWith("PHC20260713120000", phieuHoanCoc.MaPHC);
        Assert.Equal(1060000m, phieuHoanCoc.SoTienHoan);
        Assert.Equal("PDS0001", phieuHoanCoc.MaPDS);
        Assert.Equal("ChuyenKhoan", phieuHoanCoc.PhuongThucHoan);
        Assert.Equal("Tài khoản nhận", phieuHoanCoc.ThongTinNhanTien);
        Assert.Equal("NV02", phieuHoanCoc.MaNV);
    }

    [Fact]
    public void TaoPhieuHoanCoc_NegativeAmount_ThrowsArgumentException()
    {
        var now = DateTime.Now;
        Assert.Throws<ArgumentException>(() =>
            PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", -100m, "Cash", "", "NV02", now));
    }

    private class FakeSqlConnectionFactory : HomeStay.Application.DataAccess.DbConnections.ISqlConnectionFactory
    {
        public System.Data.IDbConnection CreateConnection()
        {
            var connection = new Microsoft.Data.SqlClient.SqlConnection("Server=HONGPHUC;Database=HomeStay;User Id=sa;Password=123456;TrustServerCertificate=True;");
            connection.Open();
            return connection;
        }
    }

    [Fact]
    public async System.Threading.Tasks.Task DebugGetDSPhieuDoiSoatCanHoan()
    {
        var factory = new FakeSqlConnectionFactory();
        using var phien = new HomeStay.Application.DataAccess.DbConnections.PhienDuLieu(
            new HomeStay.Application.DataAccess.DbConnections.SqlSession(factory));
        
        try
        {
            var lap = new LapPhieuHoanCoc(() => phien);
            var results = await lap.LayDSPhieuDoiSoatCanHoan();
            Assert.NotNull(results);
        }
        catch (Exception ex)
        {
            Assert.Fail($"Database query threw exception: {ex.Message}\n{ex.StackTrace}");
        }
    }
}
