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

    public static PhieuHoanCoc TaoPhieuHoanCoc(string maPDS, decimal soTien, string phuongThuc, string thongTinNhanTien, string maNV, DateTime thoiDiem)
    {
        if (soTien <= 0)
            throw new ArgumentException("Số tiền hoàn cọc phải lớn hơn 0.");

        return new PhieuHoanCoc
        {
            MaPHC = $"PHC{thoiDiem:yyyyMMddHHmmssfff}",
            SoTienHoan = soTien,
            PhuongThucHoan = phuongThuc,
            ThongTinNhanTien = thongTinNhanTien,
            ThoiGian = thoiDiem,
            MaPDS = maPDS,
            MaNV = maNV
        };
    }

    public Task LuuPhieu() => PhieuHoanCocDB.InsertPhieuHoanCoc(this);

    public static Task<PhieuHoanCoc?> LayThongTinPhieuHoanCoc(string maPHC) =>
        PhieuHoanCocDB.GetPhieuHoanCocTheoMaPHC(maPHC);
}
