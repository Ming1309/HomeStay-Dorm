using System.Data;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.Data.SqlClient;
using Xunit;

namespace HomeStay.Application.Tests;

/// <summary>
/// Integration tests cho UC 1.4.28.
/// Yêu cầu biến môi trường HOMESTAY_TEST_CONNECTION_STRING và database được init mới.
/// </summary>
public sealed class QuanLyChinhSachHoanCocIntegrationTests
{
    [IntegrationFact]
    public async Task LayDanhSach_DocDuocLichSuChinhSachSeed()
    {
        var danhSach = await TaoControl().LayDanhSach();

        Assert.NotEmpty(danhSach);
        Assert.All(danhSach, chinhSach =>
        {
            Assert.False(string.IsNullOrWhiteSpace(chinhSach.MaChinhSach));
            Assert.InRange(chinhSach.TiLe_ChuaKy, 0m, 1m);
            Assert.True(chinhSach.MocLuuTru > 0);
            Assert.NotEqual(default, chinhSach.NgayApDung);
        });
    }

    [IntegrationFact]
    public async Task TaoPhienBan_GiuBanCuVaThemBanMoi()
    {
        var control = TaoControl();
        var banCu = (await control.LayDanhSach()).First();
        var ngayKetThucCu = banCu.NgayKetThuc;
        ChinhSachHoanCoc? banMoi = null;

        try
        {
            banMoi = await control.TaoPhienBan(new ChinhSachHoanCoc
            {
                TenChinhSach = "Chính sách kiểm thử phiên bản",
                TiLe_ChuaKy = 0.75m,
                TiLe_TruocHan_NganHan = 0.48m,
                TiLe_TruocHan_DaiHan = 0.68m,
                TiLe_DungHan = 0.99m,
                MocLuuTru = 6,
                NgayApDung = banCu.NgayApDung.AddDays(1),
                NgayKetThuc = banCu.NgayApDung.AddDays(2)
            });

            var danhSach = await control.LayDanhSach();
            Assert.Contains(danhSach, item => item.MaChinhSach == banCu.MaChinhSach);
            Assert.Contains(danhSach, item => item.MaChinhSach == banMoi.MaChinhSach);
            Assert.Equal(banCu.NgayApDung, banMoi.NgayApDung.AddDays(-1));
        }
        finally
        {
            if (banMoi is not null)
                await XoaBanMoiVaKhoiPhucBanCu(banMoi.MaChinhSach, banCu.MaChinhSach, ngayKetThucCu);
        }
    }

    [IntegrationFact]
    public async Task TaoPhienBan_TuChoiNgayKhongSauPhienBanMoiNhat()
    {
        var control = TaoControl();
        var banMoiNhat = (await control.LayDanhSach()).First();

        var exception = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            control.TaoPhienBan(new ChinhSachHoanCoc
            {
                TenChinhSach = "Chính sách trùng ngày",
                TiLe_ChuaKy = 0.8m,
                TiLe_TruocHan_NganHan = 0.5m,
                TiLe_TruocHan_DaiHan = 0.7m,
                TiLe_DungHan = 1m,
                MocLuuTru = 6,
                NgayApDung = banMoiNhat.NgayApDung
            }));

        Assert.Contains("Ngày áp dụng phải sau", exception.Message);
    }

    private static QuanLyChinhSachHoanCoc TaoControl() => new(
        () => new PhienDuLieu(new SqlSession(new EnvironmentSqlConnectionFactory())),
        TimeProvider.System);

    private static async Task XoaBanMoiVaKhoiPhucBanCu(
        string maBanMoi,
        string maBanCu,
        DateOnly? ngayKetThucCu)
    {
        await using var connection = new SqlConnection(LayConnectionString());
        await connection.OpenAsync();
        await using var transaction = await connection.BeginTransactionAsync();
        await connection.ExecuteAsync(
            "DELETE FROM ChinhSachHoanCoc WHERE MaChinhSach = @MaBanMoi",
            new { MaBanMoi = maBanMoi }, transaction);
        await connection.ExecuteAsync(
            "UPDATE ChinhSachHoanCoc SET NgayKetThuc = @NgayKetThuc WHERE MaChinhSach = @MaBanCu",
            new
            {
                MaBanCu = maBanCu,
                NgayKetThuc = ngayKetThucCu?.ToDateTime(TimeOnly.MinValue)
            }, transaction);
        await transaction.CommitAsync();
    }

    private static string LayConnectionString() =>
        Environment.GetEnvironmentVariable(IntegrationFactAttribute.ConnectionStringEnvironmentVariable)
        ?? throw new InvalidOperationException("Missing integration test connection string.");

    private sealed class EnvironmentSqlConnectionFactory : ISqlConnectionFactory
    {
        public IDbConnection CreateConnection()
        {
            var connection = new SqlConnection(LayConnectionString());
            connection.Open();
            return connection;
        }
    }
}
