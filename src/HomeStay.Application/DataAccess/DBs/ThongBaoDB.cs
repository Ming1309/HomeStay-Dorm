namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class ThongBaoDB
{
    private const string DieuKienNguoiNhan = """
        tb.MaCN = @MaCN
        AND (
            (tb.MaNVNhan = @MaNV AND tb.VaiTroNhan = @VaiTro)
            OR (tb.MaNVNhan IS NULL AND tb.VaiTroNhan = @VaiTro)
            OR (
                tb.MaNVNhan IS NOT NULL
                AND tb.LoaiThongBao = N'CanXuLy'
                AND tb.TrangThai = N'DangMo'
                AND tb.VaiTroNhan = @VaiTro
                AND NOT EXISTS (
                    SELECT 1
                    FROM NhanVien nvNhan
                    INNER JOIN TaiKhoan tkNhan ON tkNhan.MaNV = nvNhan.MaNV
                    WHERE nvNhan.MaNV = tb.MaNVNhan
                      AND nvNhan.MaCN = tb.MaCN
                      AND nvNhan.VaiTro = tb.VaiTroNhan
                      AND tkNhan.TrangThai = N'HoatDong'
                )
            )
        )
        """;

    public static async Task Them(ThongBao thongBao, bool capNhatNeuTonTai)
    {
        var sql = capNhatNeuTonTai
            ? """
              UPDATE ThongBao
              SET LoaiSuKien=@LoaiSuKien, LoaiThongBao=@LoaiThongBao,
                  TieuDe=@TieuDe, NoiDung=@NoiDung, MaCN=@MaCN,
                  VaiTroNhan=@VaiTroNhan, MaNVNhan=@MaNVNhan, LienKet=@LienKet,
                  Tone=@Tone, TrangThai=@TrangThai, ThoiGianTao=@ThoiGianTao,
                  MaNVGui=@MaNVGui, MaThamChieu=@MaThamChieu,
                  MaNVXuLy=NULL, ThoiGianXuLy=NULL
              WHERE KhoaChongTrung=@KhoaChongTrung;

              IF @@ROWCOUNT = 0
                  INSERT INTO ThongBao
                      (MaTB, LoaiSuKien, LoaiThongBao, TieuDe, NoiDung, MaCN,
                       VaiTroNhan, MaNVNhan, LienKet, Tone, TrangThai, KhoaChongTrung,
                       ThoiGianTao, MaNVGui, MaThamChieu, MaNVXuLy, ThoiGianXuLy)
                  VALUES
                      (@MaTB, @LoaiSuKien, @LoaiThongBao, @TieuDe, @NoiDung, @MaCN,
                       @VaiTroNhan, @MaNVNhan, @LienKet, @Tone, @TrangThai, @KhoaChongTrung,
                       @ThoiGianTao, @MaNVGui, @MaThamChieu, NULL, NULL);
              ELSE
                  DELETE nd
                  FROM ThongBao_NguoiDoc nd
                  INNER JOIN ThongBao tb ON tb.MaTB=nd.MaTB
                  WHERE tb.KhoaChongTrung=@KhoaChongTrung;
              """
            : """
              IF NOT EXISTS (
                  SELECT 1 FROM ThongBao WITH (UPDLOCK, HOLDLOCK)
                  WHERE KhoaChongTrung=@KhoaChongTrung
              )
                  INSERT INTO ThongBao
                      (MaTB, LoaiSuKien, LoaiThongBao, TieuDe, NoiDung, MaCN,
                       VaiTroNhan, MaNVNhan, LienKet, Tone, TrangThai, KhoaChongTrung,
                       ThoiGianTao, MaNVGui, MaThamChieu, MaNVXuLy, ThoiGianXuLy)
                  VALUES
                      (@MaTB, @LoaiSuKien, @LoaiThongBao, @TieuDe, @NoiDung, @MaCN,
                       @VaiTroNhan, @MaNVNhan, @LienKet, @Tone, @TrangThai, @KhoaChongTrung,
                       @ThoiGianTao, @MaNVGui, @MaThamChieu, NULL, NULL)
              """;

        await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql, thongBao, PhienDuLieu.Session.Transaction);
    }

    public static async Task<IReadOnlyList<ThongBao>> LayCuaNhanVien(
        NhanVien nhanVien,
        string boLoc,
        int soLuong,
        DateTime? truocThoiDiem,
        string? truocMaTB)
    {
        var sql = $$"""
            SELECT TOP (@SoLuong)
                   tb.MaTB, tb.LoaiSuKien, tb.LoaiThongBao, tb.TieuDe, tb.NoiDung,
                   tb.MaCN, tb.VaiTroNhan, tb.MaNVNhan, tb.LienKet, tb.Tone,
                   tb.TrangThai, tb.KhoaChongTrung, tb.ThoiGianTao, tb.MaNVGui,
                   tb.MaThamChieu, tb.MaNVXuLy, tb.ThoiGianXuLy,
                   nvXuLy.HoTen AS TenNguoiXuLy,
                   CAST(CASE WHEN nd.MaTB IS NULL THEN 0 ELSE 1 END AS BIT) AS DaDoc
            FROM ThongBao tb
            LEFT JOIN ThongBao_NguoiDoc nd ON nd.MaTB=tb.MaTB AND nd.MaNV=@MaNV
            LEFT JOIN NhanVien nvXuLy ON nvXuLy.MaNV=tb.MaNVXuLy
            WHERE {{DieuKienNguoiNhan}}
              AND (
                  @BoLoc=N'all'
                  OR (@BoLoc=N'open' AND tb.TrangThai=N'DangMo')
                  OR (@BoLoc=N'unread' AND nd.MaTB IS NULL
                      AND (tb.TrangThai=N'DangMo' OR tb.ThoiGianTao>=DATEADD(DAY,-30,GETDATE())))
              )
              AND (
                  @TruocThoiDiem IS NULL
                  OR tb.ThoiGianTao < @TruocThoiDiem
                  OR (tb.ThoiGianTao=@TruocThoiDiem AND tb.MaTB < @TruocMaTB)
              )
            ORDER BY tb.ThoiGianTao DESC, tb.MaTB DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<ThongBao>(
            sql,
            new
            {
                nhanVien.MaCN,
                nhanVien.MaNV,
                nhanVien.VaiTro,
                BoLoc = boLoc,
                SoLuong = soLuong,
                TruocThoiDiem = truocThoiDiem,
                TruocMaTB = truocMaTB,
            },
            PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<int> DemChuaDoc(NhanVien nhanVien)
    {
        var sql = $$"""
            SELECT COUNT(1)
            FROM ThongBao tb
            LEFT JOIN ThongBao_NguoiDoc nd ON nd.MaTB=tb.MaTB AND nd.MaNV=@MaNV
            WHERE {{DieuKienNguoiNhan}}
              AND nd.MaTB IS NULL
              AND (tb.TrangThai=N'DangMo' OR tb.ThoiGianTao>=DATEADD(DAY,-30,GETDATE()))
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { nhanVien.MaCN, nhanVien.MaNV, nhanVien.VaiTro }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<bool> DanhDauDaDoc(
        string maTB, NhanVien nhanVien, DateTime thoiGianDoc)
    {
        var sql = $$"""
            IF NOT EXISTS (
                SELECT 1 FROM ThongBao tb
                WHERE tb.MaTB=@MaTB AND {{DieuKienNguoiNhan}}
            )
                SELECT CAST(0 AS BIT);
            ELSE
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM ThongBao_NguoiDoc WHERE MaTB=@MaTB AND MaNV=@MaNV)
                    INSERT INTO ThongBao_NguoiDoc(MaTB,MaNV,ThoiGianDoc)
                    VALUES(@MaTB,@MaNV,@ThoiGianDoc);
                SELECT CAST(1 AS BIT);
            END
            """;
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<bool>(
            sql,
            new { MaTB = maTB, nhanVien.MaCN, nhanVien.MaNV, nhanVien.VaiTro, ThoiGianDoc = thoiGianDoc },
            PhienDuLieu.Session.Transaction);
    }

    public static async Task DanhDauTatCaDaDoc(NhanVien nhanVien, DateTime thoiGianDoc)
    {
        var sql = $$"""
            INSERT INTO ThongBao_NguoiDoc(MaTB,MaNV,ThoiGianDoc)
            SELECT tb.MaTB,@MaNV,@ThoiGianDoc
            FROM ThongBao tb
            WHERE {{DieuKienNguoiNhan}}
              AND (tb.TrangThai=N'DangMo' OR tb.ThoiGianTao>=DATEADD(DAY,-30,GETDATE()))
              AND NOT EXISTS (
                  SELECT 1 FROM ThongBao_NguoiDoc nd
                  WHERE nd.MaTB=tb.MaTB AND nd.MaNV=@MaNV
              )
            """;
        await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql,
            new { nhanVien.MaCN, nhanVien.MaNV, nhanVien.VaiTro, ThoiGianDoc = thoiGianDoc },
            PhienDuLieu.Session.Transaction);
    }

    public static async Task DongTacVu(
        string loaiSuKien,
        string maThamChieu,
        string? maNVXuLy,
        DateTime thoiGianXuLy,
        string trangThai)
    {
        const string sql = """
            UPDATE ThongBao
            SET TrangThai=@TrangThai, MaNVXuLy=@MaNVXuLy, ThoiGianXuLy=@ThoiGianXuLy
            WHERE LoaiSuKien=@LoaiSuKien
              AND MaThamChieu=@MaThamChieu
              AND LoaiThongBao=N'CanXuLy'
              AND TrangThai=N'DangMo'
            """;
        await PhienDuLieu.Session.Connection.ExecuteAsync(
            sql,
            new { LoaiSuKien = loaiSuKien, MaThamChieu = maThamChieu, MaNVXuLy = maNVXuLy, ThoiGianXuLy = thoiGianXuLy, TrangThai = trangThai },
            PhienDuLieu.Session.Transaction);
    }
}
