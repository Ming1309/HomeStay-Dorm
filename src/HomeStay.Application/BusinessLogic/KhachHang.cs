namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class KhachHang
{
    public string MaKH { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public DateTime? NgaySinh { get; set; }
    public string? GioiTinh { get; set; }
    public string? QuocTich { get; set; }
    public string? LoaiGiayTo { get; set; }
    public string? SoGiayTo { get; set; }
    public string? DiaChiThuongTru { get; set; }
    public string? SDT { get; set; }
    public string? Email { get; set; }

    public bool CapNhatTu(KhachHang thongTinMoi)
    {
        var hoTen = thongTinMoi.HoTen.Trim();
        var daThayDoi = HoTen != hoTen ||
            NgaySinh != thongTinMoi.NgaySinh ||
            GioiTinh != thongTinMoi.GioiTinh ||
            QuocTich != thongTinMoi.QuocTich ||
            LoaiGiayTo != thongTinMoi.LoaiGiayTo ||
            SoGiayTo != thongTinMoi.SoGiayTo ||
            SDT != thongTinMoi.SDT ||
            Email != thongTinMoi.Email;
        if (!daThayDoi) return false;

        HoTen = hoTen;
        NgaySinh = thongTinMoi.NgaySinh;
        GioiTinh = thongTinMoi.GioiTinh;
        QuocTich = thongTinMoi.QuocTich;
        LoaiGiayTo = thongTinMoi.LoaiGiayTo;
        SoGiayTo = thongTinMoi.SoGiayTo;
        SDT = thongTinMoi.SDT;
        Email = thongTinMoi.Email;
        return true;
    }

    public Task CapNhat() => KhachHangDB.CapNhat(this);

    public static Task<KhachHang?> LayThongTinKhachHang(string maKH) =>
        KhachHangDB.GetKhachHangTheoMaKH(maKH);
}
