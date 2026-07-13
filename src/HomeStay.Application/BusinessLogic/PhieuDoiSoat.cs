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
    public string TrangThai { get; set; } = "DaChot";
    public string? GhiChu { get; set; }
    public string? MaHD { get; set; }
    public string? MaNV { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string? MaGiuong { get; set; }

    public List<HoaDon> HoaDons { get; set; } = [];

    public static PhieuDoiSoat TaoMoi(string maPhieuCoc, string? maHD, string? maNhanVien, DateTime thoiDiem)
    {
        return new PhieuDoiSoat
        {
            MaPDS = $"PDS{thoiDiem:yyyyMMddHHmmssfff}",
            NgayDoiSoat = thoiDiem.Date,
            MaPhieuCoc = maPhieuCoc,
            MaHD = maHD,
            MaNV = maNhanVien,
            TrangThai = "DaChot"
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

    public Task LuuPhieu() => PhieuDoiSoatDB.LuuPhieu(this);

    public static Task<IReadOnlyList<PhieuDoiSoat>> LayDSPhieuDoiSoatDaChot()
        => PhieuDoiSoatDB.GetDSPhieuDoiSoatDaChot();

    public static Task<IReadOnlyList<PhieuDoiSoat>> LayDSPhieuDoiSoatCanHoan()
        => PhieuDoiSoatDB.GetDSPhieuDoiSoatCanHoan();

    public static Task<PhieuDoiSoat?> LayChiTietPhieuDoiSoat(string maPDS)
        => PhieuDoiSoatDB.GetPhieuDoiSoatTheoMaPDS(maPDS);

    public static async Task<decimal> TinhToanKetQua(string maPDS)
    {
        var pds = await LayChiTietPhieuDoiSoat(maPDS);
        return pds?.TienThuThem ?? 0;
    }

    public static Task<bool> CapNhatTrangThai(string maPDS, string trangThai)
        => PhieuDoiSoatDB.UpdateTrangThai(maPDS, trangThai);
}
