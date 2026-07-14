using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class QuanLyPhongGiuongEntityTests
{
    // ---- Phong: kiem tra du lieu ----

    [Fact]
    public void Phong_ThieuSoPhong_ThrowsArgumentException()
    {
        var phong = TaoPhong();
        phong.SoPhong = "  ";
        Assert.Throws<ArgumentException>(phong.KiemTraDuLieuHopLe);
    }

    [Fact]
    public void Phong_ThieuLoaiPhong_ThrowsArgumentException()
    {
        var phong = TaoPhong();
        phong.MaLP = "";
        Assert.Throws<ArgumentException>(phong.KiemTraDuLieuHopLe);
    }

    [Fact]
    public void Phong_ThieuChiNhanh_ThrowsArgumentException()
    {
        var phong = TaoPhong();
        phong.MaCN = "";
        Assert.Throws<ArgumentException>(phong.KiemTraDuLieuHopLe);
    }

    [Theory]
    [InlineData("Trong")]
    [InlineData("DangBaoTri")]
    [InlineData("NgungSuDung")]
    public void Phong_TrangThaiHopLe_KhongNemLoi(string trangThai)
    {
        var phong = TaoPhong();
        phong.TrangThai = trangThai;
        phong.KiemTraDuLieuHopLe();
    }

    [Theory]
    [InlineData("Broken")]
    [InlineData("")]
    public void Phong_TrangThaiKhongHopLe_ThrowsArgumentException(string trangThai)
    {
        var phong = TaoPhong();
        phong.TrangThai = trangThai;
        Assert.Throws<ArgumentException>(phong.KiemTraDuLieuHopLe);
    }

    [Theory]
    [InlineData("GiuCho")]
    [InlineData("DaCoc")]
    [InlineData("DangSuDung")]
    public void Phong_XoaKhiDangSuDung_ThrowsInvalidOperation(string trangThai)
    {
        var phong = TaoPhong();
        phong.TrangThai = trangThai;
        var ex = Assert.Throws<InvalidOperationException>(phong.KiemTraCoTheXoa);
        Assert.Equal("Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.", ex.Message);
    }

    [Theory]
    [InlineData("Trong")]
    [InlineData("DangBaoTri")]
    [InlineData("NgungSuDung")]
    public void Phong_XoaKhiKhongSuDung_KhongNemLoi(string trangThai)
    {
        var phong = TaoPhong();
        phong.TrangThai = trangThai;
        phong.KiemTraCoTheXoa();
    }

    [Fact]
    public void Phong_ThemGiuongVuotSucChua_ThrowsInvalidOperation()
    {
        var phong = TaoPhong();
        phong.LoaiPhong.SucChua = 2;
        Assert.Throws<InvalidOperationException>(() => phong.KiemTraSoGiuongKhongVuotSucChua(2));
    }

    [Fact]
    public void Phong_ThemGiuongTrongSucChua_KhongNemLoi()
    {
        var phong = TaoPhong();
        phong.LoaiPhong.SucChua = 4;
        phong.KiemTraSoGiuongKhongVuotSucChua(3);
    }

    [Fact]
    public void Phong_DoiLoaiPhongGiamSucChuaDuoiSoGiuong_ThrowsInvalidOperation()
    {
        var phong = TaoPhong();
        // Phong dang co 4 giuong, loai phong moi chi chua 2.
        Assert.Throws<InvalidOperationException>(() =>
            phong.KiemTraSucChuaChoDoiLoaiPhong(sucChuaMoi: 2, soGiuongHienCo: 4));
    }

    [Fact]
    public void Phong_DoiLoaiPhongSucChuaBangSoGiuong_KhongNemLoi()
    {
        var phong = TaoPhong();
        phong.KiemTraSucChuaChoDoiLoaiPhong(sucChuaMoi: 4, soGiuongHienCo: 4);
    }

    [Fact]
    public void Phong_DoiTrangThaiVeTrongKhiCoGiuongDangDung_ThrowsInvalidOperation()
    {
        var phong = TaoPhong();
        var giuongs = new List<Giuong> { new() { TrangThai = "DaCoc" } };
        Assert.Throws<InvalidOperationException>(() =>
            phong.KiemTraDoiTrangThai("Trong", giuongs, dangDuocThamChieu: false));
    }

    [Fact]
    public void Phong_DoiTrangThaiVeBaoTriKhiDangDuocThamChieu_ThrowsInvalidOperation()
    {
        var phong = TaoPhong();
        Assert.Throws<InvalidOperationException>(() =>
            phong.KiemTraDoiTrangThai("DangBaoTri", [], dangDuocThamChieu: true));
    }

    [Fact]
    public void Phong_DoiTrangThaiSangDangSuDung_KhongNemLoiDuDangThamChieu()
    {
        var phong = TaoPhong();
        // Chuyen sang trang thai "dang su dung" khong bi chan boi guard nay.
        phong.KiemTraDoiTrangThai("DangSuDung", [], dangDuocThamChieu: true);
    }

    [Fact]
    public void Phong_SoPhongVuotDoDai_ThrowsArgumentException()
    {
        var phong = TaoPhong();
        phong.SoPhong = new string('A', 21);
        Assert.Throws<ArgumentException>(phong.KiemTraDuLieuHopLe);
    }

    [Fact]
    public void Phong_ChuanHoa_TrimVaChuyenRongThanhNull()
    {
        var phong = TaoPhong();
        phong.SoPhong = "  101  ";
        phong.ToaNha = "   ";
        phong.Tang = "  Tầng 2 ";
        phong.ChuanHoa();
        Assert.Equal("101", phong.SoPhong);
        Assert.Null(phong.ToaNha);
        Assert.Equal("Tầng 2", phong.Tang);
    }

    [Fact]
    public void Phong_ChoPhepNu_ChapNhanGiaTriCoDauTrongDuLieuSeed()
    {
        var phong = TaoPhong();
        phong.GioiTinhChoPhep = "Nữ";

        Assert.True(phong.KiemTraGioiTinhChoPhep(
            [new KhachHang { GioiTinh = "Nữ" }]));
        Assert.False(phong.KiemTraGioiTinhChoPhep(
            [new KhachHang { GioiTinh = "Nam" }]));
    }

    // ---- Giuong: kiem tra du lieu ----

    [Fact]
    public void Giuong_ThieuSoGiuong_ThrowsArgumentException()
    {
        var giuong = TaoGiuong();
        giuong.SoGiuong = "";
        Assert.Throws<ArgumentException>(giuong.KiemTraDuLieuHopLe);
    }

    [Fact]
    public void Giuong_ThieuPhong_ThrowsArgumentException()
    {
        var giuong = TaoGiuong();
        giuong.MaPhong = "";
        Assert.Throws<ArgumentException>(giuong.KiemTraDuLieuHopLe);
    }

    [Fact]
    public void Giuong_TrangThaiKhongHopLe_ThrowsArgumentException()
    {
        var giuong = TaoGiuong();
        giuong.TrangThai = "Broken";
        Assert.Throws<ArgumentException>(giuong.KiemTraDuLieuHopLe);
    }

    [Theory]
    [InlineData("GiuCho")]
    [InlineData("DaCoc")]
    [InlineData("DangSuDung")]
    public void Giuong_XoaKhiDangSuDung_ThrowsInvalidOperation(string trangThai)
    {
        var giuong = TaoGiuong();
        giuong.TrangThai = trangThai;
        var ex = Assert.Throws<InvalidOperationException>(giuong.KiemTraCoTheXoa);
        Assert.Equal("Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.", ex.Message);
    }

    [Fact]
    public void Giuong_XoaKhiTrong_KhongNemLoi()
    {
        var giuong = TaoGiuong();
        giuong.TrangThai = "Trong";
        giuong.KiemTraCoTheXoa();
    }

    [Theory]
    [InlineData("GiuCho")]
    [InlineData("DaCoc")]
    [InlineData("DangSuDung")]
    public void Giuong_ChuyenPhongKhiDangSuDung_ThrowsInvalidOperation(string trangThai)
    {
        var giuong = TaoGiuong();
        giuong.TrangThai = trangThai;
        var ex = Assert.Throws<InvalidOperationException>(
            () => giuong.KiemTraCoTheChuyenPhong(dangDuocThamChieu: false));
        Assert.Equal("Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.", ex.Message);
    }

    [Fact]
    public void Giuong_ChuyenPhongKhiDangDuocThamChieu_ThrowsInvalidOperation()
    {
        var giuong = TaoGiuong();
        giuong.TrangThai = "Trong";
        Assert.Throws<InvalidOperationException>(
            () => giuong.KiemTraCoTheChuyenPhong(dangDuocThamChieu: true));
    }

    [Fact]
    public void Giuong_ChuyenPhongKhiTrongVaKhongThamChieu_KhongNemLoi()
    {
        var giuong = TaoGiuong();
        giuong.TrangThai = "Trong";
        giuong.KiemTraCoTheChuyenPhong(dangDuocThamChieu: false);
    }

    [Theory]
    [InlineData("GiuCho")]
    [InlineData("DaCoc")]
    [InlineData("DangSuDung")]
    public void Giuong_DoiSoKhiDangSuDung_ThrowsInvalidOperation(string trangThai)
    {
        var giuong = TaoGiuong();
        giuong.TrangThai = trangThai;
        Assert.Throws<InvalidOperationException>(
            () => giuong.KiemTraCoTheDoiSoGiuong(dangDuocThamChieu: false));
    }

    [Fact]
    public void Giuong_DoiSoKhiDangDuocThamChieu_ThrowsInvalidOperation()
    {
        var giuong = TaoGiuong();
        Assert.Throws<InvalidOperationException>(
            () => giuong.KiemTraCoTheDoiSoGiuong(dangDuocThamChieu: true));
    }

    [Fact]
    public void Giuong_DoiSoKhiTrongVaKhongThamChieu_KhongNemLoi()
    {
        var giuong = TaoGiuong();
        giuong.KiemTraCoTheDoiSoGiuong(dangDuocThamChieu: false);
    }

    [Fact]
    public void Giuong_DoiTrangThaiVeTrongKhiDangThamChieu_ThrowsInvalidOperation()
    {
        var giuong = TaoGiuong();
        Assert.Throws<InvalidOperationException>(
            () => giuong.KiemTraDoiTrangThai("Trong", dangDuocThamChieu: true));
    }

    [Fact]
    public void Giuong_DoiTrangThaiVeTrongKhiKhongThamChieu_KhongNemLoi()
    {
        var giuong = TaoGiuong();
        giuong.KiemTraDoiTrangThai("Trong", dangDuocThamChieu: false);
    }

    [Fact]
    public void Giuong_SoGiuongVuotDoDai_ThrowsArgumentException()
    {
        var giuong = TaoGiuong();
        giuong.SoGiuong = new string('G', 21);
        Assert.Throws<ArgumentException>(giuong.KiemTraDuLieuHopLe);
    }

    [Fact]
    public void Giuong_ChuanHoa_TrimCacTruong()
    {
        var giuong = TaoGiuong();
        giuong.SoGiuong = "  Giường A  ";
        giuong.MaPhong = " P1 ";
        giuong.ChuanHoa();
        Assert.Equal("Giường A", giuong.SoGiuong);
        Assert.Equal("P1", giuong.MaPhong);
    }

    private static Phong TaoPhong() => new()
    {
        MaPhong = "P1",
        SoPhong = "101",
        ToaNha = "Tòa A",
        TrangThai = "Trong",
        MaLP = "LP01",
        MaCN = "CN01",
        LoaiPhong = new LoaiPhong { MaLP = "LP01", SucChua = 4, GiaThue = 1_000_000m },
    };

    private static Giuong TaoGiuong() => new()
    {
        MaGiuong = "G1",
        SoGiuong = "Giường A",
        TrangThai = "Trong",
        MaPhong = "P1",
    };
}
