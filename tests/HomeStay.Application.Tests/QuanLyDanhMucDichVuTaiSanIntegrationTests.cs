using System.Data;
using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using Microsoft.Data.SqlClient;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class QuanLyDanhMucDichVuTaiSanIntegrationTests
{
    [IntegrationFact]
    public async Task DichVu_CrudVaChanXoaKhiDuocThamChieu()
    {
        var control = new QuanLyDichVu(TaoPhien);
        var ten = $"Dịch vụ test {Guid.NewGuid():N}";
        DichVu? dichVu = null;
        string? maHD = null;
        try
        {
            dichVu = await control.Them(new DichVu
            {
                TenDV = ten,
                DonViTinh = "lần",
                DonGia = 10_000,
                TrangThai = "DangApDung",
            });
            dichVu = await control.CapNhat(dichVu.MaDV, new DichVu
            {
                TenDV = ten,
                DonViTinh = "tháng",
                DonGia = 20_000,
                TrangThai = "NgungApDung",
            });
            Assert.Equal("tháng", dichVu.DonViTinh);
            Assert.Equal("NgungApDung", dichVu.TrangThai);

            maHD = await LayGiaTri<string>("SELECT TOP 1 MaHD FROM HopDong ORDER BY MaHD")
                ?? throw new InvalidOperationException("Database test cần có ít nhất một hợp đồng.");
            await ThucThi(
                "INSERT INTO HopDong_DichVu (MaHD, MaDV, DonGiaKyKet) VALUES (@MaHD, @MaDV, @DonGia)",
                new { MaHD = maHD, dichVu.MaDV, DonGia = dichVu.DonGia });

            await Assert.ThrowsAsync<InvalidOperationException>(() => control.Xoa(dichVu.MaDV));
            Assert.Contains(await control.LayDanhSach(), item => item.MaDV == dichVu.MaDV);

            await ThucThi("DELETE FROM HopDong_DichVu WHERE MaHD = @MaHD AND MaDV = @MaDV",
                new { MaHD = maHD, dichVu.MaDV });
            maHD = null;
            await control.Xoa(dichVu.MaDV);
            Assert.DoesNotContain(await control.LayDanhSach(), item => item.MaDV == dichVu.MaDV);
            dichVu = null;
        }
        finally
        {
            if (dichVu is not null)
            {
                if (maHD is not null)
                    await ThucThi("DELETE FROM HopDong_DichVu WHERE MaHD = @MaHD AND MaDV = @MaDV",
                        new { MaHD = maHD, dichVu.MaDV });
                await ThucThi("DELETE FROM DichVu WHERE MaDV = @MaDV", new { dichVu.MaDV });
            }
        }
    }

    [IntegrationFact]
    public async Task TaiSan_CrudTrungTenVaChanXoaKhiDuocThamChieu()
    {
        var control = new QuanLyTaiSan(TaoPhien);
        var ten = $"Tài sản test {Guid.NewGuid():N}";
        TaiSan? taiSan = null;
        string? maPhong = null;
        try
        {
            taiSan = await control.Them(new TaiSan
            {
                TenTaiSan = ten,
                LoaiTaiSan = "NoiThat",
                GiaTri = 100_000,
                MoTa = "Dữ liệu kiểm thử",
                TrangThai = "DangApDung",
            });

            await Assert.ThrowsAsync<InvalidOperationException>(() => control.Them(new TaiSan
            {
                TenTaiSan = ten.ToUpperInvariant(),
                LoaiTaiSan = "NoiThat",
                GiaTri = 100_000,
                TrangThai = "DangApDung",
            }));

            taiSan = await control.CapNhat(taiSan.MaTS, new TaiSan
            {
                TenTaiSan = ten,
                LoaiTaiSan = "TienIchBanGiao",
                GiaTri = 150_000,
                MoTa = "Đã cập nhật",
                TrangThai = "NgungApDung",
            });
            Assert.Equal("TienIchBanGiao", taiSan.LoaiTaiSan);
            Assert.Equal("NgungApDung", taiSan.TrangThai);

            maPhong = await LayGiaTri<string>("SELECT TOP 1 MaPhong FROM Phong ORDER BY MaPhong")
                ?? throw new InvalidOperationException("Database test cần có ít nhất một phòng.");
            await ThucThi(
                "INSERT INTO Phong_TaiSan (MaPhong, MaTS, SoLuongTieuChuan) VALUES (@MaPhong, @MaTS, 1)",
                new { MaPhong = maPhong, taiSan.MaTS });

            await Assert.ThrowsAsync<InvalidOperationException>(() => control.Xoa(taiSan.MaTS));
            await ThucThi("DELETE FROM Phong_TaiSan WHERE MaPhong = @MaPhong AND MaTS = @MaTS",
                new { MaPhong = maPhong, taiSan.MaTS });
            maPhong = null;
            await control.Xoa(taiSan.MaTS);
            taiSan = null;
        }
        finally
        {
            if (taiSan is not null)
            {
                if (maPhong is not null)
                    await ThucThi("DELETE FROM Phong_TaiSan WHERE MaPhong = @MaPhong AND MaTS = @MaTS",
                        new { MaPhong = maPhong, taiSan.MaTS });
                await ThucThi("DELETE FROM TaiSan WHERE MaTS = @MaTS", new { taiSan.MaTS });
            }
        }
    }

    private static PhienDuLieu TaoPhien() =>
        new(new SqlSession(new EnvironmentSqlConnectionFactory()));

    private static async Task<T?> LayGiaTri<T>(string sql)
    {
        await using var connection = new SqlConnection(LayConnectionString());
        await connection.OpenAsync();
        return await connection.QuerySingleOrDefaultAsync<T>(sql);
    }

    private static async Task ThucThi(string sql, object parameters)
    {
        await using var connection = new SqlConnection(LayConnectionString());
        await connection.OpenAsync();
        await connection.ExecuteAsync(sql, parameters);
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
