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
    public void Phong_LocTheoGioiTinhKhachHang()
    {
        var phong = TaoPhong();
        phong.GioiTinhChoPhep = "Nữ";

        Assert.True(phong.PhuHopYeuCau(null, null, 0, 0, "Nữ"));
        Assert.False(phong.PhuHopYeuCau(null, null, 0, 0, "Nam"));
    }

    [Fact]
    public void PhieuCoc_MoiChiKhoiTaoChuaTinhTien()
    {
        var phong = TaoPhong();
        var giuongs = phong.GiuGiuong(["G1", "G2"]);
        var now = new DateTime(2026, 6, 15, 10, 0, 0);
        var phieu = PhieuCoc.TaoMoi("OGhep", new KhachHang { MaKH = "KH1" }, phong, giuongs, "NV1", now);
        Assert.Equal(0m, phieu.TongTien);
        Assert.Null(phieu.HanThanhToan);
        Assert.Equal("ChoDuyet", Assert.Single(phieu.ThanhViens).TrangThaiDuyet);
    }

    [Fact]
    public void PhieuCoc_OGhepTinhHaiThangVaXacNhan()
    {
        var phong = TaoPhong();
        var giuongs = phong.GiuGiuong(["G1", "G2"]);
        var phieu = PhieuCoc.TaoMoi("OGhep", new KhachHang { MaKH = "KH1" }, phong, giuongs, "NV1", new DateTime(2026, 6, 15));

        phieu.TinhTienDuKien();
        phieu.XacNhanTinhTien(new DateTime(2026, 6, 16, 10, 0, 0), TimeSpan.FromHours(24));

        Assert.Equal(4_000_000m, phieu.TongTien);
        Assert.Equal(2, phieu.SoGiuongThue);
        Assert.Equal("ChoThanhToan", phieu.TrangThai);
        Assert.Equal(new DateTime(2026, 6, 17, 10, 0, 0), phieu.HanThanhToan);
    }

    [Fact]
    public void PhieuCoc_NguyenCanDungSucChuaToiDa()
    {
        var phong = TaoPhong();
        phong.LoaiPhong.SucChua = 4;
        var giuongs = phong.GiuNguyenPhong();
        var phieu = PhieuCoc.TaoMoi("NguyenCan", new KhachHang { MaKH = "KH1" }, phong, giuongs, "NV1", new DateTime(2026, 6, 15));

        phieu.TinhTienDuKien();

        Assert.Equal(4, phieu.SoGiuongThue);
        Assert.Equal(8_000_000m, phieu.TongTien);
    }

    [Fact]
    public void PhieuCoc_GhiNhanThanhToanChuyenSangChoDoiChieu()
    {
        var now = new DateTime(2026, 6, 16, 10, 0, 0);
        var phieu = TaoPhieuChoThanhToan(now.AddMinutes(1));

        phieu.GhiNhanThanhToan("ChuyenKhoan", "/api/deposits/chung-tu/proof.png", now);

        Assert.Equal("ChuyenKhoan", phieu.PhuongThucThanhToan);
        Assert.Equal("/api/deposits/chung-tu/proof.png", phieu.AnhMinhChung);
        Assert.Equal("ChoDoiChieu", phieu.TrangThai);
    }

    [Fact]
    public void PhieuCoc_TuChoiGhiNhanKhiKhongChoThanhToan()
    {
        var phieu = new PhieuCoc { MaPhieuCoc = "PC1", TrangThai = "ChoDoiChieu" };

        Assert.Throws<InvalidOperationException>(() =>
            phieu.GhiNhanThanhToan(
                "ChuyenKhoan", "/api/deposits/chung-tu/proof.png", new DateTime(2026, 6, 16)));
    }

    [Theory]
    [InlineData("")]
    [InlineData("TheTinDung")]
    public void PhieuCoc_TuChoiPhuongThucThanhToanKhongHopLe(string phuongThuc)
    {
        var now = new DateTime(2026, 6, 16, 10, 0, 0);
        var phieu = TaoPhieuChoThanhToan(now.AddMinutes(1));

        Assert.Throws<ArgumentException>(() =>
            phieu.GhiNhanThanhToan(phuongThuc, "/api/deposits/chung-tu/proof.png", now));
    }

    [Fact]
    public void PhieuCoc_TuChoiLienKetChungTuRong()
    {
        var now = new DateTime(2026, 6, 16, 10, 0, 0);
        var phieu = TaoPhieuChoThanhToan(now.AddMinutes(1));

        Assert.Throws<ArgumentException>(() => phieu.GhiNhanThanhToan("TienMat", " ", now));
    }

    [Fact]
    public void PhieuCoc_HetHanDungTaiMocKhongChoGuiChungTu()
    {
        var deadline = new DateTime(2026, 6, 16, 10, 1, 0);
        var phieu = TaoPhieuChoThanhToan(deadline);

        Assert.Throws<InvalidOperationException>(() =>
            phieu.GhiNhanThanhToan("TienMat", "/api/deposits/chung-tu/proof.png", deadline));
        Assert.True(phieu.CoTheTuDongHuy(deadline));
    }

    [Theory]
    [InlineData(1)]
    [InlineData(1440)]
    public void PhieuCoc_XacNhanTinhTien_DungThoiHanCauHinh(int soPhut)
    {
        var phong = TaoPhong();
        var now = new DateTime(2026, 6, 16, 10, 0, 0);
        var phieu = PhieuCoc.TaoMoi(
            "OGhep", new KhachHang { MaKH = "KH1" }, phong,
            phong.GiuGiuong(["G1"]), "NV1", now.AddDays(-1));

        phieu.XacNhanTinhTien(now, TimeSpan.FromMinutes(soPhut));

        Assert.Equal(now.AddMinutes(soPhut), phieu.HanThanhToan);
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
        LoaiPhong = new LoaiPhong { MaLP = "LP1", GiaThue = 1_000_000m, SucChua = 2 },
        Giuongs =
        [
            new Giuong { MaGiuong = "G1", MaPhong = "P1", TrangThai = "Trong" },
            new Giuong { MaGiuong = "G2", MaPhong = "P1", TrangThai = "Trong" }
        ]
    };

    private static PhieuCoc TaoPhieuChoThanhToan(DateTime deadline) => new()
    {
        MaPhieuCoc = "PC1",
        TrangThai = "ChoThanhToan",
        HanThanhToan = deadline,
    };
}
