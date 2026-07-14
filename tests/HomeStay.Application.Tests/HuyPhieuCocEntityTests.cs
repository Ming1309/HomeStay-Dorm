using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class HuyPhieuCocEntityTests
{
    [Fact]
    public void PhieuCoc_Huy_ChuyenTrangThaiVaLuuVet()
    {
        var phieu = new PhieuCoc { MaPhieuCoc = "PC001", TrangThai = "ChoThanhToan" };
        var thoiDiem = new DateTime(2026, 7, 13, 11, 40, 0);

        phieu.Huy("NV03", thoiDiem);

        Assert.Equal("DaHuy", phieu.TrangThai);
        Assert.Equal("NV03", phieu.MaNVHuy);
        Assert.Equal(thoiDiem, phieu.ThoiDiemHuy);
    }

    [Fact]
    public void PhieuCoc_TuChoiHuyLai()
    {
        var phieu = new PhieuCoc { MaPhieuCoc = "PC001", TrangThai = "DaHuy" };

        Assert.Throws<InvalidOperationException>(() => phieu.Huy("NV03", DateTime.Now));
    }

    [Fact]
    public void PhieuCoc_QuaHanChuaThuTien_TuDongHuyVaDanhDauHeThong()
    {
        var deadline = new DateTime(2026, 7, 13, 11, 40, 0);
        var phieu = new PhieuCoc
        {
            MaPhieuCoc = "PC001",
            TrangThai = "ChoThanhToan",
            HanThanhToan = deadline,
            DaDongTien = false,
        };

        phieu.TuDongHuyQuaHan(deadline);

        Assert.Equal("DaHuy", phieu.TrangThai);
        Assert.Equal(deadline, phieu.ThoiDiemHuy);
        Assert.Null(phieu.MaNVHuy);
    }

    [Theory]
    [InlineData("ChoDoiChieu", false)]
    [InlineData("ChoThanhToan", true)]
    public void PhieuCoc_KhongTuDongHuyKhiDangDoiChieuHoacDaThuTien(
        string trangThai, bool daDongTien)
    {
        var deadline = new DateTime(2026, 7, 13, 11, 40, 0);
        var phieu = new PhieuCoc
        {
            MaPhieuCoc = "PC001",
            TrangThai = trangThai,
            HanThanhToan = deadline,
            DaDongTien = daDongTien,
        };

        Assert.False(phieu.CoTheTuDongHuy(deadline.AddMinutes(1)));
    }

    [Fact]
    public void PhieuCoc_DaHuyCoThoiDiem_DuDieuKienKiemTraDoiSoat()
    {
        var phieu = new PhieuCoc
        {
            MaPhieuCoc = "PC001",
            TrangThai = "DaHuy",
            ThoiDiemHuy = new DateTime(2026, 7, 13, 11, 40, 0),
        };

        phieu.KiemTraCoTheDoiSoatHoanCoc();
    }

    [Theory]
    [InlineData("DaThanhToan")]
    [InlineData("ChoThanhToan")]
    public void PhieuCoc_ChuaHuy_TuChoiDoiSoatHoanCoc(string trangThai)
    {
        var phieu = new PhieuCoc { MaPhieuCoc = "PC001", TrangThai = trangThai };

        Assert.Throws<InvalidOperationException>(phieu.KiemTraCoTheDoiSoatHoanCoc);
    }

    [Fact]
    public void PhieuCoc_DaHuyThieuThoiDiem_TuChoiDoiSoatHoanCoc()
    {
        var phieu = new PhieuCoc { MaPhieuCoc = "PC001", TrangThai = "DaHuy" };

        Assert.Throws<InvalidOperationException>(phieu.KiemTraCoTheDoiSoatHoanCoc);
    }

    [Fact]
    public void PhieuThu_KhopSoTienCoc_DuDieuKienDoiSoat()
    {
        var phieu = new PhieuCoc { MaPhieuCoc = "PC001", TongTien = 2_000_000m };
        var phieuThu = new PhieuThu { MaPhieuCoc = "PC001", SoTienThu = 2_000_000m };

        phieuThu.KiemTraKhopTienCoc(phieu);
    }

    [Fact]
    public void PhieuThu_LechSoTienCoc_TuChoiDoiSoat()
    {
        var phieu = new PhieuCoc { MaPhieuCoc = "PC001", TongTien = 2_000_000m };
        var phieuThu = new PhieuThu { MaPhieuCoc = "PC001", SoTienThu = 1_900_000m };

        Assert.Throws<InvalidOperationException>(() => phieuThu.KiemTraKhopTienCoc(phieu));
    }

    [Fact]
    public void Phong_GiaiPhongMotGiuong_CapNhatPhongConGiuongTrong()
    {
        var phong = TaoPhong();

        phong.GiaiPhongDatCoc(["G1"]);

        Assert.Equal("Trong", phong.Giuongs[0].TrangThai);
        Assert.Equal("DaCoc", phong.Giuongs[1].TrangThai);
        Assert.Equal("ConGiuongTrong", phong.TrangThai);
        Assert.Equal("G1", Assert.Single(phong.GiuongsVuaGiaiPhong).MaGiuong);
    }

    [Fact]
    public void Phong_GiaiPhongToanBoGiuong_ChuyenPhongSangTrong()
    {
        var phong = TaoPhong();

        phong.GiaiPhongDatCoc(["G1", "G2"]);

        Assert.All(phong.Giuongs, giuong => Assert.Equal("Trong", giuong.TrangThai));
        Assert.Equal("Trong", phong.TrangThai);
    }

    [Fact]
    public void Phong_TuChoiGiaiPhongGiuongKhongConDuocGiu()
    {
        var phong = TaoPhong();
        phong.Giuongs[0].TrangThai = "Trong";

        Assert.Throws<InvalidOperationException>(() => phong.GiaiPhongDatCoc(["G1"]));
    }

    private static Phong TaoPhong() => new()
    {
        MaPhong = "P1",
        TrangThai = "DaCoc",
        Giuongs =
        [
            new Giuong { MaGiuong = "G1", MaPhong = "P1", TrangThai = "GiuCho" },
            new Giuong { MaGiuong = "G2", MaPhong = "P1", TrangThai = "DaCoc" },
        ],
    };
}
