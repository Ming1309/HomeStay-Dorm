using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class LapPhieuCocEntityTests
{
    [Fact]
    public void LichHen_TuChoiKhiChuaHoanThanh()
    {
        var lich = new LichHen { LoaiLichHen = "XemPhong", TrangThai = "DaCheckin", KhachHang = new() };
        Assert.Throws<InvalidOperationException>(lich.KiemTraCoTheLapPhieuCoc);
    }

    [Fact]
    public void OGhep_ChiGiuGiuongThuocPhongVaDangTrong()
    {
        var phong = TaoPhong();
        var selected = phong.GiuGiuong(["G1"]);
        Assert.Single(selected);
        Assert.Equal("GiuCho", selected[0].TrangThai);
        Assert.Equal("ConGiuongTrong", phong.TrangThai);
        Assert.Throws<InvalidOperationException>(() => TaoPhong().GiuGiuong(["G9"]));
    }

    [Fact]
    public void NguyenCan_TuLayToanBoGiuong()
    {
        var phong = TaoPhong();
        var selected = phong.GiuNguyenPhong();
        Assert.Equal(2, selected.Count);
        Assert.All(selected, g => Assert.Equal("GiuCho", g.TrangThai));
        Assert.Equal("GiuCho", phong.TrangThai);
    }

    [Fact]
    public void OGhep_ChiTheoDoiGiuongVuaGiuKhiPhongDaCoGiuongGiuCho()
    {
        var phong = TaoPhong();
        phong.TrangThai = "ConGiuongTrong";
        phong.Giuongs[0].TrangThai = "GiuCho";

        phong.GiuGiuong(["G2"]);

        var giuongVuaGiu = Assert.Single(phong.GiuongsVuaGiu);
        Assert.Equal("G2", giuongVuaGiu.MaGiuong);
    }

    [Theory]
    [InlineData("4", true)]
    [InlineData("6", false)]
    public void Phong_LocTheoToaVaSucChua(string loaiPhong, bool mongDoi)
    {
        var phong = TaoPhong();
        phong.ToaNha = "Tòa A";
        phong.LoaiPhong.SucChua = 4;

        Assert.Equal(mongDoi, phong.PhuHopYeuCau("Tòa A", loaiPhong, 500_000m, 1_500_000m));
        Assert.False(phong.PhuHopYeuCau("Tòa B", loaiPhong, 0, 0));
    }

    [Fact]
    public void PhieuCoc_TinhLaiTienVaHanThanhToanTuEntity()
    {
        var phong = TaoPhong();
        var giuongs = phong.GiuGiuong(["G1", "G2"]);
        var now = new DateTime(2026, 6, 15, 10, 0, 0);
        var phieu = PhieuCoc.TaoMoi("OGhep", new KhachHang { MaKH = "KH1" }, phong, giuongs, "NV1", now);
        Assert.Equal(2_000_000m, phieu.TongTien);
        Assert.Equal(now.AddHours(24), phieu.HanThanhToan);
        Assert.Equal("ChoDuyet", Assert.Single(phieu.ThanhViens).TrangThaiDuyet);
    }


    [Fact]
    public void KhachHang_ChiDanhDauCapNhatKhiThongTinThayDoi()
    {
        var khachHang = new KhachHang
        {
            MaKH = "KH1",
            HoTen = "Nguyen Van A",
            NgaySinh = new DateTime(2000, 1, 1),
            GioiTinh = "Nam",
            QuocTich = "Viet Nam",
            LoaiGiayTo = "CCCD",
            SoGiayTo = "001",
            DiaChiThuongTru = "Quan 1",
            SDT = "0900000000",
            Email = "a@example.com"
        };
        var thongTinKhongDoi = new KhachHang
        {
            HoTen = "Nguyen Van A",
            NgaySinh = new DateTime(2000, 1, 1),
            GioiTinh = "Nam",
            QuocTich = "Viet Nam",
            LoaiGiayTo = "CCCD",
            SoGiayTo = "001",
            DiaChiThuongTru = "Quan 1",
            SDT = "0900000000",
            Email = "a@example.com"
        };

        Assert.False(khachHang.CapNhatTu(thongTinKhongDoi));

        thongTinKhongDoi.Email = "moi@example.com";
        Assert.True(khachHang.CapNhatTu(thongTinKhongDoi));
        Assert.Equal("moi@example.com", khachHang.Email);
        Assert.Equal("Quan 1", khachHang.DiaChiThuongTru);
    }

    private static Phong TaoPhong() => new()
    {
        MaPhong = "P1",
        TrangThai = "Trong",
        LoaiPhong = new LoaiPhong { MaLP = "LP1", GiaThue = 1_000_000m },
        Giuongs =
        [
            new Giuong { MaGiuong = "G1", MaPhong = "P1", TrangThai = "Trong" },
            new Giuong { MaGiuong = "G2", MaPhong = "P1", TrangThai = "Trong" }
        ]
    };
}
