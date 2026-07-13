namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class HoaDon
{
    public string MaHoaDon { get; set; } = string.Empty;
    public DateTime NgayLap { get; set; }
    public DateTime? HanThanhToan { get; set; }
    public string LoaiHoaDon { get; set; } = string.Empty;
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public string MaHD { get; set; } = string.Empty;
    public string? MaNV { get; set; }

    public static Task<IReadOnlyList<HoaDon>> LayDanhSachChuaThanhToan(string maHD) =>
        HoaDonDB.LayDanhSachChuaThanhToanTheoHD(maHD);

    public static Task<IReadOnlyList<HoaDon>> LayDSHoaDonTheoPhieuDoiSoat(string maPDS) =>
        HoaDonDB.GetDSHoaDonTheoMaPDS(maPDS);

    public static Task<IReadOnlyList<HoaDon>> LayDSHoaDonCanThuTheoPDS(string maPDS) =>
        HoaDonDB.GetDSHoaDonCanThuTheoPDS(maPDS);

    public static Task<decimal> TinhTongKhauTru(string maPDS) =>
        HoaDonDB.TinhTongKhauTru(maPDS);

    public static Task<decimal> TinhTongCanThu(string maPDS) =>
        HoaDonDB.TinhTongCanThu(maPDS);

    /// <summary>
    /// A6: số tiền phạt phải hợp lệ (không trống, không chữ, không âm).
    /// </summary>
    public static bool KiemTraTinhHopLe(IReadOnlyList<decimal> dsSoTien)
    {
        if (dsSoTien is null || dsSoTien.Count == 0)
            throw new ArgumentException("Vui lòng nhập số tiền phạt hợp lệ");

        foreach (var soTien in dsSoTien)
        {
            if (soTien < 0)
                throw new ArgumentException("Vui lòng nhập số tiền phạt hợp lệ");
        }

        return true;
    }

    public static async Task<HoaDon> TaoHoaDonBoiThuong(
        string maBienBan,
        decimal tongTien,
        string maNV,
        DateTime ngayLap,
        string? ghiChuThem = null)
    {
        if (string.IsNullOrWhiteSpace(maBienBan))
            throw new ArgumentException("Mã biên bản không được để trống.", nameof(maBienBan));
        if (string.IsNullOrWhiteSpace(maNV))
            throw new ArgumentException("Không xác định được Kế toán thực hiện.", nameof(maNV));
        if (tongTien < 0)
            throw new ArgumentException("Vui lòng nhập số tiền phạt hợp lệ");

        var bienBan = await BienBanGiaoNhan.LayChiTietBienBan(maBienBan)
            ?? throw new KeyNotFoundException("Không tìm thấy biên bản thu hồi.");

        if (!string.Equals(bienBan.LoaiBienBan, "ThuHoi", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Chỉ được lập hóa đơn bồi thường từ biên bản thu hồi.");

        if (await BienBanGiaoNhan.DaCoHoaDonBoiThuongTheoHD(bienBan.MaHD))
            throw new InvalidOperationException("Hợp đồng này đã có hóa đơn bồi thường.");

        var dsHuHong = await ChiTietGiaoNhan.LayDSTaiSanHuHongTheoBienBan(maBienBan);
        if (dsHuHong.Count == 0)
            throw new InvalidOperationException("Biên bản không có tài sản hư hỏng/mất mát cần bồi thường.");

        var ghiChu = $"MaBienBan={maBienBan}";
        if (!string.IsNullOrWhiteSpace(ghiChuThem))
            ghiChu = $"{ghiChu}; {ghiChuThem.Trim()}";

        var hoaDon = new HoaDon
        {
            // VARCHAR(20): "HDON" (4) + yyMMddHHmmssfff (15) = 19
            MaHoaDon = $"HDON{ngayLap:yyMMddHHmmssfff}",
            NgayLap = ngayLap.Date,
            HanThanhToan = null,
            LoaiHoaDon = "BoiThuong",
            TongTien = tongTien,
            TrangThai = "ChuaThanhToan",
            GhiChu = ghiChu,
            MaHD = bienBan.MaHD,
            MaNV = maNV,
        };

        await HoaDonDB.InsertHoaDon(hoaDon);
        return hoaDon;
    }
}
