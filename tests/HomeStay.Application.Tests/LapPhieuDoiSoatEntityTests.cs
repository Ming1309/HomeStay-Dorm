using System;
using System.Collections.Generic;
using HomeStay.Application.BusinessLogic;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class LapPhieuDoiSoatEntityTests
{
    [Fact]
    public void ChinhSachHoanCoc_DungHanTraVeTiLeDungHan()
    {
        var cs = TaoChinhSachMau();
        decimal tyLe = cs.XacDinhTyLeHoan(6, 6);
        Assert.Equal(1.0000m, tyLe);
    }

    [Fact]
    public void ChinhSachHoanCoc_TruocHanNganHanTraVeTiLeNganHan()
    {
        var cs = TaoChinhSachMau();
        // Thực tế ở 3 tháng < mốc lưu trữ 6 tháng
        decimal tyLe = cs.XacDinhTyLeHoan(3, 12);
        Assert.Equal(0.5000m, tyLe);
    }

    [Fact]
    public void ChinhSachHoanCoc_TruocHanDaiHanTraVeTiLeDaiHan()
    {
        var cs = TaoChinhSachMau();
        // Thực tế ở 7 tháng >= mốc lưu trữ 6 tháng nhưng < 12 tháng quy định
        decimal tyLe = cs.XacDinhTyLeHoan(7, 12);
        Assert.Equal(0.7000m, tyLe);
    }

    [Fact]
    public void HopDong_TinhSoThangLuuTruChinhXac()
    {
        var hd = new HopDong
        {
            NgayBatDau = new DateTime(2026, 1, 15),
            NgayKetThuc = new DateTime(2026, 7, 15)
        };

        // Đúng hạn: 6 tháng
        Assert.Equal(6, hd.TinhSoThangHopDong());

        // Ngày đối soát: 2026-05-20 (ở được 4 tháng 5 ngày -> làm tròn xuống 4 tháng)
        Assert.Equal(4, hd.TinhSoThangThucTe(new DateTime(2026, 5, 20)));

        // Ngày đối soát: 2026-05-10 (chưa qua ngày 15 -> ở được 3 tháng 25 ngày -> làm tròn xuống 3 tháng)
        Assert.Equal(3, hd.TinhSoThangThucTe(new DateTime(2026, 5, 10)));
    }

    [Fact]
    public void PhieuDoiSoat_TinhToanChotKetQuaCoTienHoan()
    {
        var pds = PhieuDoiSoat.TaoMoi("PC0001", "HD0001", "NV01", new DateTime(2026, 7, 13));
        
        // Tiền cọc: 2,000,000. Tỷ lệ hoàn cọc: 100%. Khấu trừ hóa đơn: 800,000
        var hoadon = new HoaDon { TongTien = 800_000m };
        pds.TinhToanDoiSoat(2_000_000m, 1.0m, new List<HoaDon> { hoadon });

        // Kết quả: Tiền hoàn = 1,200,000, Thu thêm = 0
        Assert.Equal(1_200_000m, pds.TienHoan);
        Assert.Equal(0m, pds.TienThuThem);
        Assert.Equal(800_000m, pds.TongKhauTru);
    }

    [Fact]
    public void PhieuDoiSoat_TinhToanChotKetQuaCoTienThuThem()
    {
        var pds = PhieuDoiSoat.TaoMoi("PC0001", "HD0001", "NV01", new DateTime(2026, 7, 13));

        // Tiền cọc: 1,000,000. Tỷ lệ hoàn cọc: 50% (hoàn cọc tối đa 500,000). Khấu trừ hóa đơn: 800,000
        var hoadon = new HoaDon { TongTien = 800_000m };
        pds.TinhToanDoiSoat(1_000_000m, 0.5m, new List<HoaDon> { hoadon });

        // Kết quả: Tiền hoàn = 0, Thu thêm = 300,000
        Assert.Equal(0m, pds.TienHoan);
        Assert.Equal(300_000m, pds.TienThuThem);
        Assert.Equal(800_000m, pds.TongKhauTru);
    }

    private static ChinhSachHoanCoc TaoChinhSachMau() => new()
    {
        MaChinhSach = "CS01",
        TenChinhSach = "Chính sách tiêu chuẩn",
        TiLe_ChuaKy = 0.8000m,
        TiLe_TruocHan_NganHan = 0.5000m,
        TiLe_TruocHan_DaiHan = 0.7000m,
        TiLe_DungHan = 1.0000m,
        MocLuuTru = 6
    };
}
