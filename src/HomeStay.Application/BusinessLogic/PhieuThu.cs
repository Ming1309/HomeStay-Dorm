namespace HomeStay.Application.BusinessLogic;

using System;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DBs;

public sealed class PhieuThu
{
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
        if (soTien <= 0)
            throw new ArgumentException("Số tiền thu phải lớn hơn 0.");

        return new PhieuThu
        {
            MaPT = $"PT{thoiDiem:yyyyMMddHHmmssfff}",
            SoTienThu = soTien,
            ThoiGian = thoiDiem,
            PhuongThucThanhToan = phuongThuc,
            AnhMinhChung = anhMinhChung,
            MaPDS = maPDS,
            MaNV = maNV
        };
    }

    public Task LuuPhieu() => PhieuThuDB.InsertPhieuThu(this);

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
            MaPT = $"PT{thoiGian:yyyyMMddHHmmssfff}",
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