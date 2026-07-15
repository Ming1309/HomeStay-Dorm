namespace HomeStay.Application.BusinessLogic;

using System;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DBs;

public sealed class PhieuThu
{
    public static Task<bool> ThamChieuChungTu(string tenTep) => PhieuThuDB.ThamChieuChungTu(tenTep);
    public string MaPT { get; set; } = string.Empty;
    public decimal SoTienThu { get; set; }
    public DateTime ThoiGian { get; set; }
    public string? PhuongThucThanhToan { get; set; }
    public string? AnhMinhChung { get; set; }
    public string? MaHoaDon { get; set; }
    public string? MaPhieuCoc { get; set; }
    public string? MaPDS { get; set; }
    public string? MaNV { get; set; }

    // ==========================================================
    // Methods from feat/thanh-toan-tra-phong branch
    // ==========================================================
    public static PhieuThu TaoPhieuThu(string maPDS, decimal soTien, string phuongThuc, string? anhMinhChung, string maNV, DateTime thoiDiem)
    {
        if (string.IsNullOrWhiteSpace(maPDS))
            throw new ArgumentException("Mã phiếu đối soát không được để trống.", nameof(maPDS));
        if (soTien <= 0)
            throw new ArgumentException("Số tiền thu phải lớn hơn 0.");
        if (phuongThuc is not ("TienMat" or "ChuyenKhoan"))
            throw new ArgumentException("Phương thức thanh toán không hợp lệ.", nameof(phuongThuc));
        if (string.IsNullOrWhiteSpace(anhMinhChung))
            throw new ArgumentException("Phải có chứng từ xác nhận đã thu tiền.", nameof(anhMinhChung));
        if (string.IsNullOrWhiteSpace(maNV))
            throw new ArgumentException("Không xác định được Kế toán thực hiện.", nameof(maNV));

        return new PhieuThu
        {
            SoTienThu = soTien,
            ThoiGian = thoiDiem,
            PhuongThucThanhToan = phuongThuc,
            AnhMinhChung = anhMinhChung,
            MaPDS = maPDS,
            MaNV = maNV
        };
    }

    // UC 1.4.14 Xử lý thanh toán hợp đồng
    public static PhieuThu TaoPhieuThuTienHoaDon(
        string maHoaDon, decimal soTienThu, string phuongThuc, string? anhMinhChung, string maNV, DateTime thoiDiem)
    {
        if (string.IsNullOrWhiteSpace(maHoaDon))
            throw new ArgumentException("Mã hóa đơn không được để trống.", nameof(maHoaDon));
        if (soTienThu <= 0)
            throw new ArgumentException("Số tiền thu phải lớn hơn 0.");
        if (phuongThuc is not ("TienMat" or "ChuyenKhoan"))
            throw new ArgumentException("Phương thức thanh toán không hợp lệ.", nameof(phuongThuc));
        if (string.IsNullOrWhiteSpace(anhMinhChung))
            throw new ArgumentException("Phải có chứng từ xác nhận đã thu tiền.", nameof(anhMinhChung));
        if (string.IsNullOrWhiteSpace(maNV))
            throw new ArgumentException("Không xác định được Kế toán thực hiện.", nameof(maNV));

        return new PhieuThu
        {
            SoTienThu = soTienThu,
            ThoiGian = thoiDiem,
            PhuongThucThanhToan = phuongThuc,
            AnhMinhChung = anhMinhChung,
            MaHoaDon = maHoaDon,
            MaNV = maNV
        };
    }

    public Task LuuPhieu() => PhieuThuDB.InsertPhieuThu(this);

    public static Task<bool> DaTonTaiChoPhieuDoiSoat(string maPDS) =>
        PhieuThuDB.TonTaiTheoMaPhieuDoiSoat(maPDS);

    public static Task<PhieuThu?> LayTheoPhieuCoc(string maPhieuCoc) =>
        PhieuThuDB.LayTheoPhieuCoc(maPhieuCoc);

    public void KiemTraKhopTienCoc(PhieuCoc phieuCoc)
    {
        if (!string.Equals(MaPhieuCoc, phieuCoc.MaPhieuCoc, StringComparison.Ordinal))
            throw new InvalidOperationException("Phiếu thu không thuộc phiếu cọc cần đối soát.");
        if (SoTienThu <= 0)
            throw new InvalidOperationException("Phiếu thu tiền cọc không có số tiền hợp lệ.");
        if (SoTienThu != phieuCoc.TongTien)
            throw new InvalidOperationException("Số tiền thực thu không khớp tổng tiền trên phiếu cọc.");
    }

    // ==========================================================
    // Methods from develop branch
    // ==========================================================
    public static PhieuThu TaoChoTienCoc(PhieuCoc phieuCoc, string maNhanVien, DateTime thoiGian)
    {
        phieuCoc.KiemTraCoTheXacNhanThanhToan();
        if (string.IsNullOrWhiteSpace(maNhanVien))
            throw new ArgumentException("Không xác định được Quản lý xác nhận.", nameof(maNhanVien));

        return new PhieuThu
        {
            SoTienThu = phieuCoc.TongTien,
            ThoiGian = thoiGian,
            PhuongThucThanhToan = phieuCoc.PhuongThucThanhToan,
            AnhMinhChung = phieuCoc.AnhMinhChung,
            MaPhieuCoc = phieuCoc.MaPhieuCoc,
            MaNV = maNhanVien,
        };
    }

    public Task Them() => PhieuThuDB.Them(this);
}
