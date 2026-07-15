namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public static class LoaiSuKienThongBao
{
    public const string PhieuCocChoTinhTien = "PhieuCocChoTinhTien";
    public const string PhieuCocChoThanhToan = "PhieuCocChoThanhToan";
    public const string ChungTuCocChoDoiChieu = "ChungTuCocChoDoiChieu";
    public const string ChungTuCocCanBoSung = "ChungTuCocCanBoSung";
    public const string TienCocDaXacNhan = "TienCocDaXacNhan";
    public const string HoSoLuuTruChoDuyet = "HoSoLuuTruChoDuyet";
    public const string HoSoLuuTruDaDuyet = "HoSoLuuTruDaDuyet";
    public const string HoSoLuuTruBiTuChoi = "HoSoLuuTruBiTuChoi";
    public const string HopDongChoThanhToan = "HopDongChoThanhToan";
    public const string HopDongChoBanGiao = "HopDongChoBanGiao";
    public const string LichNhanPhong = "LichNhanPhong";
    public const string LichTraPhong = "LichTraPhong";
    public const string LichTraPhongBiHuy = "LichTraPhongBiHuy";
    public const string PhieuCocTuDongHuy = "PhieuCocTuDongHuy";
    public const string PhieuCocHuyChoDoiSoat = "PhieuCocHuyChoDoiSoat";
    public const string BienBanThuHoiChoBoiThuong = "BienBanThuHoiChoBoiThuong";
    public const string BienBanThuHoiChoDoiSoat = "BienBanThuHoiChoDoiSoat";
    public const string PhieuDoiSoatChoXacNhan = "PhieuDoiSoatChoXacNhan";
    public const string PhieuDoiSoatChoThuThem = "PhieuDoiSoatChoThuThem";
    public const string PhieuDoiSoatChoHoan = "PhieuDoiSoatChoHoan";
    public const string HopDongChoThanhLy = "HopDongChoThanhLy";
    public const string HoanCocDaHoanTat = "HoanCocDaHoanTat";
}

public sealed class ThongBao
{
    public string MaTB { get; set; } = string.Empty;
    public string LoaiSuKien { get; set; } = string.Empty;
    public string LoaiThongBao { get; set; } = string.Empty;
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string MaCN { get; set; } = string.Empty;
    public string VaiTroNhan { get; set; } = string.Empty;
    public string? MaNVNhan { get; set; }
    public string? LienKet { get; set; }
    public string Tone { get; set; } = "blue";
    public string TrangThai { get; set; } = "ThongTin";
    public string KhoaChongTrung { get; set; } = string.Empty;
    public DateTime ThoiGianTao { get; set; }
    public string? MaNVGui { get; set; }
    public string? MaThamChieu { get; set; }
    public string? MaNVXuLy { get; set; }
    public DateTime? ThoiGianXuLy { get; set; }
    public string? TenNguoiXuLy { get; set; }
    public bool DaDoc { get; set; }

    public static ThongBao Tao(
        string loaiSuKien,
        string loaiThongBao,
        string tieuDe,
        string noiDung,
        string maCN,
        string vaiTroNhan,
        string? maNVNhan,
        string? lienKet,
        string tone,
        string khoaChongTrung,
        string? maNVGui,
        string? maThamChieu,
        DateTime thoiGianTao)
    {
        if (string.IsNullOrWhiteSpace(loaiSuKien))
            throw new ArgumentException("Loại sự kiện thông báo không được để trống.");
        if (loaiThongBao is not ("CanXuLy" or "ThongTin" or "CanhBao"))
            throw new ArgumentException("Loại thông báo không hợp lệ.");
        if (string.IsNullOrWhiteSpace(tieuDe) || string.IsNullOrWhiteSpace(noiDung))
            throw new ArgumentException("Tiêu đề và nội dung thông báo không được để trống.");
        if (string.IsNullOrWhiteSpace(maCN) || string.IsNullOrWhiteSpace(vaiTroNhan))
            throw new ArgumentException("Thông báo phải xác định chi nhánh và vai trò nhận.");
        if (tone is not ("blue" or "green" or "orange" or "red"))
            throw new ArgumentException("Màu thông báo không hợp lệ.");
        if (string.IsNullOrWhiteSpace(khoaChongTrung))
            throw new ArgumentException("Thông báo phải có khóa chống trùng.");

        return new ThongBao
        {
            MaTB = $"TB{Guid.NewGuid():N}",
            LoaiSuKien = loaiSuKien.Trim(),
            LoaiThongBao = loaiThongBao,
            TieuDe = tieuDe.Trim(),
            NoiDung = noiDung.Trim(),
            MaCN = maCN.Trim(),
            VaiTroNhan = vaiTroNhan.Trim(),
            MaNVNhan = string.IsNullOrWhiteSpace(maNVNhan) ? null : maNVNhan.Trim(),
            LienKet = string.IsNullOrWhiteSpace(lienKet) ? null : lienKet.Trim(),
            Tone = string.IsNullOrWhiteSpace(tone) ? "blue" : tone.Trim(),
            TrangThai = loaiThongBao == "CanXuLy" ? "DangMo" : "ThongTin",
            KhoaChongTrung = khoaChongTrung.Trim(),
            ThoiGianTao = thoiGianTao,
            MaNVGui = string.IsNullOrWhiteSpace(maNVGui) ? null : maNVGui.Trim(),
            MaThamChieu = string.IsNullOrWhiteSpace(maThamChieu) ? null : maThamChieu.Trim(),
        };
    }

    public Task Luu(bool capNhatNeuTonTai = false) => ThongBaoDB.Them(this, capNhatNeuTonTai);

    public static Task<IReadOnlyList<ThongBao>> LayCuaNhanVien(
        NhanVien nhanVien, string boLoc, int soLuong, DateTime? truocThoiDiem, string? truocMaTB) =>
        ThongBaoDB.LayCuaNhanVien(nhanVien, boLoc, soLuong, truocThoiDiem, truocMaTB);

    public static Task<int> DemChuaDoc(NhanVien nhanVien) => ThongBaoDB.DemChuaDoc(nhanVien);

    public static Task<bool> DanhDauDaDoc(string maTB, NhanVien nhanVien, DateTime thoiGianDoc) =>
        ThongBaoDB.DanhDauDaDoc(maTB, nhanVien, thoiGianDoc);

    public static Task DanhDauTatCaDaDoc(NhanVien nhanVien, DateTime thoiGianDoc) =>
        ThongBaoDB.DanhDauTatCaDaDoc(nhanVien, thoiGianDoc);

    public static Task DongTacVu(
        string loaiSuKien, string maThamChieu, string? maNVXuLy, DateTime thoiGianXuLy, string trangThai = "DaXuLy") =>
        ThongBaoDB.DongTacVu(loaiSuKien, maThamChieu, maNVXuLy, thoiGianXuLy, trangThai);
}
