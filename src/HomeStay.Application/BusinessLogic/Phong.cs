namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class Phong
{
    public static readonly IReadOnlyList<string> TrangThaiHopLe =
        ["Trong", "ConGiuongTrong", "GiuCho", "DaCoc", "DangSuDung", "DangBaoTri", "NgungSuDung"];

    // Trang thai coi la "dang su dung" -> chan xoa phong.
    public static readonly IReadOnlyList<string> TrangThaiDangSuDung =
        ["GiuCho", "DaCoc", "DangSuDung"];

    private readonly List<Giuong> _giuongsVuaGiu = [];
    private readonly List<Giuong> _giuongsVuaDatCoc = [];
    private readonly List<Giuong> _giuongsVuaGiaiPhong = [];
    public string MaPhong { get; set; } = string.Empty;
    public string SoPhong { get; set; } = string.Empty;
    public string? ToaNha { get; set; }
    public string? Tang { get; set; }
    public string? GioiTinhChoPhep { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string MaLP { get; set; } = string.Empty;
    public string MaCN { get; set; } = string.Empty;
    public string? TenChiNhanh { get; set; }
    public LoaiPhong LoaiPhong { get; set; } = new();
    public List<Giuong> Giuongs { get; set; } = [];
    public int SoGiuongTrong => Giuongs.Count(g => g.TrangThai == "Trong");
    public IReadOnlyList<Giuong> GiuongsVuaGiu => _giuongsVuaGiu;
    public IReadOnlyList<Giuong> GiuongsVuaDatCoc => _giuongsVuaDatCoc;
    public IReadOnlyList<Giuong> GiuongsVuaGiaiPhong => _giuongsVuaGiaiPhong;

    public static Task<IReadOnlyList<Phong>> LayPhongOGhep(int soLuong, string? toaNha,
        string? loaiPhong, decimal giaMin, decimal giaMax) =>
        PhongDB.LayPhongOGhep(soLuong, toaNha, loaiPhong, giaMin, giaMax);

    public static Task<IReadOnlyList<Phong>> LayPhongNguyenCan(string? toaNha, string? loaiPhong,
        decimal giaMin, decimal giaMax) =>
        PhongDB.LayPhongNguyenCan(toaNha, loaiPhong, giaMin, giaMax);

    public static Task<IReadOnlyList<Phong>> LocPhongTheoTieuChi(string? toaNha, string? tang,
        string? maLP, string? maCN, string? trangThai, decimal giaMin, decimal giaMax) =>
        PhongDB.LayPhongTheoBoLoc(toaNha, tang, maLP, maCN, trangThai, giaMin, giaMax);

    public static Task<Phong?> DocChiTiet(string maPhong) => PhongDB.DocChiTiet(maPhong);

    public static Task<IReadOnlyList<PhongTaiSan>> LayTaiSan(string maPhong) =>
        PhongTaiSan.LayTaiSanTheoPhong(maPhong);

    // ---- UC 1.4.25: Quan ly phong (QuanTri) ----

    public static Task<IReadOnlyList<Phong>> LayDanhSachQuanTri(string? text, string? maCN,
        string? toaNha, string? trangThai) =>
        PhongDB.LayDanhSachQuanTri(text, maCN, toaNha, trangThai);

    public static Task<bool> TrungSoPhong(string maCN, string soPhong, string? maPhongBoQua) =>
        PhongDB.TrungSoPhong(maCN, soPhong, maPhongBoQua);

    public static Task<bool> DangDuocThamChieu(string maPhong) => PhongDB.DangDuocThamChieu(maPhong);


    // Do dai toi da theo schema (01_InitTables.sql).
    private const int MaxSoPhong = 20;
    private const int MaxToaNha = 50;
    private const int MaxTang = 10;
    private const int MaxGioiTinh = 20;
    private const int MaxMa = 20;

    // Chuan hoa chuoi truoc khi kiem tra/luu: trim va chuyen rong -> null cho cot tuy chon.
    public void ChuanHoa()
    {
        SoPhong = SoPhong?.Trim() ?? string.Empty;
        TrangThai = TrangThai?.Trim() ?? string.Empty;
        MaLP = MaLP?.Trim() ?? string.Empty;
        MaCN = MaCN?.Trim() ?? string.Empty;
        ToaNha = ChuanHoaTuyChon(ToaNha);
        Tang = ChuanHoaTuyChon(Tang);
        GioiTinhChoPhep = ChuanHoaTuyChon(GioiTinhChoPhep);
    }

    public void KiemTraDuLieuHopLe()
    {
        if (string.IsNullOrWhiteSpace(SoPhong))
            throw new ArgumentException("Số phòng không được để trống.");
        if (string.IsNullOrWhiteSpace(MaLP))
            throw new ArgumentException("Loại phòng không được để trống.");
        if (string.IsNullOrWhiteSpace(MaCN))
            throw new ArgumentException("Chi nhánh không được để trống.");
        if (!TrangThaiHopLe.Contains(TrangThai))
            throw new ArgumentException("Trạng thái phòng không hợp lệ.");
        KiemTraDoDai(SoPhong, MaxSoPhong, "Số phòng");
        KiemTraDoDai(ToaNha, MaxToaNha, "Tòa nhà");
        KiemTraDoDai(Tang, MaxTang, "Tầng");
        KiemTraDoDai(GioiTinhChoPhep, MaxGioiTinh, "Giới tính cho phép");
        KiemTraDoDai(MaLP, MaxMa, "Mã loại phòng");
        KiemTraDoDai(MaCN, MaxMa, "Mã chi nhánh");
    }

    public void KiemTraCoTheXoa()
    {
        if (TrangThaiDangSuDung.Contains(TrangThai))
            throw new InvalidOperationException(
                "Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.");
    }

    public void KiemTraSoGiuongKhongVuotSucChua(int soGiuongHienCo)
    {
        if (LoaiPhong.SucChua > 0 && soGiuongHienCo >= LoaiPhong.SucChua)
            throw new InvalidOperationException(
                $"Số giường ({soGiuongHienCo}) đã đạt sức chứa của loại phòng ({LoaiPhong.SucChua}).");
    }

    // Khi doi loai phong, suc chua moi khong duoc nho hon so giuong hien co cua phong.
    public void KiemTraSucChuaChoDoiLoaiPhong(int sucChuaMoi, int soGiuongHienCo)
    {
        if (sucChuaMoi > 0 && soGiuongHienCo > sucChuaMoi)
            throw new InvalidOperationException(
                $"Loại phòng mới có sức chứa ({sucChuaMoi}) nhỏ hơn số giường hiện có ({soGiuongHienCo}).");
    }

    // Chan doi trang thai mau thuan voi coc/hop dong dang hieu luc hoac giuong dang su dung.
    public void KiemTraDoiTrangThai(string trangThaiMoi, IReadOnlyList<Giuong> giuongHienCo,
        bool dangDuocThamChieu)
    {
        var khongConSuDung = trangThaiMoi is "Trong" or "DangBaoTri" or "NgungSuDung";
        var coGiuongDangDung = giuongHienCo.Any(g => TrangThaiDangSuDung.Contains(g.TrangThai));
        if (khongConSuDung && (dangDuocThamChieu || coGiuongDangDung))
            throw new InvalidOperationException(
                "Không thể đổi trạng thái phòng đang được sử dụng hoặc đã có đặt cọc.");
    }

    private static string? ChuanHoaTuyChon(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return null;
        return value.Trim();
    }

    private static void KiemTraDoDai(string? value, int max, string ten)
    {
        if (value is not null && value.Length > max)
            throw new ArgumentException($"{ten} vượt quá {max} ký tự cho phép.");
    }

    public Task Them() => PhongDB.Them(this);

    public Task CapNhatThongTin() => PhongDB.CapNhatThongTin(this);

    public Task Xoa() => PhongDB.Xoa(MaPhong);

    public IReadOnlyList<Giuong> GiuGiuong(IEnumerable<string> maGiuongs)
    {
        var ids = maGiuongs.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray();
        if (ids.Length == 0) throw new InvalidOperationException("Phải chọn ít nhất một giường.");
        var selected = Giuongs.Where(g => ids.Contains(g.MaGiuong)).ToList();
        if (selected.Count != ids.Length) throw new InvalidOperationException("Có giường không thuộc phòng đã chọn.");
        foreach (var giuong in selected) giuong.GiuCho(MaPhong);
        _giuongsVuaGiu.AddRange(selected);
        CapNhatTrangThaiTheoGiuong();
        return selected;
    }

    public IReadOnlyList<Giuong> GiuNguyenPhong()
    {
        if (TrangThai != "Trong" || Giuongs.Count == 0 || Giuongs.Any(g => g.TrangThai != "Trong"))
            throw new InvalidOperationException("Phòng không còn trống để thuê nguyên phòng.");
        foreach (var giuong in Giuongs) giuong.GiuCho(MaPhong);
        _giuongsVuaGiu.AddRange(Giuongs);
        TrangThai = "GiuCho";
        return Giuongs;
    }

    public void KiemTraSucChua(int soLuongNguoi)
    {
        if (LoaiPhong.SucChua <= 0)
            throw new InvalidOperationException("Phòng chưa có sức chứa hợp lệ.");
        if (soLuongNguoi > LoaiPhong.SucChua)
            throw new InvalidOperationException(
                $"Số người ({soLuongNguoi}) vượt quá sức chứa phòng ({LoaiPhong.SucChua}).");
    }

    public void KiemTraTrangThaiPhong()
    {
        if (TrangThai is not ("Trong" or "ConGiuongTrong" or "DaCoc" or "DangSuDung"))
            throw new InvalidOperationException("Phòng không ở trạng thái khả dụng.");
    }

    public decimal TinhTienCoc(int soGiuong) =>
        soGiuong > 0 ? LoaiPhong.GiaThue * 2 * soGiuong : throw new InvalidOperationException("Số giường thuê không hợp lệ.");

    public void XacNhanDatCoc(IEnumerable<string> maGiuongs)
    {
        var ids = maGiuongs.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray();
        if (ids.Length == 0) throw new InvalidOperationException("Phiếu cọc chưa có giường cần xác nhận.");
        var selected = Giuongs.Where(g => ids.Contains(g.MaGiuong)).ToList();
        if (selected.Count != ids.Length)
            throw new InvalidOperationException("Có giường của phiếu cọc không thuộc phòng đã chọn.");

        foreach (var giuong in selected) giuong.XacNhanDaCoc(MaPhong);
        _giuongsVuaDatCoc.AddRange(selected);
        CapNhatTrangThaiSauDatCoc();
    }

    public bool KiemTraSucChua(int soLuongThanhVien, int soGiuongThue, int sucChuaPhong, string hinhThucThue)
    {
        if (soLuongThanhVien > soGiuongThue) return false;
        if (hinhThucThue == "NguyenCan" && soLuongThanhVien > sucChuaPhong) return false;
        return true;
    }

    public bool KiemTraGioiTinhChoPhep(IReadOnlyList<KhachHang> dsKhach)
    {
        if (string.IsNullOrWhiteSpace(GioiTinhChoPhep)) return true;
        if (GioiTinhChoPhep == "Nam" && dsKhach.Any(k => k.GioiTinh != "Nam")) return false;
        if (GioiTinhChoPhep is "Nữ" or "Nu"
            && dsKhach.Any(k => k.GioiTinh is not ("Nữ" or "Nu"))) return false;
        return true;
    }

    public void GiaiPhongDatCoc(IEnumerable<string> maGiuongs)
    {
        var ids = maGiuongs.Where(x => !string.IsNullOrWhiteSpace(x)).Distinct().ToArray();
        if (ids.Length == 0) throw new InvalidOperationException("Phiếu cọc không có giường cần giải phóng.");
        var selected = Giuongs.Where(g => ids.Contains(g.MaGiuong)).ToList();
        if (selected.Count != ids.Length)
            throw new InvalidOperationException("Có giường của phiếu cọc không thuộc phòng đã chọn.");

        foreach (var giuong in selected) giuong.GiaiPhong(MaPhong);
        _giuongsVuaGiaiPhong.AddRange(selected);
        TrangThai = Giuongs.All(g => g.TrangThai == "Trong") ? "Trong" : "ConGiuongTrong";
    }

    public bool PhuHopYeuCau(string? toaNha, string? loaiPhong, decimal giaMin, decimal giaMax) =>
        (string.IsNullOrWhiteSpace(toaNha) || ToaNha == toaNha) &&
        (string.IsNullOrWhiteSpace(loaiPhong) || MaLP == loaiPhong
            || LoaiPhong.TenLoaiPhong == loaiPhong
            || (int.TryParse(loaiPhong, out var sucChua) && LoaiPhong.SucChua == sucChua)) &&
        (giaMin <= 0 || LoaiPhong.GiaThue >= giaMin) &&
        (giaMax <= 0 || LoaiPhong.GiaThue <= giaMax);

    private void CapNhatTrangThaiTheoGiuong() =>
        TrangThai = Giuongs.Any(g => g.TrangThai == "Trong") ? "ConGiuongTrong" : "GiuCho";

    private void CapNhatTrangThaiSauDatCoc()
    {
        if (Giuongs.All(g => g.TrangThai == "DaCoc")) TrangThai = "DaCoc";
        else if (Giuongs.Any(g => g.TrangThai == "Trong")) TrangThai = "ConGiuongTrong";
        else if (Giuongs.Any(g => g.TrangThai == "GiuCho")) TrangThai = "GiuCho";
    }

    public Task CapNhat() => PhongDB.CapNhat(this);

    public Task CapNhatDatCoc() => PhongDB.CapNhatDatCoc(this);

    public Task CapNhatGiaiPhongDatCoc() => PhongDB.CapNhatGiaiPhongDatCoc(this);
}
