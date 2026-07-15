namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.DataAccess.DbConnections;

internal static class MaSoDB
{
    public static async Task<string> LayMaMoi(string loai)
    {
        var (sql, prefix, width) = loai switch
        {
            "KhachHang" => ("SELECT NEXT VALUE FOR dbo.Seq_KhachHang", "KH", 4),
            "NhanVien" => ("SELECT NEXT VALUE FOR dbo.Seq_NhanVien", "NV", 2),
            "Phong" => ("SELECT NEXT VALUE FOR dbo.Seq_Phong", "P", 3),
            "Giuong" => ("SELECT NEXT VALUE FOR dbo.Seq_Giuong", "G", 3),
            "DichVu" => ("SELECT NEXT VALUE FOR dbo.Seq_DichVu", "DV", 2),
            "TaiSan" => ("SELECT NEXT VALUE FOR dbo.Seq_TaiSan", "TS", 2),
            "QuyDinh" => ("SELECT NEXT VALUE FOR dbo.Seq_QuyDinh", "QD", 2),
            "ChinhSachHoanCoc" => ("SELECT NEXT VALUE FOR dbo.Seq_ChinhSachHoanCoc", "CS", 2),
            "PhieuDangKy" => ("SELECT NEXT VALUE FOR dbo.Seq_PhieuDangKy", "PDK", 4),
            "LichHen" => ("SELECT NEXT VALUE FOR dbo.Seq_LichHen", "LH", 4),
            "PhieuCoc" => ("SELECT NEXT VALUE FOR dbo.Seq_PhieuCoc", "PC", 4),
            "HopDong" => ("SELECT NEXT VALUE FOR dbo.Seq_HopDong", "HD", 4),
            "BienBanBanGiao" => ("SELECT NEXT VALUE FOR dbo.Seq_BienBanBanGiao", "BBBG", 4),
            "BienBanThuHoi" => ("SELECT NEXT VALUE FOR dbo.Seq_BienBanThuHoi", "BBTH", 4),
            "HoaDon" => ("SELECT NEXT VALUE FOR dbo.Seq_HoaDon", "HDON", 4),
            "PhieuDoiSoat" => ("SELECT NEXT VALUE FOR dbo.Seq_PhieuDoiSoat", "PDS", 4),
            "PhieuThu" => ("SELECT NEXT VALUE FOR dbo.Seq_PhieuThu", "PT", 4),
            "PhieuHoanCoc" => ("SELECT NEXT VALUE FOR dbo.Seq_PhieuHoanCoc", "PHC", 4),
            _ => throw new ArgumentOutOfRangeException(nameof(loai), loai, "Loại mã không được hỗ trợ."),
        };

        var value = await PhienDuLieu.Session.Connection.ExecuteScalarAsync<long>(
            sql, transaction: PhienDuLieu.Session.Transaction);
        return prefix + value.ToString($"D{width}");
    }
}
