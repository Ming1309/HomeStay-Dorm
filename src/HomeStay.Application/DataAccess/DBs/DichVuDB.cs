namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class DichVuDB
{
    private const string Select = """
        SELECT MaDV, TenDV, DonGia, DonViTinh, TrangThai
        FROM DichVu
        """;

    public static async Task<IReadOnlyList<DichVu>> LayDanhSach()
    {
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<DichVu>(
            $"{Select} ORDER BY MaDV", transaction: PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static Task<DichVu?> Doc(string maDV) =>
        PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<DichVu>(
            $"{Select} WHERE MaDV = @MaDV", new { MaDV = maDV },
            PhienDuLieu.Session.Transaction);

    public static async Task<string> TaoMaMoi()
    {
        const string sql = """
            SELECT ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(MaDV, 3, 18))), 0) + 1
            FROM DichVu WITH (UPDLOCK, HOLDLOCK)
            WHERE MaDV LIKE 'DV%'
            """;
        var soThuTu = await PhienDuLieu.Session.Connection.QuerySingleAsync<int>(
            sql, transaction: PhienDuLieu.Session.Transaction);
        return $"DV{soThuTu:D2}";
    }

    public static Task<bool> DangDuocThamChieu(string maDV) =>
        PhienDuLieu.Session.Connection.ExecuteScalarAsync<bool>(
            """
            SELECT CASE WHEN
                EXISTS (SELECT 1 FROM HopDong_DichVu WHERE MaDV = @MaDV)
                OR EXISTS (SELECT 1 FROM ChiTietHoaDon WHERE MaDV = @MaDV)
            THEN 1 ELSE 0 END
            """,
            new { MaDV = maDV }, PhienDuLieu.Session.Transaction);

    public static async Task Them(DichVu dichVu)
    {
        const string sql = """
            INSERT INTO DichVu (MaDV, TenDV, DonGia, DonViTinh, TrangThai)
            VALUES (@MaDV, @TenDV, @DonGia, @DonViTinh, @TrangThai)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, dichVu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo dịch vụ.");
    }

    public static async Task CapNhat(DichVu dichVu)
    {
        const string sql = """
            UPDATE DichVu
            SET TenDV = @TenDV, DonGia = @DonGia, DonViTinh = @DonViTinh,
                TrangThai = @TrangThai
            WHERE MaDV = @MaDV
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, dichVu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật dịch vụ.");
    }

    public static async Task Xoa(string maDV)
    {
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            "DELETE FROM DichVu WHERE MaDV = @MaDV", new { MaDV = maDV },
            PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể xóa dịch vụ.");
    }
}
