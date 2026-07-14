using System.Data;
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
