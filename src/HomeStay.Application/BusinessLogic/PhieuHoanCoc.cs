using System;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DBs;

namespace HomeStay.Application.BusinessLogic;

public sealed class PhieuHoanCoc
{
    public string MaPHC { get; set; } = string.Empty;
    public decimal SoTienHoan { get; set; }
    public string? PhuongThucHoan { get; set; }
    public string? ThongTinNhanTien { get; set; }
    public DateTime ThoiGian { get; set; }
    public string MaPDS { get; set; } = string.Empty;
    public string? MaNV { get; set; }

    public static PhieuHoanCoc TaoMoi(string maPHC, string maPDS, decimal soTien, string phuongThuc, string? thongTinNhanTien, string maNV, DateTime thoiDiem)
    {
        if (string.IsNullOrWhiteSpace(maPHC))
            throw new ArgumentException("Mã phiếu hoàn cọc không được để trống.", nameof(maPHC));
        if (string.IsNullOrWhiteSpace(maPDS))
            throw new ArgumentException("Mã phiếu đối soát không được để trống.", nameof(maPDS));
        if (soTien <= 0)
            throw new ArgumentException("Số tiền hoàn cọc phải lớn hơn 0.");
        if (phuongThuc is not ("TienMat" or "ChuyenKhoan"))
            throw new ArgumentException("Phương thức hoàn cọc không hợp lệ.", nameof(phuongThuc));
        if (phuongThuc == "ChuyenKhoan" && string.IsNullOrWhiteSpace(thongTinNhanTien))
            throw new ArgumentException("Chuyển khoản phải có thông tin nhận tiền.", nameof(thongTinNhanTien));
        if (string.IsNullOrWhiteSpace(maNV))
            throw new ArgumentException("Không xác định được Kế toán thực hiện.", nameof(maNV));

        return new PhieuHoanCoc
        {
            MaPHC = maPHC,
            SoTienHoan = soTien,
            PhuongThucHoan = phuongThuc,
            ThongTinNhanTien = thongTinNhanTien,
            ThoiGian = thoiDiem,
            MaPDS = maPDS,
            MaNV = maNV
        };
    }

    public Task LuuPhieu() => PhieuHoanCocDB.InsertPhieuHoanCoc(this);

    public static Task<bool> DaTonTaiChoPhieuDoiSoat(string maPDS) =>
        PhieuHoanCocDB.TonTaiTheoMaPhieuDoiSoat(maPDS);

    public static Task<PhieuHoanCoc?> LayThongTinPhieuHoanCoc(string maPHC) =>
        PhieuHoanCocDB.GetPhieuHoanCocTheoMaPHC(maPHC);
}
