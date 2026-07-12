USE HomeStay;
GO

IF COL_LENGTH(N'dbo.PhieuCoc', N'PhuongThucThanhToan') IS NULL
    ALTER TABLE PhieuCoc ADD PhuongThucThanhToan NVARCHAR(20) NULL;
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_PhieuCoc_PhuongThucThanhToan'
      AND parent_object_id = OBJECT_ID(N'dbo.PhieuCoc')
)
    ALTER TABLE PhieuCoc ADD CONSTRAINT CK_PhieuCoc_PhuongThucThanhToan
        CHECK (PhuongThucThanhToan IS NULL OR PhuongThucThanhToan IN (N'ChuyenKhoan', N'TienMat'));
GO

UPDATE pc
SET pc.PhuongThucThanhToan = pt.PhuongThucThanhToan
FROM PhieuCoc pc
INNER JOIN PhieuThu pt ON pt.MaPhieuCoc = pc.MaPhieuCoc
WHERE pc.PhuongThucThanhToan IS NULL
  AND pt.PhuongThucThanhToan IN (N'ChuyenKhoan', N'TienMat');
GO
