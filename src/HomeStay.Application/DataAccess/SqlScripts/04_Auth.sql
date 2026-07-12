-- Migration xác thực tài khoản. Chạy sau 01_InitTables.sql và các seed hiện tại.
USE HomeStay;
GO

IF COL_LENGTH(N'TaiKhoan', N'BatBuocDoiMatKhau') IS NOT NULL
BEGIN
    DECLARE @TenRangBuocMacDinh SYSNAME;
    DECLARE @Sql NVARCHAR(MAX);
    SELECT @TenRangBuocMacDinh = dc.name
    FROM sys.default_constraints dc
    INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
    WHERE c.object_id = OBJECT_ID(N'TaiKhoan') AND c.name = N'BatBuocDoiMatKhau';

    IF @TenRangBuocMacDinh IS NOT NULL
    BEGIN
        SET @Sql = N'ALTER TABLE TaiKhoan DROP CONSTRAINT ' + QUOTENAME(@TenRangBuocMacDinh);
        EXEC(@Sql);
    END;

    ALTER TABLE TaiKhoan DROP COLUMN BatBuocDoiMatKhau;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID(N'NhanVien') AND name = N'VaiTro')
    THROW 50000, 'Không tìm thấy bảng NhanVien.', 1;
GO

IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_NhanVien_VaiTro')
    ALTER TABLE NhanVien DROP CONSTRAINT CK_NhanVien_VaiTro;
GO
ALTER TABLE NhanVien ADD CONSTRAINT CK_NhanVien_VaiTro
    CHECK (VaiTro IN (N'Sale', N'KeToan', N'QuanLy', N'QuanTri'));
GO

IF OBJECT_ID(N'TaiKhoan', N'U') IS NULL
BEGIN
    CREATE TABLE TaiKhoan (
        MaTK VARCHAR(20) NOT NULL CONSTRAINT PK_TaiKhoan PRIMARY KEY,
        TenDangNhap VARCHAR(100) NOT NULL CONSTRAINT UQ_TaiKhoan_TenDangNhap UNIQUE,
        MatKhauHash NVARCHAR(500) NOT NULL,
        TrangThai NVARCHAR(20) NOT NULL CONSTRAINT DF_TaiKhoan_TrangThai DEFAULT N'HoatDong',
        LanDangNhapCuoi DATETIME NULL,
        Email VARCHAR(100) NULL,
        PhongBan NVARCHAR(100) NULL,
        MaNV VARCHAR(20) NOT NULL CONSTRAINT UQ_TaiKhoan_MaNV UNIQUE,
        CONSTRAINT FK_TaiKhoan_NhanVien FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
        CONSTRAINT CK_TaiKhoan_TrangThai CHECK (TrangThai IN (N'HoatDong', N'Khoa', N'VoHieuHoa', N'NgungLamViec', N'LuuTru'))
    );
END;
GO

IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE MaNV = 'NV_ADMIN')
    INSERT INTO NhanVien (MaNV, HoTen, SDT, VaiTro, MaCN) VALUES ('NV_ADMIN', N'Quản trị hệ thống', NULL, N'QuanTri', 'CN01');
GO

-- Tài khoản mặc định chỉ dùng cho môi trường phát triển; hãy đổi mật khẩu ngay lần đăng nhập đầu.
IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'admin')
    INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,PhongBan,MaNV)
    VALUES ('TK_NV_ADMIN','admin',N'PBKDF2$SHA256$100000$mu9HAkvv6zoBdUrO6ePtUw==$vTl/473eLaKxNKUZFkqqj3WXFBWQXP2ssjpyJ+jY7vM=',N'HoatDong','admin@homestay.local',N'Quản trị','NV_ADMIN');
GO

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'sale')
    INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,PhongBan,MaNV)
    VALUES ('TK_NV03','sale',N'PBKDF2$SHA256$100000$dLIuV5UGQzKyKZcQL8M4jA==$JN7beaNDY1/eETauPDK9PwxDyy4pQpVYrrCRg9ySKK8=',N'HoatDong','sale@homestay.local',N'Kinh doanh','NV03');
GO

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'ketoan')
    INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,PhongBan,MaNV)
    VALUES ('TK_NV02','ketoan',N'PBKDF2$SHA256$100000$mGwY37WGWPER5+xEUaFd4w==$FmHdNo2ptldw7QjDCLdX826uZygk4LtP+FpFZYZ9VaU=',N'HoatDong','ketoan@homestay.local',N'Tài chính','NV02');
GO

IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap = 'quanly')
    INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,PhongBan,MaNV)
    VALUES ('TK_NV01','quanly',N'PBKDF2$SHA256$100000$VsfBFOVmI0RDLSWa22Nhnw==$zTri9Dwr2uwUMRyOK6wj2gV65SiHhNCTJF1F5oGgDe8=',N'HoatDong','quanly@homestay.local',N'Quản lý','NV01');
GO
