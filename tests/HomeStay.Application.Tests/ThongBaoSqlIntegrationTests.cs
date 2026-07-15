namespace HomeStay.Application.Tests;

using System.Data;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.Data.SqlClient;
using Xunit;

public sealed class ThongBaoSqlIntegrationTests
{
    [IntegrationFact]
    public async Task QuanLyCN01_ChiThayThongBaoCN01()
    {
        var service = TaoDichVu();

        var page = await service.LayThongBaoCuaToi("NV01", "all", 50);

        Assert.Contains(page.Items, x => x.MaTB == "TBDEMO0002");
        Assert.DoesNotContain(page.Items, x => x.MaTB == "TBDEMO0003");
    }

    [IntegrationFact]
    public async Task QuanLyCN02_ChiThayThongBaoCN02()
    {
        var service = TaoDichVu();

        var page = await service.LayThongBaoCuaToi("NV05", "all", 50);

        Assert.Contains(page.Items, x => x.MaTB == "TBDEMO0003");
        Assert.DoesNotContain(page.Items, x => x.MaTB == "TBDEMO0002");
    }

    [IntegrationFact]
    public async Task DanhDauThongBaoKhacChiNhanh_TraNotFound()
    {
        var service = TaoDichVu();

        await Assert.ThrowsAsync<KeyNotFoundException>(
            () => service.DanhDauDaDoc("TBDEMO0003", "NV01"));
    }

    private static DichVuThongBao TaoDichVu()
    {
        var factory = new EnvironmentSqlConnectionFactory();
        return new DichVuThongBao(
            () => new PhienDuLieu(new SqlSession(factory)),
            TimeProvider.System);
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
