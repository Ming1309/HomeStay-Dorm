namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class QuyDinhDB
{
    private const string Select = """
        SELECT MaQD, TenQD, LoaiQD, DuongDanFile, NgayApDung, NgayKetThuc
        FROM QuyDinh
        """;

    public static async Task<IReadOnlyList<QuyDinh>> LayDanhSach()
    {
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<QuyDinhRow>(
            $"{Select} ORDER BY NgayApDung DESC, MaQD DESC",
            transaction: PhienDuLieu.Session.Transaction);
        return rows.Select(ChuyenSangQuyDinh).ToList();
    }

    public static async Task<QuyDinh?> Doc(string maQD)
    {
        var row = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<QuyDinhRow>(
            $"{Select} WHERE MaQD=@MaQD", new { MaQD = maQD },
            PhienDuLieu.Session.Transaction);
        return row is null ? null : ChuyenSangQuyDinh(row);
    }

    public static async Task<string> TaoMaMoi()
    {
        const string sql = """
            SELECT ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(MaQD, 3, 18))), 0) + 1
            FROM QuyDinh WITH (UPDLOCK, HOLDLOCK)
            WHERE MaQD LIKE 'QD%'
            """;
        var soThuTu = await PhienDuLieu.Session.Connection.QuerySingleAsync<int>(
            sql, transaction: PhienDuLieu.Session.Transaction);
        return $"QD{soThuTu:D2}";
    }

    public static Task<bool> DangDuocThamChieu(string maQD) =>
        PhienDuLieu.Session.Connection.ExecuteScalarAsync<bool>(
            "SELECT CASE WHEN EXISTS (SELECT 1 FROM HopDong_QuyDinh WHERE MaQD=@MaQD) THEN 1 ELSE 0 END",
            new { MaQD = maQD }, PhienDuLieu.Session.Transaction);

    public static async Task Them(QuyDinh quyDinh)
    {
        const string sql = """
            INSERT INTO QuyDinh (MaQD, TenQD, LoaiQD, DuongDanFile, NgayApDung, NgayKetThuc)
            VALUES (@MaQD, @TenQD, @LoaiQD, @DuongDanFile, @NgayApDung, @NgayKetThuc)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, TaoThamSo(quyDinh), PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo quy định.");
    }

    public static async Task CapNhat(QuyDinh quyDinh)
    {
        const string sql = """
            UPDATE QuyDinh
            SET TenQD=@TenQD, LoaiQD=@LoaiQD, DuongDanFile=@DuongDanFile,
                NgayApDung=@NgayApDung, NgayKetThuc=@NgayKetThuc
            WHERE MaQD=@MaQD
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, TaoThamSo(quyDinh), PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật quy định.");
    }

    public static async Task Xoa(string maQD)
    {
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            "DELETE FROM QuyDinh WHERE MaQD=@MaQD", new { MaQD = maQD },
            PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể xóa quy định.");
    }

    private static QuyDinh ChuyenSangQuyDinh(QuyDinhRow row) => new()
    {
        MaQD = row.MaQD,
        TenQD = row.TenQD,
        LoaiQD = row.LoaiQD,
        DuongDanFile = row.DuongDanFile,
        NgayApDung = DateOnly.FromDateTime(row.NgayApDung),
        NgayKetThuc = row.NgayKetThuc is { } ngayKetThuc
            ? DateOnly.FromDateTime(ngayKetThuc)
            : null
    };

    private static object TaoThamSo(QuyDinh quyDinh) => new
    {
        quyDinh.MaQD,
        quyDinh.TenQD,
        quyDinh.LoaiQD,
        quyDinh.DuongDanFile,
        NgayApDung = quyDinh.NgayApDung.ToDateTime(TimeOnly.MinValue),
        NgayKetThuc = quyDinh.NgayKetThuc is { } ngayKetThuc
            ? ngayKetThuc.ToDateTime(TimeOnly.MinValue)
            : (DateTime?)null
    };

    private sealed class QuyDinhRow
    {
        public string MaQD { get; init; } = string.Empty;
        public string TenQD { get; init; } = string.Empty;
        public string LoaiQD { get; init; } = string.Empty;
        public string DuongDanFile { get; init; } = string.Empty;
        public DateTime NgayApDung { get; init; }
        public DateTime? NgayKetThuc { get; init; }
    }
}
