using System;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DBs;

namespace HomeStay.Application.BusinessLogic;

public sealed class PhieuHoanCoc
{
    public static Task<bool> ThamChieuChungTu(string tenTep) => PhieuHoanCocDB.ThamChieuChungTu(tenTep);
    public string MaPHC { get; set; } = string.Empty;
    public decimal SoTienHoan { get; set; }
    public string? PhuongThucHoan { get; set; }
    public string? ThongTinNhanTien { get; set; }
    public string? MaGiaoDich { get; set; }
    public string? MinhChung { get; set; }
    public DateTime ThoiGian { get; set; }
    public string MaPDS { get; set; } = string.Empty;
    public string? MaNV { get; set; }

    public static PhieuHoanCoc TaoPhieuHoanCoc(string maPDS, decimal soTien, string phuongThuc,
        string thongTinNhanTien, string? maGiaoDich, string minhChung, string maNV, DateTime thoiDiem)
    {
        var maPhieuDoiSoat = maPDS?.Trim() ?? string.Empty;
        var phuongThucHoan = phuongThuc?.Trim() ?? string.Empty;
        var thongTin = thongTinNhanTien?.Trim() ?? string.Empty;
        var maNhanVien = maNV?.Trim() ?? string.Empty;
        var giaoDich = maGiaoDich?.Trim();

        if (maPhieuDoiSoat.Length == 0)
            throw new ArgumentException("Mã phiếu đối soát không được để trống.", nameof(maPDS));
        if (soTien <= 0)
            throw new ArgumentException("Số tiền hoàn cọc phải lớn hơn 0.");
        if (phuongThucHoan is not ("TienMat" or "ChuyenKhoan"))
            throw new ArgumentException("Phương thức hoàn cọc không hợp lệ.", nameof(phuongThuc));
        if (phuongThucHoan == "ChuyenKhoan" && thongTin.Length == 0)
            throw new ArgumentException("Chuyển khoản phải có thông tin nhận tiền.", nameof(thongTinNhanTien));
        if (phuongThucHoan == "TienMat" && thongTin.Length == 0)
            throw new ArgumentException("Tiền mặt phải có thông tin người nhận tiền.", nameof(thongTinNhanTien));
        if (phuongThucHoan == "ChuyenKhoan" && string.IsNullOrWhiteSpace(giaoDich))
            throw new ArgumentException("Chuyển khoản phải có mã giao dịch.", nameof(maGiaoDich));
        if (giaoDich?.Length > 100)
            throw new ArgumentException("Mã giao dịch không được vượt quá 100 ký tự.", nameof(maGiaoDich));
        if (string.IsNullOrWhiteSpace(minhChung))
            throw new ArgumentException("Phải có chứng từ xác nhận khách hàng đã nhận tiền.", nameof(minhChung));
        if (thongTin.Length > 300)
            throw new ArgumentException("Thông tin nhận tiền không được vượt quá 300 ký tự.", nameof(thongTinNhanTien));
        if (maNhanVien.Length == 0)
            throw new ArgumentException("Không xác định được Kế toán thực hiện.", nameof(maNV));

        return new PhieuHoanCoc
        {
            SoTienHoan = soTien,
            PhuongThucHoan = phuongThucHoan,
            ThongTinNhanTien = thongTin,
            MaGiaoDich = giaoDich,
            MinhChung = minhChung,
            ThoiGian = thoiDiem,
            MaPDS = maPhieuDoiSoat,
            MaNV = maNhanVien
        };
    }

    public Task LuuPhieu() => PhieuHoanCocDB.InsertPhieuHoanCoc(this);

    public static Task<bool> DaTonTaiChoPhieuDoiSoat(string maPDS) =>
        PhieuHoanCocDB.TonTaiTheoMaPhieuDoiSoat(maPDS);

    public static Task<PhieuHoanCoc?> LayThongTinPhieuHoanCoc(string maPHC) =>
        PhieuHoanCocDB.GetPhieuHoanCocTheoMaPHC(maPHC);
}
