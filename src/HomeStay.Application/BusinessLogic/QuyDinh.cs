namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class QuyDinh
{
    public static readonly IReadOnlySet<string> CacLoaiHopLe = new HashSet<string>
    {
        "DieuKienLuuTru",
        "NoiQuySinhHoat",
        "HoSoPhapLyCuTru",
        "TaiChinhThanhToan",
        "TaiSanTienIchAnToan",
        "ViPhamBoiThuong",
    };

    public string MaQD { get; set; } = string.Empty;
    public string TenQD { get; set; } = string.Empty;
    public string LoaiQD { get; set; } = string.Empty;
    public string DuongDanFile { get; set; } = string.Empty;
    public DateOnly NgayApDung { get; set; }
    public DateOnly? NgayKetThuc { get; set; }

    public void ChuanHoa()
    {
        TenQD = TenQD.Trim();
        LoaiQD = LoaiQD.Trim();
        DuongDanFile = DuongDanFile.Trim();
    }

    public void KiemTraDuLieuHopLe(bool yeuCauDuongDan = true)
    {
        if (string.IsNullOrWhiteSpace(TenQD))
            throw new ArgumentException("Vui lòng nhập tên quy định.");
        if (TenQD.Length > 200)
            throw new ArgumentException("Tên quy định không được vượt quá 200 ký tự.");
        if (!CacLoaiHopLe.Contains(LoaiQD))
            throw new ArgumentException("Loại quy định không hợp lệ.");
        if (NgayApDung == default)
            throw new ArgumentException("Vui lòng chọn ngày áp dụng.");
        if (NgayKetThuc is not null && NgayKetThuc <= NgayApDung)
            throw new ArgumentException("Ngày kết thúc phải lớn hơn ngày áp dụng.");
        if (yeuCauDuongDan && string.IsNullOrWhiteSpace(DuongDanFile))
            throw new ArgumentException("Vui lòng tải lên văn bản PDF.");
    }

    public string TinhTrangThai(DateOnly homNay)
    {
        if (homNay < NgayApDung) return "ChuaApDung";
        if (NgayKetThuc is not null && homNay > NgayKetThuc) return "HetHieuLuc";
        return "DangApDung";
    }

    public static Task<IReadOnlyList<QuyDinh>> LayDanhSach() => QuyDinhDB.LayDanhSach();
    public static Task<QuyDinh?> Doc(string maQD) => QuyDinhDB.Doc(maQD);
    public static Task<string> TaoMaMoi() => QuyDinhDB.TaoMaMoi();
    public static Task<bool> DangDuocThamChieu(string maQD) => QuyDinhDB.DangDuocThamChieu(maQD);
    public Task Them() => QuyDinhDB.Them(this);
    public Task CapNhat() => QuyDinhDB.CapNhat(this);
    public Task Xoa() => QuyDinhDB.Xoa(MaQD);
}
