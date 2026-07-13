namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ThanhVienDangKy
{
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string MaKH { get; set; } = string.Empty;
    public string VaiTro { get; set; } = "DaiDien";
    public string TrangThaiDuyet { get; set; } = "ChoDuyet";

    public void KiemTraVaiTroHopLe()
    {
        if (VaiTro is not ("DaiDien" or "ThanhVien"))
            throw new InvalidOperationException($"Vai trò '{VaiTro}' không hợp lệ.");
    }

    public static async Task KiemTraTonTaiDaiDien(string maPhieuCoc)
    {
        var danhSach = await ThanhVienDangKyDB.LayTheoMaPhieuCoc(maPhieuCoc);
        foreach (var tv in danhSach)
            if (tv.VaiTro == "DaiDien")
                throw new InvalidOperationException("Phiếu cọc đã có người đại diện.");
    }

    public static ThanhVienDangKy TaoDaiDien(string maPhieuCoc, string maKH) => new()
    {
        MaPhieuCoc = maPhieuCoc,
        MaKH = maKH,
        VaiTro = "DaiDien",
        TrangThaiDuyet = "ChoDuyet",
    };

    public static ThanhVienDangKy TaoThanhVien(string maPhieuCoc, string maKH) => new()
    {
        MaPhieuCoc = maPhieuCoc,
        MaKH = maKH,
        VaiTro = "ThanhVien",
        TrangThaiDuyet = "ChoDuyet",
    };

    public static Task XoaTheoPhieuCoc(string maPhieuCoc) => ThanhVienDangKyDB.XoaTheoPhieuCoc(maPhieuCoc);

    public static Task ThemHangLoat(List<ThanhVienDangKy> danhSach) => ThanhVienDangKyDB.ThemHangLoat(danhSach);
}
