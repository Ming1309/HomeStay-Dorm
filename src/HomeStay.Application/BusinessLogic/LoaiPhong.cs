namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class LoaiPhong
{
    public string MaLP { get; set; } = string.Empty;
    public string TenLoaiPhong { get; set; } = string.Empty;
    public int SucChua { get; set; }
    public decimal GiaThue { get; set; }

    public static Task<IReadOnlyList<LoaiPhong>> LayDanhSach() => LoaiPhongDB.LayDanhSach();
}
