namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class DichVu
{
    public static readonly IReadOnlySet<string> TrangThaiHopLe = new HashSet<string>
    {
        "DangApDung",
        "NgungApDung",
    };

    public string MaDV { get; set; } = string.Empty;
    public string TenDV { get; set; } = string.Empty;
    public decimal DonGia { get; set; }
    public string DonViTinh { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "DangApDung";

    public void ChuanHoa()
    {
        TenDV = TenDV?.Trim() ?? string.Empty;
        DonViTinh = DonViTinh?.Trim() ?? string.Empty;
        TrangThai = TrangThai?.Trim() ?? string.Empty;
    }

    public void KiemTraDuLieuHopLe()
    {
        if (string.IsNullOrWhiteSpace(TenDV))
            throw new ArgumentException("Vui lòng nhập tên dịch vụ.");
        if (TenDV.Length > 100)
            throw new ArgumentException("Tên dịch vụ không được vượt quá 100 ký tự.");
        if (string.IsNullOrWhiteSpace(DonViTinh))
            throw new ArgumentException("Vui lòng nhập đơn vị tính.");
        if (DonViTinh.Length > 50)
            throw new ArgumentException("Đơn vị tính không được vượt quá 50 ký tự.");
        if (DonGia < 0 || DonGia > 9999999999999999.99m)
            throw new ArgumentException("Đơn giá dịch vụ không hợp lệ.");
        if (!TrangThaiHopLe.Contains(TrangThai))
            throw new ArgumentException("Trạng thái dịch vụ không hợp lệ.");
    }

    public static Task<IReadOnlyList<DichVu>> LayDanhSach() => DichVuDB.LayDanhSach();
    public static Task<DichVu?> Doc(string maDV) => DichVuDB.Doc(maDV);
    public static Task<string> TaoMaMoi() => DichVuDB.TaoMaMoi();
    public static Task<bool> DangDuocThamChieu(string maDV) => DichVuDB.DangDuocThamChieu(maDV);
    public Task Them() => DichVuDB.Them(this);
    public Task CapNhat() => DichVuDB.CapNhat(this);
    public Task Xoa() => DichVuDB.Xoa(MaDV);
}
