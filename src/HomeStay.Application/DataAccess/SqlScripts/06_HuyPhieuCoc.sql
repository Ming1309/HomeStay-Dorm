-- Nâng cấp idempotent cho UC Hủy phiếu cọc.
IF COL_LENGTH(N'PhieuCoc', N'ThoiDiemHuy') IS NULL
    ALTER TABLE PhieuCoc ADD ThoiDiemHuy DATETIME NULL;
GO

IF COL_LENGTH(N'PhieuCoc', N'MaNVHuy') IS NULL
    ALTER TABLE PhieuCoc ADD MaNVHuy VARCHAR(20) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name=N'FK_PhieuCoc_NhanVienHuy')
    ALTER TABLE PhieuCoc ADD CONSTRAINT FK_PhieuCoc_NhanVienHuy
        FOREIGN KEY (MaNVHuy) REFERENCES NhanVien(MaNV);
GO
