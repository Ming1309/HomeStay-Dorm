namespace HomeStay.Application.DataAccess.DbConnections;

using Dapper;

public sealed class AuthDatabaseInitializer(ISqlConnectionFactory factory)
{
    public async Task TryInitializeAsync()
    {
        try
        {
            using var connection = factory.CreateConnection();
            await connection.ExecuteAsync("""
                IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name=N'CK_NhanVien_VaiTro')
                    ALTER TABLE NhanVien DROP CONSTRAINT CK_NhanVien_VaiTro;
                IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name=N'CK_NhanVien_VaiTro')
                    ALTER TABLE NhanVien ADD CONSTRAINT CK_NhanVien_VaiTro CHECK (VaiTro IN (N'Sale',N'KeToan',N'QuanLy',N'QuanTri'));
                IF COL_LENGTH(N'TaiKhoan', N'BatBuocDoiMatKhau') IS NOT NULL
                BEGIN
                    DECLARE @TenRangBuocMacDinh SYSNAME;
                    DECLARE @Sql NVARCHAR(MAX);
                    SELECT @TenRangBuocMacDinh = dc.name FROM sys.default_constraints dc
                    INNER JOIN sys.columns c ON c.default_object_id = dc.object_id
                    WHERE c.object_id = OBJECT_ID(N'TaiKhoan') AND c.name = N'BatBuocDoiMatKhau';
                    IF @TenRangBuocMacDinh IS NOT NULL
                    BEGIN
                        SET @Sql = N'ALTER TABLE TaiKhoan DROP CONSTRAINT ' + QUOTENAME(@TenRangBuocMacDinh);
                        EXEC(@Sql);
                    END;
                    ALTER TABLE TaiKhoan DROP COLUMN BatBuocDoiMatKhau;
                END;
                IF OBJECT_ID(N'TaiKhoan',N'U') IS NULL
                BEGIN
                    CREATE TABLE TaiKhoan (
                        MaTK VARCHAR(20) NOT NULL CONSTRAINT PK_TaiKhoan PRIMARY KEY,
                        TenDangNhap VARCHAR(100) NOT NULL CONSTRAINT UQ_TaiKhoan_TenDangNhap UNIQUE,
                        MatKhauHash NVARCHAR(500) NOT NULL,
                        TrangThai NVARCHAR(20) NOT NULL CONSTRAINT DF_TaiKhoan_TrangThai DEFAULT N'HoatDong',
                        LanDangNhapCuoi DATETIME NULL,
                        Email VARCHAR(100) NULL,
                        MaNV VARCHAR(20) NOT NULL CONSTRAINT UQ_TaiKhoan_MaNV UNIQUE,
                        CONSTRAINT FK_TaiKhoan_NhanVien FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV),
                        CONSTRAINT CK_TaiKhoan_TrangThai CHECK (TrangThai IN (N'HoatDong',N'Khoa',N'VoHieuHoa',N'NgungLamViec',N'LuuTru'))
                    );
                END;
                IF NOT EXISTS (SELECT 1 FROM NhanVien WHERE MaNV='NV_ADMIN')
                    INSERT INTO NhanVien (MaNV,HoTen,VaiTro,MaCN) VALUES ('NV_ADMIN',N'Quản trị hệ thống',N'QuanTri','CN01');
                IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap='admin')
                    INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,MaNV)
                    VALUES ('TK_NV_ADMIN','admin',N'PBKDF2$SHA256$100000$mu9HAkvv6zoBdUrO6ePtUw==$vTl/473eLaKxNKUZFkqqj3WXFBWQXP2ssjpyJ+jY7vM=',N'HoatDong','admin@homestay.local','NV_ADMIN');
                IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap='sale')
                    INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,MaNV)
                    VALUES ('TK_NV03','sale',N'PBKDF2$SHA256$100000$dLIuV5UGQzKyKZcQL8M4jA==$JN7beaNDY1/eETauPDK9PwxDyy4pQpVYrrCRg9ySKK8=',N'HoatDong','sale@homestay.local','NV03');
                IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap='ketoan')
                    INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,MaNV)
                    VALUES ('TK_NV02','ketoan',N'PBKDF2$SHA256$100000$mGwY37WGWPER5+xEUaFd4w==$FmHdNo2ptldw7QjDCLdX826uZygk4LtP+FpFZYZ9VaU=',N'HoatDong','ketoan@homestay.local','NV02');
                IF NOT EXISTS (SELECT 1 FROM TaiKhoan WHERE TenDangNhap='quanly')
                    INSERT INTO TaiKhoan (MaTK,TenDangNhap,MatKhauHash,TrangThai,Email,MaNV)
                    VALUES ('TK_NV01','quanly',N'PBKDF2$SHA256$100000$VsfBFOVmI0RDLSWa22Nhnw==$zTri9Dwr2uwUMRyOK6wj2gV65SiHhNCTJF1F5oGgDe8=',N'HoatDong','quanly@homestay.local','NV01');
                """);
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"Không thể tự khởi tạo schema xác thực: {ex.Message}. Hãy chạy 03_Auth.sql trước khi đăng nhập.");
        }
    }
}
