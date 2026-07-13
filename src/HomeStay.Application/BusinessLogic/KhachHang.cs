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

    public static Task<KhachHang?> TimTheoSoGiayTo(string soGiayTo) => KhachHangDB.TimTheoSoGiayTo(soGiayTo);

    public static string TaoMaMoi(DateTime thoiDiem) => $"KH{thoiDiem:yyyyMMddHHmmssfff}";

    public static void KiemTraThongTinBatBuoc(KhachHang kh)
    {
        if (string.IsNullOrWhiteSpace(kh.HoTen))
            throw new InvalidOperationException("Vui lòng nhập họ tên.");
        if (string.IsNullOrWhiteSpace(kh.SoGiayTo))
            throw new InvalidOperationException("Vui lòng nhập số giấy tờ.");
        if (string.IsNullOrWhiteSpace(kh.QuocTich))
            throw new InvalidOperationException("Vui lòng nhập quốc tịch.");
    }

    public static bool KiemTraDinhDangEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return true;
        return email.Contains('@') && email.Contains('.');
    }

    public static bool KiemTraSoGiayTo(string? soGiayTo, string? loaiGiayTo)
    {
        if (string.IsNullOrWhiteSpace(soGiayTo)) return false;
        return loaiGiayTo switch
        {
            "CCCD" => soGiayTo.Length == 12 && soGiayTo.All(char.IsDigit),
            "Hộ chiếu" => soGiayTo.Length >= 7 && soGiayTo.Length <= 15,
            _ => soGiayTo.Length >= 3,
        };
    }

    public static bool KiemTraNgaySinh(DateTime? ngaySinh)
    {
        if (ngaySinh is null) return false;
        var tuoi = DateTime.Today.Year - ngaySinh.Value.Year;
        return tuoi >= 6 && tuoi <= 120;
    }

    public static void KiemTraTrungSoGiayTo(KhachHang nguoiDaiDien, List<KhachHang>? cacThanhVien)
    {
        var dsSoGiayTo = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        if (nguoiDaiDien.SoGiayTo is not null && !dsSoGiayTo.Add(nguoiDaiDien.SoGiayTo))
            throw new InvalidOperationException("Số giấy tờ bị trùng.");
        if (cacThanhVien is null) return;
        foreach (var tv in cacThanhVien)
        {
            if (tv.SoGiayTo is not null && !dsSoGiayTo.Add(tv.SoGiayTo))
                throw new InvalidOperationException($"Số giấy tờ '{tv.SoGiayTo}' bị trùng giữa các thành viên.");
        }
    }

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

    public Task ThemMoi() => KhachHangDB.Them(this);
    public Task CapNhat() => KhachHangDB.CapNhat(this);
    public Task Them() => KhachHangDB.Them(this);
}