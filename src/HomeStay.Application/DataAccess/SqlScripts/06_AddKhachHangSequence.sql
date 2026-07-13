USE HomeStay;
GO

-- Nâng cấp idempotent cho database hiện hữu. Mã không thuần số được bỏ qua.
IF OBJECT_ID(N'dbo.Seq_KhachHang', N'SO') IS NULL
BEGIN
    DECLARE @SoThuTuTiepTheo BIGINT =
    (
        SELECT ISNULL(MAX(TRY_CONVERT(BIGINT, SUBSTRING(MaKH, 3, 18))), 0) + 1
        FROM KhachHang
        WHERE MaKH LIKE 'KH%'
          AND TRY_CONVERT(BIGINT, SUBSTRING(MaKH, 3, 18)) IS NOT NULL
    );

    DECLARE @Sql NVARCHAR(MAX) =
        N'CREATE SEQUENCE dbo.Seq_KhachHang AS BIGINT START WITH '
        + CONVERT(NVARCHAR(20), @SoThuTuTiepTheo)
        + N' INCREMENT BY 1;';
    EXEC sp_executesql @Sql;
END;
GO
