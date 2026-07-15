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

    // UC 1.4.14 Xử lý thanh toán hợp đồng
    public static Task<bool> KiemTraChuaCoHoaDonKyDau(string maHD) =>
        HoaDonDB.ExistsHoaDonKyDau(maHD);

    public static decimal TinhTongTienKyDau(IReadOnlyList<ChiTietHoaDon> dsChiTiet) =>
        dsChiTiet.Sum(x => x.ThanhTien);

    public static async Task<HoaDon> TaoHoaDonKyDauDaThanhToan(
        string maHD, decimal tongTien, string maNV, DateTime ngayLap,
        IReadOnlyList<ChiTietHoaDon> dsChiTiet)
    {
        if (string.IsNullOrWhiteSpace(maHD))
            throw new ArgumentException("Mã hợp đồng không được để trống.", nameof(maHD));
        if (string.IsNullOrWhiteSpace(maNV))
            throw new ArgumentException("Không xác định được Kế toán thực hiện.", nameof(maNV));
        if (tongTien < 0)
            throw new ArgumentException("Tổng tiền không hợp lệ.");
        if (dsChiTiet is null || dsChiTiet.Count == 0)
            throw new ArgumentException("Hóa đơn phải có ít nhất một dòng chi tiết.");

        if (await KiemTraChuaCoHoaDonKyDau(maHD))
            throw new InvalidOperationException("Hợp đồng này đã có hóa đơn kỳ đầu.");

        var hoaDon = new HoaDon
        {
            NgayLap = ngayLap.Date,
            HanThanhToan = ngayLap.Date,
            LoaiHoaDon = "KyDau",
            TongTien = tongTien,
            TrangThai = "DaThanhToan",
            GhiChu = null,
            MaHD = maHD,
            MaNV = maNV,
        };

        await HoaDonDB.Insert(hoaDon);
        return hoaDon;
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
