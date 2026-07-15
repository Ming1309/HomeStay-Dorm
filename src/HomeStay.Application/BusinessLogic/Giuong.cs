namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class Giuong
{
    public static readonly IReadOnlyList<string> TrangThaiHopLe =
        ["Trong", "GiuCho", "DaCoc", "DangSuDung", "DangBaoTri", "NgungSuDung"];

    // Trang thai coi la "dang su dung" -> chan xoa.
    public static readonly IReadOnlyList<string> TrangThaiDangSuDung =
        ["GiuCho", "DaCoc", "DangSuDung"];

    public string MaGiuong { get; set; } = string.Empty;
    public string SoGiuong { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public string MaPhong { get; set; } = string.Empty;
    // Thong tin phong hien thi (chi dung cho man hinh quan tri).
    public string SoPhong { get; set; } = string.Empty;
    public string? ToaNha { get; set; }

    // Do dai toi da theo schema (01_InitTables.sql).
    private const int MaxSoGiuong = 20;
    private const int MaxMa = 20;

    public void ChuanHoa()
    {
        SoGiuong = SoGiuong?.Trim() ?? string.Empty;
        TrangThai = TrangThai?.Trim() ?? string.Empty;
        MaPhong = MaPhong?.Trim() ?? string.Empty;
    }

    public void KiemTraDuLieuHopLe()
    {
        if (string.IsNullOrWhiteSpace(SoGiuong))
            throw new ArgumentException("Số giường không được để trống.");
        if (string.IsNullOrWhiteSpace(MaPhong))
            throw new ArgumentException("Giường phải thuộc một phòng.");
        if (!TrangThaiHopLe.Contains(TrangThai))
            throw new ArgumentException("Trạng thái giường không hợp lệ.");
        if (SoGiuong.Length > MaxSoGiuong)
            throw new ArgumentException($"Số giường vượt quá {MaxSoGiuong} ký tự cho phép.");
        if (MaPhong.Length > MaxMa)
            throw new ArgumentException($"Mã phòng vượt quá {MaxMa} ký tự cho phép.");
    }

    public void KiemTraCoTheXoa()
    {
        if (TrangThaiDangSuDung.Contains(TrangThai))
            throw new InvalidOperationException(
                "Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.");
    }

    // Chi giuong dang trong (khong bi tham chieu) moi duoc chuyen sang phong khac.
    public void KiemTraCoTheChuyenPhong(bool dangDuocThamChieu)
    {
        if (TrangThaiDangSuDung.Contains(TrangThai) || dangDuocThamChieu)
            throw new InvalidOperationException(
                "Không thể xóa phòng/giường đang được sử dụng hoặc đã có đặt cọc.");
    }

    // So giuong la thong tin nhan dien tren hop dong/chung tu, khong duoc doi khi da su dung.
    public void KiemTraCoTheDoiSoGiuong(bool dangDuocThamChieu)
    {
        if (TrangThaiDangSuDung.Contains(TrangThai) || dangDuocThamChieu)
            throw new InvalidOperationException(
                "Không thể đổi số giường đang được sử dụng hoặc đã được tham chiếu.");
    }

    // Chan doi trang thai giuong mau thuan voi tham chieu dang hieu luc.
    public void KiemTraDoiTrangThai(string trangThaiMoi, bool dangDuocThamChieu)
    {
        var khongConSuDung = trangThaiMoi is "Trong" or "DangBaoTri" or "NgungSuDung";
        if (khongConSuDung && dangDuocThamChieu)
            throw new InvalidOperationException(
                "Không thể đổi trạng thái giường đang được sử dụng hoặc đã có đặt cọc.");
    }

    public static Task<IReadOnlyList<Giuong>> LayDanhSachQuanTri(string? text, string? maPhong, string? trangThai) =>
        GiuongDB.LayDanhSachQuanTri(text, maPhong, trangThai);

    public static Task<Giuong?> DocChiTiet(string maGiuong) => GiuongDB.DocChiTiet(maGiuong);

    public static Task<bool> TrungSoGiuong(string maPhong, string soGiuong, string? maGiuongBoQua) =>
        GiuongDB.TrungSoGiuong(maPhong, soGiuong, maGiuongBoQua);

    public static Task<bool> DangDuocThamChieu(string maGiuong) => GiuongDB.DangDuocThamChieu(maGiuong);


    public Task Them() => GiuongDB.Them(this);

    public Task CapNhatThongTin() => GiuongDB.CapNhatThongTin(this);

    public Task Xoa() => GiuongDB.Xoa(MaGiuong);

    public void GiuCho(string maPhong)
    {
        if (MaPhong != maPhong || TrangThai != "Trong")
            throw new InvalidOperationException($"Giường {MaGiuong} không còn hợp lệ để giữ chỗ.");
        TrangThai = "GiuCho";
    }

    public void XacNhanDaCoc(string maPhong)
    {
        if (MaPhong != maPhong || TrangThai != "GiuCho")
            throw new InvalidOperationException($"Giường {MaGiuong} không còn ở trạng thái giữ chỗ.");
        TrangThai = "DaCoc";
    }

    public static Task CapNhatDanhSachDaCoc(IReadOnlyList<string> dsMaGiuong) =>
        GiuongDB.UpdateTrangThaiBatch(dsMaGiuong, "DaCoc");

    public static Task CapNhatDanhSachTrong(IReadOnlyList<string> dsMaGiuong) =>
        GiuongDB.UpdateTrangThaiBatch(dsMaGiuong, "Trong");

    public static async Task CapNhatTrangThaiTrong(string maGiuong)
    {
        if (string.IsNullOrWhiteSpace(maGiuong))
            throw new ArgumentException("Mã giường không được để trống.");
        if (!await GiuongDB.UpdateTrangThai(maGiuong.Trim(), "Trong"))
            throw new InvalidOperationException($"Giường {maGiuong} không thể cập nhật trạng thái Trống.");
    }

    public static Task CapNhatDangSuDungTheoHD(string maHD) =>
        GiuongDB.UpdateTrangThaiTheoHopDong(maHD, "DangSuDung");

    public void GiaiPhong(string maPhong)
    {
        if (MaPhong != maPhong || TrangThai is not ("GiuCho" or "DaCoc"))
            throw new InvalidOperationException($"Giường {MaGiuong} không còn hợp lệ để giải phóng.");
        TrangThai = "Trong";
    }
}
