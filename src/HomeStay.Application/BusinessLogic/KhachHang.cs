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

    public static Task<List<KhachHang>> LayDanhSachKhachTheoPhieuCoc(string maPhieuCoc) =>
        KhachHangDB.GetByMaPhieuCoc(maPhieuCoc);

    public static Task<KhachHang?> LayThongTinKhachHang(string maKH) =>
        KhachHangDB.GetByMaKH(maKH);

    public bool KiemTraThongTinBatBuoc()
    {
        if (string.IsNullOrWhiteSpace(HoTen)) return false;
        if (string.IsNullOrWhiteSpace(SDT)) return false;
        return true;
    }

    public bool KiemTraGiayToHopLe()
    {
        if (string.IsNullOrWhiteSpace(LoaiGiayTo)) return false;
        if (string.IsNullOrWhiteSpace(SoGiayTo)) return false;
        if (LoaiGiayTo is not ("CCCD" or "Hộ chiếu" or "CMND")) return false;
        return true;
    }

    public bool KiemTraDieuKienLuuTru()
    {
        if (!KiemTraThongTinBatBuoc()) return false;
        if (!KiemTraGiayToHopLe()) return false;
        return true;
    }

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
    public Task Them() => KhachHangDB.Them(this);
}
