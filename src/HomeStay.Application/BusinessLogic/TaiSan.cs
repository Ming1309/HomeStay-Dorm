namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class TaiSan
{
    public static readonly IReadOnlySet<string> LoaiTaiSanHopLe = new HashSet<string>
    {
        "NoiThat",
        "ThietBiDien",
        "TienIchBanGiao",
    };

    public static readonly IReadOnlySet<string> TrangThaiHopLe = new HashSet<string>
    {
        "DangApDung",
        "NgungApDung",
    };

    public string MaTS { get; set; } = string.Empty;
    public string TenTaiSan { get; set; } = string.Empty;
    public string LoaiTaiSan { get; set; } = "NoiThat";
    public decimal GiaTri { get; set; }
    public string? MoTa { get; set; }
    public string TrangThai { get; set; } = "DangApDung";

    public void ChuanHoa()
    {
        TenTaiSan = TenTaiSan?.Trim() ?? string.Empty;
        LoaiTaiSan = LoaiTaiSan?.Trim() ?? string.Empty;
        MoTa = string.IsNullOrWhiteSpace(MoTa) ? null : MoTa.Trim();
        TrangThai = TrangThai?.Trim() ?? string.Empty;
    }

    public void KiemTraDuLieuHopLe()
    {
        if (string.IsNullOrWhiteSpace(TenTaiSan))
            throw new ArgumentException("Vui lòng nhập tên tài sản.");
        if (TenTaiSan.Length > 100)
            throw new ArgumentException("Tên tài sản không được vượt quá 100 ký tự.");
        if (!LoaiTaiSanHopLe.Contains(LoaiTaiSan))
            throw new ArgumentException("Phân loại tài sản không hợp lệ.");
        if (GiaTri < 0 || GiaTri > 9999999999999999.99m)
            throw new ArgumentException("Giá trị bồi thường không hợp lệ.");
        if (MoTa?.Length > 500)
            throw new ArgumentException("Mô tả tài sản không được vượt quá 500 ký tự.");
        if (!TrangThaiHopLe.Contains(TrangThai))
            throw new ArgumentException("Trạng thái tài sản không hợp lệ.");
    }

    public static Task<IReadOnlyList<TaiSan>> LayDanhSach() => TaiSanDB.LayDanhSach();
    public static Task<TaiSan?> Doc(string maTS) => TaiSanDB.Doc(maTS);
    public static Task<TaiSan?> LayThongTinTaiSan(string maTS) =>
        TaiSanDB.GetTaiSanTheoMaTS(maTS);
    public static Task<string> TaoMaMoi() => TaiSanDB.TaoMaMoi();
    public static Task<bool> TrungTen(string tenTaiSan, string? maLoaiTru) =>
        TaiSanDB.TrungTen(tenTaiSan, maLoaiTru);
    public static Task<bool> DangDuocThamChieu(string maTS) => TaiSanDB.DangDuocThamChieu(maTS);
    public Task Them() => TaiSanDB.Them(this);
    public Task CapNhat() => TaiSanDB.CapNhat(this);
    public Task Xoa() => TaiSanDB.Xoa(MaTS);
}
