namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ChinhSachHoanCocDB
{
    private const string Select = """
        SELECT MaChinhSach, TenChinhSach, TiLe_ChuaKy, TiLe_TruocHan_NganHan,
               TiLe_TruocHan_DaiHan, TiLe_DungHan, MocLuuTru, NgayApDung, NgayKetThuc
        FROM ChinhSachHoanCoc
        """;

    public static async Task<IReadOnlyList<ChinhSachHoanCoc>> LayDanhSach()
    {
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<ChinhSachHoanCocRow>(
            $"{Select} ORDER BY NgayApDung DESC, MaChinhSach DESC",
            transaction: PhienDuLieu.Session.Transaction);
        return rows.Select(ChuyenSangChinhSach).ToList();
    }

    public static async Task<ChinhSachHoanCoc?> LayChinhSachDangApDung(DateOnly ngay)
    {
        var row = await PhienDuLieu.Session.Connection.QueryFirstOrDefaultAsync<ChinhSachHoanCocRow>(
            $"""
            {Select}
            WHERE NgayApDung <= @Ngay
              AND (NgayKetThuc IS NULL OR NgayKetThuc >= @Ngay)
            ORDER BY NgayApDung DESC, MaChinhSach DESC
            """,
            new { Ngay = ngay.ToDateTime(TimeOnly.MinValue) },
            transaction: PhienDuLieu.Session.Transaction);
        return row is null ? null : ChuyenSangChinhSach(row);
    }

    public static async Task<ChinhSachHoanCoc?> GetChinhSachTheoMa(string maChinhSach)
    {
        var row = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<ChinhSachHoanCocRow>(
            $"{Select} WHERE MaChinhSach = @MaChinhSach",
            new { MaChinhSach = maChinhSach }, PhienDuLieu.Session.Transaction);
        return row is null ? null : ChuyenSangChinhSach(row);
    }

    public static async Task<ChinhSachHoanCoc?> LayPhienBanMoiNhat()
    {
        var row = await PhienDuLieu.Session.Connection.QueryFirstOrDefaultAsync<ChinhSachHoanCocRow>(
            $"{Select} ORDER BY NgayApDung DESC, MaChinhSach DESC",
            transaction: PhienDuLieu.Session.Transaction);
        return row is null ? null : ChuyenSangChinhSach(row);
    }

    public static async Task Them(ChinhSachHoanCoc chinhSach)
    {
        chinhSach.MaChinhSach = await MaSoDB.LayMaMoi("ChinhSachHoanCoc");
        const string sql = """
            INSERT INTO ChinhSachHoanCoc
                (MaChinhSach, TenChinhSach, TiLe_ChuaKy, TiLe_TruocHan_NganHan,
                 TiLe_TruocHan_DaiHan, TiLe_DungHan, MocLuuTru, NgayApDung, NgayKetThuc)
            VALUES
                (@MaChinhSach, @TenChinhSach, @TiLe_ChuaKy, @TiLe_TruocHan_NganHan,
                 @TiLe_TruocHan_DaiHan, @TiLe_DungHan, @MocLuuTru, @NgayApDung, @NgayKetThuc)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, TaoThamSo(chinhSach), PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo phiên bản chính sách hoàn cọc.");
    }

    public static async Task CapNhatNgayKetThuc(string maChinhSach, DateOnly ngayKetThuc)
    {
        const string sql = """
            UPDATE ChinhSachHoanCoc
            SET NgayKetThuc = @NgayKetThuc
            WHERE MaChinhSach = @MaChinhSach
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql,
            new
            {
                MaChinhSach = maChinhSach,
                NgayKetThuc = ngayKetThuc.ToDateTime(TimeOnly.MinValue)
            },
            PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể kết thúc phiên bản chính sách trước đó.");
    }

    private static object TaoThamSo(ChinhSachHoanCoc chinhSach) => new
    {
        chinhSach.MaChinhSach,
        chinhSach.TenChinhSach,
        chinhSach.TiLe_ChuaKy,
        chinhSach.TiLe_TruocHan_NganHan,
        chinhSach.TiLe_TruocHan_DaiHan,
        chinhSach.TiLe_DungHan,
        chinhSach.MocLuuTru,
        NgayApDung = chinhSach.NgayApDung.ToDateTime(TimeOnly.MinValue),
        NgayKetThuc = chinhSach.NgayKetThuc is { } ngayKetThuc
            ? ngayKetThuc.ToDateTime(TimeOnly.MinValue)
            : (DateTime?)null
    };

    private static ChinhSachHoanCoc ChuyenSangChinhSach(ChinhSachHoanCocRow row) => new()
    {
        MaChinhSach = row.MaChinhSach,
        TenChinhSach = row.TenChinhSach,
        TiLe_ChuaKy = row.TiLe_ChuaKy,
        TiLe_TruocHan_NganHan = row.TiLe_TruocHan_NganHan,
        TiLe_TruocHan_DaiHan = row.TiLe_TruocHan_DaiHan,
        TiLe_DungHan = row.TiLe_DungHan,
        MocLuuTru = row.MocLuuTru,
        NgayApDung = DateOnly.FromDateTime(row.NgayApDung),
        NgayKetThuc = row.NgayKetThuc is { } ngayKetThuc
            ? DateOnly.FromDateTime(ngayKetThuc)
            : null
    };

    private sealed class ChinhSachHoanCocRow
    {
        public string MaChinhSach { get; init; } = string.Empty;
        public string TenChinhSach { get; init; } = string.Empty;
        public decimal TiLe_ChuaKy { get; init; }
        public decimal TiLe_TruocHan_NganHan { get; init; }
        public decimal TiLe_TruocHan_DaiHan { get; init; }
        public decimal TiLe_DungHan { get; init; }
        public int MocLuuTru { get; init; }
        public DateTime NgayApDung { get; init; }
        public DateTime? NgayKetThuc { get; init; }
    }
}
