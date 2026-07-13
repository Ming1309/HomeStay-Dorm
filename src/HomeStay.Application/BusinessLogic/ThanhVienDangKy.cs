namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ThanhVienDangKy
{
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string MaKH { get; set; } = string.Empty;
    public string VaiTro { get; set; } = "DaiDien";
    public string TrangThaiDuyet { get; set; } = "ChoDuyet";
    public KhachHang? KhachHang { get; set; }

    public static Task<IReadOnlyList<ThanhVienDangKy>> LayDanhSachThanhVien(string maPhieuCoc) =>
        ThanhVienDangKyDB.GetByMaPhieuCoc(maPhieuCoc);

    public static async Task<bool> KiemTraTonTaiDaiDien(string maPhieuCoc)
    {
        var ds = await LayDanhSachThanhVien(maPhieuCoc);
        return ds.Any(tv => tv.VaiTro == "DaiDien");
    }

    public static void KiemTraVaiTroHopLe(string vaiTro)
    {
        if (vaiTro is not ("DaiDien" or "ThanhVien"))
            throw new InvalidOperationException("Vai trò thành viên không hợp lệ.");
    }

    public static Task<bool> DanhDauHopLe(string maPhieuCoc, string maKH) =>
        ThanhVienDangKyDB.UpdateTrangThaiDuyet(maPhieuCoc, maKH, "HopLe");

    public static Task<bool> DanhDauTuChoi(string maPhieuCoc, string maKH) =>
        ThanhVienDangKyDB.UpdateTrangThaiDuyet(maPhieuCoc, maKH, "TuChoi");

    public static Task<bool> DuyetTatCaThanhVien(string maPhieuCoc) =>
        ThanhVienDangKyDB.UpdateTatCaTrangThaiDuyet(maPhieuCoc, "HopLe");

    public static Task<bool> TuChoiTatCaThanhVien(string maPhieuCoc) =>
        ThanhVienDangKyDB.UpdateTatCaTrangThaiDuyet(maPhieuCoc, "TuChoi");

    public static Task<bool> DuyetThanhVienConLai(string maPhieuCoc) =>
        ThanhVienDangKyDB.UpdateThanhVienConLaiHopLe(maPhieuCoc);

    public static Task<int> DemThanhVienHopLe(string maPhieuCoc) =>
        ThanhVienDangKyDB.CountThanhVienHopLe(maPhieuCoc);

    public static Task<bool> HoanTac(string maPhieuCoc, string maKH) =>
        ThanhVienDangKyDB.UpdateTrangThaiDuyet(maPhieuCoc, maKH, "ChoDuyet");
}
