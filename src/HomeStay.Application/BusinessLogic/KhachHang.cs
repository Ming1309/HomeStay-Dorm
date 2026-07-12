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

    public static KhachHang TaoMoi(string hoTen, string? gioiTinh, string? sdt, string? email,
        string? diaChiThuongTru, string? loaiGiayTo, string? soGiayTo, DateTime thoiDiem) =>
        new()
        {
            MaKH = $"KH{thoiDiem:yyyyMMddHHmmssfff}",
            HoTen = hoTen.Trim(),
            GioiTinh = gioiTinh,
            SDT = sdt,
            Email = email,
            DiaChiThuongTru = diaChiThuongTru,
            LoaiGiayTo = loaiGiayTo,
            SoGiayTo = soGiayTo
        };

    public static Task<KhachHang?> KiemTraTonTai(string soGiayTo) =>
        KhachHangDB.TimTheoSoGiayTo(soGiayTo);

    public void CapNhatTu(KhachHang thongTinMoi)
    {
        HoTen = thongTinMoi.HoTen.Trim();
        NgaySinh = thongTinMoi.NgaySinh;
        GioiTinh = thongTinMoi.GioiTinh;
        QuocTich = thongTinMoi.QuocTich;
        LoaiGiayTo = thongTinMoi.LoaiGiayTo;
        SoGiayTo = thongTinMoi.SoGiayTo;
        DiaChiThuongTru = thongTinMoi.DiaChiThuongTru;
        SDT = thongTinMoi.SDT;
        Email = thongTinMoi.Email;
    }

    public Task CapNhat() => KhachHangDB.CapNhat(this);
    public Task Them() => KhachHangDB.Them(this);
}
