using System.Data;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Application.DataAccess.FileStorage;
using Microsoft.Data.SqlClient;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class QuanLyQuyDinhIntegrationTests
{
    [IntegrationFact]
    public async Task QuyDinh_CrudHopLe_TaoCapNhatVaXoaThanhCong()
    {
        var thuMuc = Path.Combine(Path.GetTempPath(), $"quy-dinh-it-{Guid.NewGuid():N}");
        var control = new QuanLyQuyDinh(
            () => new PhienDuLieu(new SqlSession(new EnvironmentSqlConnectionFactory())),
            new QuyDinhFileStorage(thuMuc),
            TimeProvider.System);
        var bytes = "%PDF-1.4\nIntegration test"u8.ToArray();
        try
        {
            await using var stream = new MemoryStream(bytes);
            var quyDinh = await control.Them(new QuyDinh
            {
                TenQD = $"Quy định IT {DateTime.UtcNow.Ticks}",
                LoaiQD = "NoiQuySinhHoat",
                NgayApDung = new DateOnly(2026, 8, 1),
            }, new TepQuyDinh("test.pdf", bytes.Length, stream));
            Assert.Matches("^QD[0-9]{2,}$", quyDinh.MaQD);

            var capNhat = await control.CapNhat(quyDinh.MaQD, new QuyDinh
            {
                TenQD = quyDinh.TenQD + " cập nhật",
                LoaiQD = "DieuKienLuuTru",
                NgayApDung = new DateOnly(2026, 8, 2),
            }, null);
            Assert.Equal("DieuKienLuuTru", capNhat.LoaiQD);

            await control.Xoa(quyDinh.MaQD);
            Assert.DoesNotContain(await control.LayDanhSach(), item => item.MaQD == quyDinh.MaQD);
        }
        finally
        {
            if (Directory.Exists(thuMuc)) Directory.Delete(thuMuc, recursive: true);
        }
    }

    [IntegrationFact]
    public async Task HopDongQuyDinh_KhoaKepVaChanXoaQuyDinhDangDuocGan()
    {
        var thuMuc = Path.Combine(Path.GetTempPath(), $"quy-dinh-link-it-{Guid.NewGuid():N}");
        var control = new QuanLyQuyDinh(
            () => new PhienDuLieu(new SqlSession(new EnvironmentSqlConnectionFactory())),
            new QuyDinhFileStorage(thuMuc),
            TimeProvider.System);
        QuyDinh? quyDinh = null;
        string? maHD = null;

        try
        {
            var bytes = "%PDF-1.4\nContract regulation integration test"u8.ToArray();
            await using var stream = new MemoryStream(bytes);
            quyDinh = await control.Them(new QuyDinh
            {
                TenQD = $"Quy định liên kết IT {DateTime.UtcNow.Ticks}",
                LoaiQD = "DieuKienLuuTru",
                NgayApDung = new DateOnly(2026, 8, 1),
            }, new TepQuyDinh("contract-rule.pdf", bytes.Length, stream));

            using var connection = new EnvironmentSqlConnectionFactory().CreateConnection();
            maHD = await connection.QueryFirstOrDefaultAsync<string>(
                "SELECT TOP 1 MaHD FROM HopDong ORDER BY MaHD");
            Assert.False(string.IsNullOrWhiteSpace(maHD));

            const string themLienKet =
                "INSERT INTO HopDong_QuyDinh (MaHD, MaQD) VALUES (@MaHD, @MaQD)";
            await connection.ExecuteAsync(themLienKet, new { MaHD = maHD, quyDinh.MaQD });

            var trungKhoa = await Assert.ThrowsAsync<SqlException>(() =>
                connection.ExecuteAsync(themLienKet, new { MaHD = maHD, quyDinh.MaQD }));
            Assert.Contains(trungKhoa.Number, new[] { 2601, 2627 });

            await Assert.ThrowsAsync<InvalidOperationException>(() => control.Xoa(quyDinh.MaQD));

            await connection.ExecuteAsync(
                "DELETE FROM HopDong_QuyDinh WHERE MaHD=@MaHD AND MaQD=@MaQD",
                new { MaHD = maHD, quyDinh.MaQD });
            await control.Xoa(quyDinh.MaQD);
            quyDinh = null;
        }
        finally
        {
            if (quyDinh is not null)
            {
                using var connection = new EnvironmentSqlConnectionFactory().CreateConnection();
                await connection.ExecuteAsync(
                    "DELETE FROM HopDong_QuyDinh WHERE MaQD=@MaQD; DELETE FROM QuyDinh WHERE MaQD=@MaQD;",
                    new { quyDinh.MaQD });
            }
            if (Directory.Exists(thuMuc)) Directory.Delete(thuMuc, recursive: true);
        }
    }

    private sealed class EnvironmentSqlConnectionFactory : ISqlConnectionFactory
    {
        public IDbConnection CreateConnection()
        {
            var connectionString = Environment.GetEnvironmentVariable(
                IntegrationFactAttribute.ConnectionStringEnvironmentVariable)
                ?? throw new InvalidOperationException("Missing integration test connection string.");
            var connection = new SqlConnection(connectionString);
            connection.Open();
            return connection;
        }
    }
}
