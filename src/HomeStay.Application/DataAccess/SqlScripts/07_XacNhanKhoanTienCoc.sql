USE HomeStay;
GO

IF COL_LENGTH(N'dbo.PhieuCoc', N'LyDoYeuCauBoSung') IS NULL
    ALTER TABLE PhieuCoc ADD LyDoYeuCauBoSung NVARCHAR(500) NULL;
GO

IF EXISTS (
    SELECT MaPhieuCoc
    FROM PhieuThu
    WHERE MaPhieuCoc IS NOT NULL
    GROUP BY MaPhieuCoc
    HAVING COUNT(*) > 1
)
    THROW 51020, 'Khong the tao unique index: mot PhieuCoc dang co nhieu PhieuThu.', 1;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name=N'UX_PhieuThu_MaPhieuCoc'
      AND object_id=OBJECT_ID(N'dbo.PhieuThu')
)
    CREATE UNIQUE INDEX UX_PhieuThu_MaPhieuCoc
        ON PhieuThu (MaPhieuCoc)
        WHERE MaPhieuCoc IS NOT NULL;
GO
