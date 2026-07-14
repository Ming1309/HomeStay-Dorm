namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ChinhSachHoanCoc
{
    public string MaChinhSach { get; set; } = string.Empty;
    public string TenChinhSach { get; set; } = string.Empty;
    public decimal TiLe_ChuaKy { get; set; }
    public decimal TiLe_TruocHan_NganHan { get; set; }
    public decimal TiLe_TruocHan_DaiHan { get; set; }
    public decimal TiLe_DungHan { get; set; }
    public int MocLuuTru { get; set; }
    public DateOnly NgayApDung { get; set; }
    public DateOnly? NgayKetThuc { get; set; }

    public static Task<IReadOnlyList<ChinhSachHoanCoc>> LayDanhSach() =>
        ChinhSachHoanCocDB.LayDanhSach();

    public static Task<ChinhSachHoanCoc?> LayChinhSachDangApDung(DateOnly ngay) =>
        ChinhSachHoanCocDB.LayChinhSachDangApDung(ngay);

    public static Task<ChinhSachHoanCoc?> LayChinhSachTheoMa(string maChinhSach) =>
        ChinhSachHoanCocDB.GetChinhSachTheoMa(maChinhSach);

    public static Task<ChinhSachHoanCoc?> LayPhienBanMoiNhat() =>
        ChinhSachHoanCocDB.LayPhienBanMoiNhat();

    public static Task<string> TaoMaMoi() => ChinhSachHoanCocDB.TaoMaMoi();

    // UC 1.4.28
    public void KiemTraTyLeHopLe()
    {
        KiemTraMotTyLe(TiLe_ChuaKy, nameof(TiLe_ChuaKy));
        KiemTraMotTyLe(TiLe_TruocHan_NganHan, nameof(TiLe_TruocHan_NganHan));
        KiemTraMotTyLe(TiLe_TruocHan_DaiHan, nameof(TiLe_TruocHan_DaiHan));
        KiemTraMotTyLe(TiLe_DungHan, nameof(TiLe_DungHan));
    }

    public void KiemTraDuLieuHopLe()
    {
        TenChinhSach = TenChinhSach?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(TenChinhSach))
            throw new ArgumentException("Vui lòng nhập tên chính sách.");
        if (TenChinhSach.Length > 200)
            throw new ArgumentException("Tên chính sách không được vượt quá 200 ký tự.");
        if (MocLuuTru <= 0)
            throw new ArgumentException("Mốc lưu trú phải lớn hơn 0 tháng.");
        if (NgayApDung == default)
            throw new ArgumentException("Vui lòng chọn ngày áp dụng.");
        if (NgayKetThuc is not null && NgayKetThuc <= NgayApDung)
            throw new ArgumentException("Ngày kết thúc phải sau ngày áp dụng.");
        KiemTraTyLeHopLe();
    }

    public Task Them()
    {
        if (string.IsNullOrWhiteSpace(MaChinhSach))
            throw new InvalidOperationException("Không xác định được mã chính sách cần tạo.");
        KiemTraDuLieuHopLe();
        return ChinhSachHoanCocDB.Them(this);
    }

    public Task CapNhatNgayKetThuc(DateOnly ngayKetThuc)
    {
        if (ngayKetThuc < NgayApDung)
            throw new ArgumentException("Ngày kết thúc không được trước ngày áp dụng.");
        NgayKetThuc = ngayKetThuc;
        return ChinhSachHoanCocDB.CapNhatNgayKetThuc(MaChinhSach, ngayKetThuc);
    }

    public string TinhTrangThai(DateOnly homNay)
    {
        if (NgayApDung > homNay) return "ChuaApDung";
        if (NgayKetThuc is not null && NgayKetThuc < homNay) return "HetHieuLuc";
        return "DangApDung";
    }

    public decimal XacDinhTyLeHoan(int soThangThucTe, int soThangHopDong)
    {
        if (soThangThucTe >= soThangHopDong)
        {
            return TiLe_DungHan;
        }

        int moc = MocLuuTru;
        if (soThangThucTe < moc)
        {
            return TiLe_TruocHan_NganHan;
        }

        return TiLe_TruocHan_DaiHan;
    }

    private static void KiemTraMotTyLe(decimal tyLe, string ten)
    {
        if (tyLe < 0 || tyLe > 1)
            throw new ArgumentException(
                $"Tỷ lệ {ten} phải nằm trong khoảng 0 đến 1 (nhận được: {tyLe}).");
    }
}
