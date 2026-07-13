namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ThongBaoDB
{
    public static async Task Them(ThongBao thongBao)
    {
        const string sql = """
            INSERT INTO ThongBao (MaTB, TieuDe, NoiDung, VaiTroNhan, LienKet, Tone, ThoiGianTao, MaNVGui, MaThamChieu)
            VALUES (@MaTB, @TieuDe, @NoiDung, @VaiTroNhan, @LienKet, @Tone, @ThoiGianTao, @MaNVGui, @MaThamChieu)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, thongBao, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể lưu thông báo.");
    }

    public static async Task<IReadOnlyList<ThongBao>> LayTheoVaiTro(string vaiTro, string maNV, int soLuong = 20)
    {
        const string sql = """
            SELECT TOP (@SoLuong)
                   tb.MaTB, tb.TieuDe, tb.NoiDung, tb.VaiTroNhan, tb.LienKet, tb.Tone,
                   tb.ThoiGianTao, tb.MaNVGui, tb.MaThamChieu,
                   CASE WHEN nd.MaTB IS NULL THEN 0 ELSE 1 END AS DaDoc
            FROM ThongBao tb
            LEFT JOIN ThongBao_NguoiDoc nd ON nd.MaTB = tb.MaTB AND nd.MaNV = @MaNV
            WHERE tb.VaiTroNhan = @VaiTro
            ORDER BY tb.ThoiGianTao DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<ThongBao>(sql,
            new { VaiTro = vaiTro, MaNV = maNV, SoLuong = soLuong },
            PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task DanhDauDaDoc(string maTB, string maNV, DateTime thoiGianDoc)
    {
        const string sql = """
            IF NOT EXISTS (SELECT 1 FROM ThongBao_NguoiDoc WHERE MaTB = @MaTB AND MaNV = @MaNV)
                INSERT INTO ThongBao_NguoiDoc (MaTB, MaNV, ThoiGianDoc)
                VALUES (@MaTB, @MaNV, @ThoiGianDoc)
            """;
        await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { MaTB = maTB, MaNV = maNV, ThoiGianDoc = thoiGianDoc },
            PhienDuLieu.Session.Transaction);
    }

    public static async Task DanhDauTatCaDaDoc(string vaiTro, string maNV, DateTime thoiGianDoc)
    {
        const string sql = """
            INSERT INTO ThongBao_NguoiDoc (MaTB, MaNV, ThoiGianDoc)
            SELECT tb.MaTB, @MaNV, @ThoiGianDoc
            FROM ThongBao tb
            WHERE tb.VaiTroNhan = @VaiTro
              AND NOT EXISTS (
                  SELECT 1 FROM ThongBao_NguoiDoc nd
                  WHERE nd.MaTB = tb.MaTB AND nd.MaNV = @MaNV
              )
            """;
        await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
            new { VaiTro = vaiTro, MaNV = maNV, ThoiGianDoc = thoiGianDoc },
            PhienDuLieu.Session.Transaction);
    }
}
