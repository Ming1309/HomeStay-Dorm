using System;
using System.Data;
using System.Threading.Tasks;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.Data.SqlClient;
using Xunit;

namespace HomeStay.Application.Tests;

// Cac test can co so du lieu that; chi chay khi dat HOMESTAY_TEST_CONNECTION_STRING.
// Dua tren du lieu seed (02_Seeds.sql): CN01, LP01/LP07/LP08, P001 (LP07, 4 giuong).
public sealed class QuanLyPhongGiuongIntegrationTests
{
    private static QuanLyPhongGiuong TaoControl() =>
        new(() => new PhienDuLieu(new SqlSession(new EnvironmentSqlConnectionFactory())));

    [IntegrationFact]
    public async Task ThemPhong_LoaiPhongKhongTonTai_ThrowsArgumentException()
    {
        var control = TaoControl();
        var ex = await Assert.ThrowsAsync<ArgumentException>(() => control.ThemPhong(new Phong
        {
            SoPhong = "IT-LP-MISSING", TrangThai = "Trong", MaLP = "LP_KHONG_CO", MaCN = "CN01",
        }));
        Assert.Equal("Loại phòng không tồn tại.", ex.Message);
    }

    [IntegrationFact]
    public async Task ThemPhong_ChiNhanhKhongTonTai_ThrowsArgumentException()
    {
        var control = TaoControl();
        var ex = await Assert.ThrowsAsync<ArgumentException>(() => control.ThemPhong(new Phong
        {
            SoPhong = "IT-CN-MISSING", TrangThai = "Trong", MaLP = "LP01", MaCN = "CN_KHONG_CO",
        }));
        Assert.Equal("Chi nhánh không tồn tại.", ex.Message);
    }

    [IntegrationFact]
    public async Task ThemPhong_TrungSoPhongTrongChiNhanh_ThrowsInvalidOperation()
    {
        var control = TaoControl();
        // P001 co SoPhong='101' o CN01 trong seed.
        await Assert.ThrowsAsync<InvalidOperationException>(() => control.ThemPhong(new Phong
        {
            SoPhong = "101", TrangThai = "Trong", MaLP = "LP01", MaCN = "CN01",
        }));
    }

    [IntegrationFact]
    public async Task CapNhatPhong_DoiLoaiPhongGiamSucChuaDuoiSoGiuong_ThrowsInvalidOperation()
    {
        var control = TaoControl();
        // P001 dung LP07 (suc chua 4) va co 4 giuong; doi sang LP08 (suc chua 2) -> chan.
        await Assert.ThrowsAsync<InvalidOperationException>(() => control.CapNhatPhong("P001", new Phong
        {
            SoPhong = "101", ToaNha = "Tòa A", Tang = "Tầng 1", GioiTinhChoPhep = "Nam",
            TrangThai = "Trong", MaLP = "LP08", MaCN = "CN01",
        }));
    }

    [IntegrationFact]
    public async Task Phong_CrudHopLe_TaoRoiXoaThanhCong()
    {
        var control = TaoControl();
        var soPhong = "IT-" + DateTime.Now.Ticks % 100000000;

        var phong = await control.ThemPhong(new Phong
        {
            SoPhong = soPhong, ToaNha = "Tòa Test", Tang = "T1",
            TrangThai = "DangBaoTri", MaLP = "LP01", MaCN = "CN01",
        });
        Assert.False(string.IsNullOrWhiteSpace(phong.MaPhong));
        Assert.Matches("^P[0-9]{3,6}$", phong.MaPhong);
        Assert.Equal("Trong", phong.TrangThai);

        var capNhat = await control.CapNhatPhong(phong.MaPhong, new Phong
        {
            SoPhong = soPhong, ToaNha = "Tòa Test 2", Tang = "T2",
            TrangThai = "DangBaoTri", MaLP = "LP01", MaCN = "CN01",
        });
        Assert.Equal("DangBaoTri", capNhat.TrangThai);

        await control.XoaPhong(phong.MaPhong);
        Assert.Null(await control.LayChiTietPhong(phong.MaPhong));
    }

    [IntegrationFact]
    public async Task Giuong_CrudHopLe_TaoRoiXoaThanhCong()
    {
        var control = TaoControl();
        var soPhong = "IT-" + DateTime.Now.Ticks % 100000000;

        // LP08 (suc chua 2) de con cho them giuong.
        var phong = await control.ThemPhong(new Phong
        {
            SoPhong = soPhong, ToaNha = "Tòa Test", TrangThai = "Trong", MaLP = "LP08", MaCN = "CN01",
        });
        try
        {
            var giuong = await control.ThemGiuong(new Giuong
            {
                SoGiuong = "Giường Test", TrangThai = "DangBaoTri", MaPhong = phong.MaPhong,
            });
            Assert.False(string.IsNullOrWhiteSpace(giuong.MaGiuong));
            Assert.Matches("^G[0-9]{3,6}$", giuong.MaGiuong);
            Assert.Equal("Trong", giuong.TrangThai);

            await control.XoaGiuong(giuong.MaGiuong);
            Assert.Null(await control.LayChiTietGiuong(giuong.MaGiuong));
        }
        finally
        {
            await control.XoaPhong(phong.MaPhong);
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
