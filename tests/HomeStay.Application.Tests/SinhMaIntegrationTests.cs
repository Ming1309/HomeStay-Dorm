using System;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.Data.SqlClient;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class SinhMaIntegrationTests
{
    [IntegrationFact]
    public async Task HaiRequestDongThoi_TaoPhongNhanMaKhacNhau()
    {
        var suffix = DateTime.UtcNow.Ticks.ToString()[^10..];
        var tasks = new[]
        {
            TaoControl().ThemPhong(TaoPhong($"IT-MA-A-{suffix}")),
            TaoControl().ThemPhong(TaoPhong($"IT-MA-B-{suffix}")),
        };

        var phongs = await Task.WhenAll(tasks);
        try
        {
            Assert.Equal(2, phongs.Select(x => x.MaPhong).Distinct().Count());
            Assert.All(phongs, x => Assert.Matches("^P[0-9]{3,}$", x.MaPhong));
        }
        finally
        {
            foreach (var phong in phongs)
                await TaoControl().XoaPhong(phong.MaPhong);
        }
    }

    private static Phong TaoPhong(string soPhong) => new()
    {
        SoPhong = soPhong,
        ToaNha = "Tòa Integration Test",
        Tang = "T1",
        TrangThai = "Trong",
        MaLP = "LP01",
        MaCN = "CN01",
    };

    private static QuanLyPhongGiuong TaoControl() =>
        new(() => new PhienDuLieu(new SqlSession(new EnvironmentSqlConnectionFactory())));

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
