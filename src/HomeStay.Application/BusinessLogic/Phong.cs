namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class Phong
{
    private readonly List<Giuong> _giuongsVuaGiu = [];
    private readonly List<Giuong> _giuongsVuaDatCoc = [];
    public string MaPhong { get; set; } = string.Empty;
    public string SoPhong { get; set; } = string.Empty;
    public string? ToaNha { get; set; }
    public string? Tang { get; set; }
    public string? GioiTinhChoPhep { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string MaLP { get; set; } = string.Empty;
    public string MaCN { get; set; } = string.Empty;
    public LoaiPhong LoaiPhong { get; set; } = new();
    public List<Giuong> Giuongs { get; set; } = [];
    public int SoGiuongTrong => Giuongs.Count(g => g.TrangThai == "Trong");
    public IReadOnlyList<Giuong> GiuongsVuaGiu => _giuongsVuaGiu;
    public IReadOnlyList<Giuong> GiuongsVuaDatCoc => _giuongsVuaDatCoc;

    public static Task<IReadOnlyList<Phong>> LayPhongOGhep(int soLuong, string? toaNha,
        string? loaiPhong, decimal giaMin, decimal giaMax) =>
        PhongDB.LayPhongOGhep(soLuong, toaNha, loaiPhong, giaMin, giaMax);

    public static Task<IReadOnlyList<Phong>> LayPhongNguyenCan(string? toaNha, string? loaiPhong,
        decimal giaMin, decimal giaMax) =>
        PhongDB.LayPhongNguyenCan(toaNha, loaiPhong, giaMin, giaMax);

    public static Task<Phong?> DocChiTiet(string maPhong) => PhongDB.DocChiTiet(maPhong);

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
        if (GioiTinhChoPhep == "Nu" && dsKhach.Any(k => k.GioiTinh != "Nu")) return false;
        return true;
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
}
