using System;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.Data.SqlClient;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class LapPhieuHoanCocEntityTests
{
    [Fact]
    public void TaoPhieuHoanCoc_ValidParameters_CreatesSuccessfully()
    {
        var now = new DateTime(2026, 7, 13, 12, 0, 0);
        var phieuHoanCoc = PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", 1060000m, "ChuyenKhoan", "Tài khoản nhận", "GD001", "/proof.png", "NV02", now);

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
            PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", -100m, "TienMat", "Người nhận", null, "/proof.png", "NV02", now));
    }

    [Theory]
    [InlineData("Cash")]
    [InlineData("BankTransfer")]
    [InlineData("")]
    public void TaoPhieuHoanCoc_InvalidRefundMethod_ThrowsArgumentException(string method)
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", 100m, method, "Người nhận", null, "/proof.png", "NV02", DateTime.Now));
    }

    [Fact]
    public void TaoPhieuHoanCoc_BankTransferWithoutRecipient_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", 100m, "ChuyenKhoan", " ", "GD001", "/proof.png", "NV02", DateTime.Now));
    }

    [Fact]
    public void TaoPhieuHoanCoc_BankTransferWithoutTransactionCode_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", 100m, "ChuyenKhoan", "TK 0123", null, "/proof.png", "NV02", DateTime.Now));
    }

    [Fact]
    public void TaoPhieuHoanCoc_WithoutProof_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", 100m, "TienMat", "Người nhận", null, " ", "NV02", DateTime.Now));
    }

    [Fact]
    public void TaoPhieuHoanCoc_MissingEmployee_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuHoanCoc.TaoPhieuHoanCoc("PDS0001", 100m, "TienMat", "Người nhận", null, "/proof.png", " ", DateTime.Now));
    }

    [Fact]
    public void TaoPhieuHoanCoc_NormalizesTextInputs()
    {
        var phieu = PhieuHoanCoc.TaoPhieuHoanCoc(
            "  PDS0001  ", 100m, "  ChuyenKhoan  ", "  TK 0123456789  ", " GD001 ", "/proof.png", "  NV02  ", DateTime.Now);

        Assert.Equal("PDS0001", phieu.MaPDS);
        Assert.Equal("ChuyenKhoan", phieu.PhuongThucHoan);
        Assert.Equal("TK 0123456789", phieu.ThongTinNhanTien);
        Assert.Equal("NV02", phieu.MaNV);
    }

    [Fact]
    public void TaoPhieuHoanCoc_RecipientInfoTooLong_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() =>
            PhieuHoanCoc.TaoPhieuHoanCoc(
                "PDS0001", 100m, "ChuyenKhoan", new string('A', 301), "GD001", "/proof.png", "NV02", DateTime.Now));
    }

    [IntegrationFact]
    public async System.Threading.Tasks.Task LayDSPhieuDoiSoatCanHoan_WithConfiguredDatabase_ReturnsList()
    {
        var factory = new EnvironmentSqlConnectionFactory();
        var lap = new LapPhieuHoanCoc(
            () => new PhienDuLieu(new SqlSession(factory)),
            TimeProvider.System);

        var results = await lap.LayDSPhieuDoiSoatCanHoan();

        Assert.NotNull(results);
    }

    private sealed class EnvironmentSqlConnectionFactory : ISqlConnectionFactory
    {
        public System.Data.IDbConnection CreateConnection()
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
