namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class PhieuDoiSoat
{
    public string MaPDS { get; set; } = string.Empty;
    public DateTime NgayDoiSoat { get; set; }
    public decimal TyLeHoanCoc { get; set; }
    public decimal TongKhauTru { get; set; }
    public decimal TienHoan { get; set; }
    public decimal TienThuThem { get; set; }
    public string TrangThai { get; set; } = "ChoXacNhan";
    public string? GhiChu { get; set; }
    public string? MaHD { get; set; }
    public string? MaNV { get; set; }
    public bool KhachHangDongY { get; set; }
    public string? MaNVChot { get; set; }
    public DateTime? ThoiDiemChot { get; set; }
    public string? GhiChuXacNhan { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string? MaGiuong { get; set; }

    public List<HoaDon> HoaDons { get; set; } = [];

    public static PhieuDoiSoat TaoMoi(string maPhieuCoc, string? maHD, string? maNhanVien, DateTime thoiDiem)
    {
        return new PhieuDoiSoat
        {
            NgayDoiSoat = thoiDiem.Date,
            MaPhieuCoc = maPhieuCoc,
            MaHD = maHD,
            MaNV = maNhanVien,
            TrangThai = "ChoXacNhan"
        };
    }

    public void ApDungChinhSachHoanCoc(decimal tiLe)
    {
        TyLeHoanCoc = tiLe;
    }

    public void TinhTongKhauTru(decimal tongTienHoaDon)
    {
        TongKhauTru = tongTienHoaDon;
    }

    public void TinhToanDoiSoat(decimal tienCoc, decimal tyLe, IReadOnlyList<HoaDon> dsHoaDon)
    {
        TyLeHoanCoc = tyLe;
        HoaDons = dsHoaDon.ToList();
        decimal tongTienHoaDon = dsHoaDon.Sum(x => x.TongTien);
        TinhTongKhauTru(tongTienHoaDon);
        ChotKetQua(tienCoc);
    }

    public void ChotKetQua(decimal tienCoc)
    {
        decimal hoanDuKien = tienCoc * TyLeHoanCoc;
        if (hoanDuKien >= TongKhauTru)
        {
            TienHoan = hoanDuKien - TongKhauTru;
            TienThuThem = 0;
        }
        else
        {
            TienHoan = 0;
            TienThuThem = TongKhauTru - hoanDuKien;
        }
    }

    public (string LoaiKetQua, decimal SoTienKetQua) XacDinhKetQua()
    {
        if (TienHoan > 0) return ("Hoan", TienHoan);
        if (TienThuThem > 0) return ("ThuThem", TienThuThem);
        return ("HoaVon", 0);
    }

    public Task LuuPhieu() => PhieuDoiSoatDB.LuuPhieu(this);

    public static Task<IReadOnlyList<PhieuDoiSoat>> LayDSPhieuDoiSoatDaChot()
        => PhieuDoiSoatDB.GetDSPhieuDoiSoatDaChot();

    public static Task<IReadOnlyList<PhieuDoiSoat>> LayDSPhieuDoiSoatCanHoan()
        => PhieuDoiSoatDB.GetDSPhieuDoiSoatCanHoan();

    public static Task<PhieuDoiSoat?> LayChiTietPhieuDoiSoat(string maPDS)
        => PhieuDoiSoatDB.GetPhieuDoiSoatTheoMaPDS(maPDS);

    public static Task<PhieuDoiSoat?> LayChiTietChoCapNhat(string maPDS)
        => PhieuDoiSoatDB.GetPhieuDoiSoatChoCapNhat(maPDS);

    public static Task<IReadOnlyList<PhieuDoiSoat>> LayDanhSachChoXacNhan()
        => PhieuDoiSoatDB.GetDanhSachChoXacNhan();

    public async Task XacNhanKhachHangDongY(string maNhanVien, DateTime thoiDiem)
    {
        if (TrangThai != "ChoXacNhan")
            throw new InvalidOperationException("Phiếu đối soát đã được xác nhận hoặc không còn hợp lệ.");
        if (string.IsNullOrWhiteSpace(maNhanVien))
            throw new ArgumentException("Không xác định được Quản lý xác nhận.", nameof(maNhanVien));
        KhachHangDongY = true;
        MaNVChot = maNhanVien.Trim();
        ThoiDiemChot = thoiDiem;
        GhiChuXacNhan = null;
        var trangThaiMoi = TienHoan == 0 && TienThuThem == 0 ? "DaTatToan" : "DaChot";
        if (!await PhieuDoiSoatDB.XacNhan(this, trangThaiMoi))
            throw new InvalidOperationException("Phiếu đối soát vừa được xử lý bởi người khác. Vui lòng tải lại.");
        TrangThai = trangThaiMoi;
    }

    public static Task<bool> TonTaiChoPhieuCocChuaKy(string maPhieuCoc)
        => PhieuDoiSoatDB.TonTaiChoPhieuCocChuaKy(maPhieuCoc);

    public static async Task<decimal> TinhToanKetQua(string maPDS)
    {
        var pds = await LayChiTietPhieuDoiSoat(maPDS);
        return pds?.TienThuThem ?? 0;
    }

    public static async Task ChuyenSangDaTatToan(string maPDS)
    {
        if (!await PhieuDoiSoatDB.UpdateTrangThai(maPDS, "DaChot", "DaTatToan"))
            throw new InvalidOperationException("Phiếu đối soát đã được xử lý hoặc không còn ở trạng thái Đã chốt.");
    }

    // UC 1.4.23 Thanh lý hợp đồng
    public static Task<PhieuDoiSoat?> LayThongTinDoiSoat(string maHD) =>
        PhieuDoiSoatDB.GetPhieuDoiSoatTheoMaHD(maHD);

    /// <summary>
    /// true = khách đã hoàn tất nghĩa vụ tài chính (được hoàn / hòa vốn / đã tất toán khoản thu thêm).
    /// </summary>
    public static bool KiemTraCongNo(PhieuDoiSoat pds)
    {
        if (pds is null) throw new ArgumentNullException(nameof(pds));
        if (string.Equals(pds.TrangThai, "ChoXacNhan", StringComparison.OrdinalIgnoreCase)) return false;
        if (pds.TienThuThem <= 0) return true;
        return string.Equals(pds.TrangThai, "DaTatToan", StringComparison.OrdinalIgnoreCase);
    }

    public static async Task<bool> KiemTraCongNo(string maPDS)
    {
        var pds = await LayChiTietPhieuDoiSoat(maPDS)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu đối soát.");
        return KiemTraCongNo(pds);
    }
}
