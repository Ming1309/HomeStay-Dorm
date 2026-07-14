namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class TaiSanDB
{
    private const string Select = """
        SELECT MaTS, TenTaiSan, LoaiTaiSan, GiaTri, MoTa, TrangThai
        FROM TaiSan
        """;

    public static async Task<IReadOnlyList<TaiSan>> LayDanhSach()
    {
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<TaiSan>(
            $"{Select} ORDER BY MaTS", transaction: PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static Task<TaiSan?> Doc(string maTS) =>
        PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<TaiSan>(
            $"{Select} WHERE MaTS = @MaTS", new { MaTS = maTS },
            PhienDuLieu.Session.Transaction);

    public static Task<TaiSan?> GetTaiSanTheoMaTS(string maTS) => Doc(maTS);

    public static async Task<string> TaoMaMoi()
    {
        const string sql = """
            SELECT ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(MaTS, 3, 18))), 0) + 1
            FROM TaiSan WITH (UPDLOCK, HOLDLOCK)
            WHERE MaTS LIKE 'TS%'
            """;
        var soThuTu = await PhienDuLieu.Session.Connection.QuerySingleAsync<int>(
            sql, transaction: PhienDuLieu.Session.Transaction);
        return $"TS{soThuTu:D2}";
    }

    public static Task<bool> TrungTen(string tenTaiSan, string? maLoaiTru) =>
        PhienDuLieu.Session.Connection.ExecuteScalarAsync<bool>(
            """
            SELECT CASE WHEN EXISTS (
                SELECT 1 FROM TaiSan
                WHERE TenTaiSan = @TenTaiSan
                  AND (@MaLoaiTru IS NULL OR MaTS <> @MaLoaiTru)
            ) THEN 1 ELSE 0 END
            """,
            new { TenTaiSan = tenTaiSan, MaLoaiTru = maLoaiTru },
            PhienDuLieu.Session.Transaction);

    public static Task<bool> DangDuocThamChieu(string maTS) =>
        PhienDuLieu.Session.Connection.ExecuteScalarAsync<bool>(
            """
            SELECT CASE WHEN
                EXISTS (SELECT 1 FROM Phong_TaiSan WHERE MaTS = @MaTS)
                OR EXISTS (SELECT 1 FROM ChiTietGiaoNhan WHERE MaTS = @MaTS)
                OR EXISTS (SELECT 1 FROM ChiTietHoaDon WHERE MaTS = @MaTS)
            THEN 1 ELSE 0 END
            """,
            new { MaTS = maTS }, PhienDuLieu.Session.Transaction);

    public static async Task Them(TaiSan taiSan)
    {
        const string sql = """
            INSERT INTO TaiSan (MaTS, TenTaiSan, LoaiTaiSan, GiaTri, MoTa, TrangThai)
            VALUES (@MaTS, @TenTaiSan, @LoaiTaiSan, @GiaTri, @MoTa, @TrangThai)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, taiSan, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo tài sản.");
    }

    public static async Task CapNhat(TaiSan taiSan)
    {
        const string sql = """
            UPDATE TaiSan
            SET TenTaiSan = @TenTaiSan, LoaiTaiSan = @LoaiTaiSan, GiaTri = @GiaTri,
                MoTa = @MoTa, TrangThai = @TrangThai
            WHERE MaTS = @MaTS
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, taiSan, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật tài sản.");
    }

    public static async Task Xoa(string maTS)
    {
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            "DELETE FROM TaiSan WHERE MaTS = @MaTS", new { MaTS = maTS },
            PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể xóa tài sản.");
    }
}
