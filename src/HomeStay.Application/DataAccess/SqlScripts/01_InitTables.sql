-- ============================================================
-- SCRIPT TẠO CƠ SỞ DỮ LIỆU: HỆ THỐNG QUẢN LÝ NHÀ TRỌ
-- SQL Server
-- Constraint tách riêng bằng ALTER TABLE
-- ============================================================

USE master;
GO

IF EXISTS (SELECT name FROM sys.databases WHERE name = 'HomeStay')
    ALTER DATABASE HomeStay SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE HomeStay;
GO

CREATE DATABASE HomeStay;
GO

USE HomeStay;
GO

-- Cần bật để tạo computed column / filtered index (ChiTietHoaDon.ThanhTien, UX_PhieuThu_MaPhieuCoc)
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Sequence sinh mã khách hàng tuần tự (NEXT VALUE FOR dbo.Seq_KhachHang)
CREATE SEQUENCE dbo.Seq_KhachHang
    AS BIGINT
    START WITH 1
    INCREMENT BY 1;
GO

-- ============================================================
-- PHẦN 1: TẠO BẢNG (chỉ cột + kiểu dữ liệu + NULL/NOT NULL)
-- ============================================================

CREATE TABLE KhachHang (
    MaKH             VARCHAR(20)    NOT NULL,
    HoTen            NVARCHAR(100)  NOT NULL,
    NgaySinh         DATE           NULL,
    GioiTinh         NVARCHAR(10)   NULL,
    QuocTich         NVARCHAR(50)   NULL,
    LoaiGiayTo       NVARCHAR(50)   NULL,
    SoGiayTo         VARCHAR(30)    NULL,
    DiaChiThuongTru  NVARCHAR(200)  NULL,
    SDT              VARCHAR(20)    NULL,
    Email            VARCHAR(100)   NULL
);
GO

CREATE TABLE ChiNhanh (
    MaCN        VARCHAR(20)    NOT NULL,
    TenChiNhanh NVARCHAR(100)  NOT NULL,
    DiaChi      NVARCHAR(200)  NULL,
    SDT         VARCHAR(20)    NULL
);
GO

CREATE TABLE NhanVien (
    MaNV   VARCHAR(20)    NOT NULL,
    HoTen  NVARCHAR(100)  NOT NULL,
    SDT    VARCHAR(20)    NULL,
    VaiTro NVARCHAR(20)   NOT NULL,
    MaCN   VARCHAR(20)    NOT NULL
);
GO

CREATE TABLE TaiKhoan (
    MaTK                 VARCHAR(20)    NOT NULL,
    TenDangNhap          VARCHAR(100)   NOT NULL,
    MatKhauHash          NVARCHAR(500)  NOT NULL,
    TrangThai            NVARCHAR(20)   NOT NULL,
    LanDangNhapCuoi      DATETIME       NULL,
    Email                VARCHAR(100)   NULL,
    MaNV                 VARCHAR(20)    NOT NULL
);
GO

CREATE TABLE LoaiPhong (
    MaLP         VARCHAR(20)    NOT NULL,
    TenLoaiPhong NVARCHAR(200)  NOT NULL,
    SucChua      INT            NOT NULL,
    GiaThue      DECIMAL(18,2)  NOT NULL
);
GO

CREATE TABLE Phong (
    MaPhong         VARCHAR(20)   NOT NULL,
    SoPhong         NVARCHAR(20)  NOT NULL,
    ToaNha          NVARCHAR(50)  NULL,
    Tang            NVARCHAR(10)  NULL,
    GioiTinhChoPhep NVARCHAR(20)  NULL,
    TrangThai       NVARCHAR(20)  NOT NULL,
    MaLP            VARCHAR(20)   NOT NULL,
    MaCN            VARCHAR(20)   NOT NULL
);
GO

CREATE TABLE Giuong (
    MaGiuong  VARCHAR(20)   NOT NULL,
    SoGiuong  NVARCHAR(20)  NOT NULL,
    TrangThai NVARCHAR(20)  NOT NULL,
    MaPhong   VARCHAR(20)   NOT NULL
);
GO

CREATE TABLE QuyDinh (
    MaQD         VARCHAR(20)    NOT NULL,
    TenQD        NVARCHAR(200)  NOT NULL,
    LoaiQD       NVARCHAR(30)   NOT NULL,
    DuongDanFile NVARCHAR(500)  NOT NULL,
    NgayApDung   DATE           NOT NULL,
    NgayKetThuc  DATE           NULL
);
GO

CREATE TABLE ChinhSachHoanCoc (
    MaChinhSach            VARCHAR(20)    NOT NULL,
    TenChinhSach           NVARCHAR(200)  NOT NULL,
    TiLe_ChuaKy            DECIMAL(5,4)   NOT NULL,
    TiLe_TruocHan_NganHan  DECIMAL(5,4)   NOT NULL,
    TiLe_TruocHan_DaiHan   DECIMAL(5,4)   NOT NULL,
    TiLe_DungHan           DECIMAL(5,4)   NOT NULL,
    MocLuuTru              INT            NOT NULL,
    NgayApDung              DATE           NOT NULL,
    NgayKetThuc             DATE           NULL
);
GO

CREATE TABLE PhieuDangKy (
    MaPDK             VARCHAR(20)    NOT NULL,
    KhuVuc            NVARCHAR(100)  NULL,
    SoLuongNguoi      INT            NULL,
    LoaiDichVu        NVARCHAR(100)  NULL,
    MucGia            DECIMAL(18,2)  NULL,
    ThoiGianDuKienVao DATE           NULL,
    ThoiHanThue       INT            NULL,
    YeuCauKhac        NVARCHAR(500)  NULL,
    TrangThai         NVARCHAR(30)   NOT NULL,
    MaKH              VARCHAR(20)    NOT NULL,
    MaNV              VARCHAR(20)    NULL
);
GO



-- PhieuCoc
CREATE TABLE PhieuCoc (
    MaPhieuCoc   VARCHAR(20)    NOT NULL,
    HanThanhToan DATETIME       NULL,
    HinhThucThue NVARCHAR(20)   NOT NULL,
    SoGiuongThue INT            NOT NULL,
    TongTien     DECIMAL(18,2)  NOT NULL,
    ThoiDiemCoc  DATETIME       NOT NULL,
    AnhMinhChung NVARCHAR(500)  NULL,
    PhuongThucThanhToan NVARCHAR(20) NULL,
    LyDoYeuCauBoSung NVARCHAR(500) NULL,
    ThoiDiemHuy  DATETIME       NULL,
    MaNVHuy      VARCHAR(20)    NULL,
    TrangThai    NVARCHAR(20)   NOT NULL,
    MaKH         VARCHAR(20)    NOT NULL,
    MaPhong      VARCHAR(20)    NOT NULL,
    MaNV         VARCHAR(20)    NULL
);
GO

CREATE TABLE ThanhVienDangKy (
    MaPhieuCoc     VARCHAR(20)  NOT NULL,
    MaKH           VARCHAR(20)  NOT NULL,
    VaiTro         NVARCHAR(20) NOT NULL,
    TrangThaiDuyet NVARCHAR(20) NOT NULL
);
GO

CREATE TABLE ChiTietPhieuCoc (
    MaPhieuCoc VARCHAR(20)  NOT NULL,
    MaGiuong   VARCHAR(20)  NOT NULL
);
GO

CREATE TABLE HopDong (
    MaHD        VARCHAR(20)    NOT NULL,
    NgayKy      DATE           NULL,
    NgayBatDau  DATE           NOT NULL,
    NgayKetThuc DATE           NOT NULL,
    KyThanhToan INT            NULL,
    GiaThue     DECIMAL(18,2)  NOT NULL,
    DieuKhoan   NVARCHAR(MAX)  NULL,
    TrangThai   NVARCHAR(20)   NOT NULL,
    MaNV        VARCHAR(20)    NULL,
    MaPhieuCoc  VARCHAR(20)    NOT NULL,
    MaChinhSach VARCHAR(20)    NULL,
    MaQD        VARCHAR(20)    NULL,
    MaQLDuyet   VARCHAR(20)    NULL
);
GO

CREATE TABLE LichHen (
    MaLH        VARCHAR(20)  NOT NULL,
    NgayHen     DATE         NOT NULL,
    GioHen      TIME         NOT NULL,
    LoaiLichHen NVARCHAR(20) NOT NULL,
    TrangThai   NVARCHAR(20) NOT NULL,
    MaPDK       VARCHAR(20)  NULL,
    MaPhieuCoc  VARCHAR(20)  NULL,
    MaHD        VARCHAR(20)  NULL,
    MaNV        VARCHAR(20)  NULL,
    MaCN        VARCHAR(20)  NULL
);
GO

CREATE TABLE ChiTietHopDong (
    MaHD          VARCHAR(20)  NOT NULL,
    MaGiuong      VARCHAR(20)  NOT NULL,
    MaKH          VARCHAR(20)  NOT NULL,
    TrangThaiThue NVARCHAR(20) NOT NULL,
    NgayTra       DATE         NULL
);
GO

CREATE TABLE DichVu (
    MaDV      VARCHAR(20)    NOT NULL,
    TenDV     NVARCHAR(100)  NOT NULL,
    DonGia    DECIMAL(18,2)  NOT NULL,
    DonViTinh NVARCHAR(50)   NOT NULL,
    TrangThai NVARCHAR(20)   NOT NULL
);
GO

CREATE TABLE HopDong_DichVu (
    MaHD        VARCHAR(20)    NOT NULL,
    MaDV        VARCHAR(20)    NOT NULL,
    DonGiaKyKet DECIMAL(18,2)  NOT NULL
);
GO

CREATE TABLE TaiSan (
    MaTS        VARCHAR(20)    NOT NULL,
    TenTaiSan   NVARCHAR(100)  NOT NULL,
    LoaiTaiSan  NVARCHAR(30)   NOT NULL,
    GiaTri      DECIMAL(18,2)  NOT NULL,
    MoTa        NVARCHAR(500)  NULL,
    TrangThai   NVARCHAR(20)   NOT NULL
);
GO

CREATE TABLE Phong_TaiSan (
    MaPhong          VARCHAR(20)  NOT NULL,
    MaTS             VARCHAR(20)  NOT NULL,
    SoLuongTieuChuan INT          NOT NULL
);
GO

CREATE TABLE BienBanGiaoNhan (
    MaBienBan   VARCHAR(20)  NOT NULL,
    NgayBanGiao DATE         NOT NULL,
    LoaiBienBan NVARCHAR(20) NOT NULL,
    MaHD        VARCHAR(20)  NOT NULL,
    MaNV        VARCHAR(20)  NULL
);
GO

CREATE TABLE ChiTietGiaoNhan (
    MaBienBan VARCHAR(20)    NOT NULL,
    MaTS      VARCHAR(20)    NOT NULL,
    TinhTrang NVARCHAR(100)  NULL,
    SoLuong   INT            NOT NULL,
    GhiChu    NVARCHAR(500)  NULL,
    MinhChung NVARCHAR(500)  NULL
);
GO

CREATE TABLE HoaDon (
    MaHoaDon     VARCHAR(20)    NOT NULL,
    NgayLap      DATE           NOT NULL,
    HanThanhToan DATE           NULL,
    LoaiHoaDon   NVARCHAR(20)   NOT NULL,
    TongTien     DECIMAL(18,2)  NOT NULL,
    TrangThai    NVARCHAR(30)   NOT NULL,
    GhiChu       NVARCHAR(500)  NULL,
    MaHD         VARCHAR(20)    NOT NULL,
    MaNV         VARCHAR(20)    NULL
);
GO

CREATE TABLE ChiTietHoaDon (
    MaHoaDon     VARCHAR(20)    NOT NULL,
    STT          INT            NOT NULL,
    LoaiKhoanThu NVARCHAR(20)   NOT NULL,
    MaDV         VARCHAR(20)    NULL,
    MaTS         VARCHAR(20)    NULL,
    MaGiuong     VARCHAR(20)    NULL,
    SoLuong      DECIMAL(18,4)  NOT NULL,
    DonViTinh    NVARCHAR(50)   NULL,
    DonGia       DECIMAL(18,2)  NOT NULL,
    ThanhTien    AS (SoLuong * DonGia) PERSISTED
);
GO

CREATE TABLE PhieuDoiSoat (
    MaPDS       VARCHAR(20)    NOT NULL,
    NgayDoiSoat DATE           NOT NULL,
    TyLeHoanCoc DECIMAL(5,4)   NOT NULL,
    TongKhauTru DECIMAL(18,2)  NOT NULL,
    TienHoan    DECIMAL(18,2)  NOT NULL,
    TienThuThem DECIMAL(18,2)  NOT NULL,
    TrangThai   NVARCHAR(20)   NOT NULL,
    GhiChu      NVARCHAR(500)  NULL,
    MaHD        VARCHAR(20)    NULL,
    MaNV        VARCHAR(20)    NULL,
    MaPhieuCoc  VARCHAR(20)    NOT NULL,
    MaGiuong    VARCHAR(20)    NULL
);
GO

CREATE TABLE ChiTietDoiSoat (
    MaPDS    VARCHAR(20)  NOT NULL,
    MaHoaDon VARCHAR(20)  NOT NULL
);
GO

CREATE TABLE PhieuThu (
    MaPT                VARCHAR(20)    NOT NULL,
    SoTienThu           DECIMAL(18,2)  NOT NULL,
    ThoiGian            DATETIME       NOT NULL,
    PhuongThucThanhToan NVARCHAR(50)   NULL,
    AnhMinhChung        NVARCHAR(500)  NULL,
    MaHoaDon            VARCHAR(20)    NULL,
    MaPhieuCoc          VARCHAR(20)    NULL,
    MaPDS               VARCHAR(20)    NULL,
    MaNV                VARCHAR(20)    NULL
);
GO

CREATE TABLE PhieuHoanCoc (
    MaPHC            VARCHAR(20)    NOT NULL,
    SoTienHoan       DECIMAL(18,2)  NOT NULL,
    PhuongThucHoan   NVARCHAR(50)   NULL,
    ThongTinNhanTien NVARCHAR(300)  NULL,
    ThoiGian         DATETIME       NOT NULL,
    MaPDS            VARCHAR(20)    NOT NULL,
    MaNV             VARCHAR(20)    NULL
);
GO

CREATE TABLE ThongBao (
    MaTB         VARCHAR(20)    NOT NULL,
    TieuDe       NVARCHAR(200)  NOT NULL,
    NoiDung      NVARCHAR(500)  NOT NULL,
    VaiTroNhan   NVARCHAR(20)   NOT NULL,
    LienKet      NVARCHAR(200)  NULL,
    Tone         NVARCHAR(20)   NOT NULL,
    ThoiGianTao  DATETIME       NOT NULL,
    MaNVGui      VARCHAR(20)    NULL,
    MaThamChieu  VARCHAR(50)    NULL
);
GO

CREATE TABLE ThongBao_NguoiDoc (
    MaTB      VARCHAR(20)  NOT NULL,
    MaNV      VARCHAR(20)  NOT NULL,
    ThoiGianDoc DATETIME   NOT NULL
);
GO


-- ============================================================
-- PHẦN 2: PRIMARY KEY
-- ============================================================

ALTER TABLE KhachHang        ADD CONSTRAINT PK_KhachHang        PRIMARY KEY (MaKH);
ALTER TABLE ChiNhanh         ADD CONSTRAINT PK_ChiNhanh         PRIMARY KEY (MaCN);
ALTER TABLE NhanVien         ADD CONSTRAINT PK_NhanVien         PRIMARY KEY (MaNV);
ALTER TABLE TaiKhoan         ADD CONSTRAINT PK_TaiKhoan         PRIMARY KEY (MaTK);
ALTER TABLE LoaiPhong        ADD CONSTRAINT PK_LoaiPhong        PRIMARY KEY (MaLP);
ALTER TABLE Phong            ADD CONSTRAINT PK_Phong            PRIMARY KEY (MaPhong);
ALTER TABLE Giuong           ADD CONSTRAINT PK_Giuong           PRIMARY KEY (MaGiuong);
ALTER TABLE QuyDinh          ADD CONSTRAINT PK_QuyDinh          PRIMARY KEY (MaQD);
ALTER TABLE ChinhSachHoanCoc ADD CONSTRAINT PK_ChinhSachHoanCoc PRIMARY KEY (MaChinhSach);
ALTER TABLE PhieuDangKy      ADD CONSTRAINT PK_PhieuDangKy      PRIMARY KEY (MaPDK);

ALTER TABLE PhieuCoc         ADD CONSTRAINT PK_PhieuCoc         PRIMARY KEY (MaPhieuCoc);
ALTER TABLE ThanhVienDangKy  ADD CONSTRAINT PK_ThanhVienDangKy  PRIMARY KEY (MaPhieuCoc, MaKH);
ALTER TABLE ChiTietPhieuCoc  ADD CONSTRAINT PK_ChiTietPhieuCoc  PRIMARY KEY (MaPhieuCoc, MaGiuong);
ALTER TABLE HopDong          ADD CONSTRAINT PK_HopDong          PRIMARY KEY (MaHD);
ALTER TABLE LichHen          ADD CONSTRAINT PK_LichHen          PRIMARY KEY (MaLH);
ALTER TABLE ChiTietHopDong   ADD CONSTRAINT PK_ChiTietHopDong   PRIMARY KEY (MaHD, MaGiuong);
ALTER TABLE DichVu           ADD CONSTRAINT PK_DichVu           PRIMARY KEY (MaDV);
ALTER TABLE HopDong_DichVu   ADD CONSTRAINT PK_HopDong_DichVu   PRIMARY KEY (MaHD, MaDV);
ALTER TABLE TaiSan           ADD CONSTRAINT PK_TaiSan           PRIMARY KEY (MaTS);
ALTER TABLE Phong_TaiSan     ADD CONSTRAINT PK_Phong_TaiSan     PRIMARY KEY (MaPhong, MaTS);
ALTER TABLE BienBanGiaoNhan  ADD CONSTRAINT PK_BienBanGiaoNhan  PRIMARY KEY (MaBienBan);
ALTER TABLE ChiTietGiaoNhan  ADD CONSTRAINT PK_ChiTietGiaoNhan  PRIMARY KEY (MaBienBan, MaTS);
ALTER TABLE HoaDon           ADD CONSTRAINT PK_HoaDon           PRIMARY KEY (MaHoaDon);
ALTER TABLE ChiTietHoaDon    ADD CONSTRAINT PK_ChiTietHoaDon    PRIMARY KEY (MaHoaDon, STT);
ALTER TABLE PhieuDoiSoat     ADD CONSTRAINT PK_PhieuDoiSoat     PRIMARY KEY (MaPDS);
ALTER TABLE ChiTietDoiSoat   ADD CONSTRAINT PK_ChiTietDoiSoat   PRIMARY KEY (MaPDS, MaHoaDon);
ALTER TABLE PhieuThu         ADD CONSTRAINT PK_PhieuThu         PRIMARY KEY (MaPT);
ALTER TABLE PhieuHoanCoc     ADD CONSTRAINT PK_PhieuHoanCoc     PRIMARY KEY (MaPHC);
ALTER TABLE ThongBao         ADD CONSTRAINT PK_ThongBao         PRIMARY KEY (MaTB);
ALTER TABLE ThongBao_NguoiDoc ADD CONSTRAINT PK_ThongBao_NguoiDoc PRIMARY KEY (MaTB, MaNV);
GO

-- ============================================================
-- PHẦN 2.1: UNIQUE KEY
-- ============================================================

ALTER TABLE Phong        ADD CONSTRAINT UQ_Phong_SoPhong        UNIQUE (MaCN, SoPhong);
ALTER TABLE Giuong       ADD CONSTRAINT UQ_Giuong_SoGiuong      UNIQUE (MaPhong, SoGiuong);
ALTER TABLE KhachHang    ADD CONSTRAINT UQ_KhachHang_SoGiayTo   UNIQUE (SoGiayTo);
ALTER TABLE HopDong      ADD CONSTRAINT UQ_HopDong_PhieuCoc     UNIQUE (MaPhieuCoc);
ALTER TABLE TaiKhoan     ADD CONSTRAINT UQ_TaiKhoan_TenDangNhap UNIQUE (TenDangNhap);
ALTER TABLE TaiKhoan     ADD CONSTRAINT UQ_TaiKhoan_MaNV        UNIQUE (MaNV);
ALTER TABLE TaiSan       ADD CONSTRAINT UQ_TaiSan_TenTaiSan     UNIQUE (TenTaiSan);
CREATE UNIQUE INDEX UX_PhieuThu_MaPhieuCoc
    ON PhieuThu (MaPhieuCoc)
    WHERE MaPhieuCoc IS NOT NULL;
CREATE UNIQUE INDEX UX_PhieuThu_MaPDS
    ON PhieuThu (MaPDS)
    WHERE MaPDS IS NOT NULL;
CREATE UNIQUE INDEX UX_PhieuHoanCoc_MaPDS
    ON PhieuHoanCoc (MaPDS);
CREATE UNIQUE INDEX UX_ChinhSachHoanCoc_NgayApDung
    ON ChinhSachHoanCoc (NgayApDung);
GO


-- ============================================================
-- PHẦN 3: DEFAULT
-- ============================================================

ALTER TABLE Phong        ADD CONSTRAINT DF_Phong_TrangThai        DEFAULT N'Trong'        FOR TrangThai;
ALTER TABLE Giuong       ADD CONSTRAINT DF_Giuong_TrangThai       DEFAULT N'Trong'        FOR TrangThai;
ALTER TABLE PhieuDangKy  ADD CONSTRAINT DF_PhieuDangKy_TrangThai  DEFAULT N'DangXuLy'    FOR TrangThai;
ALTER TABLE DichVu       ADD CONSTRAINT DF_DichVu_TrangThai        DEFAULT N'DangApDung'  FOR TrangThai;
ALTER TABLE TaiSan       ADD CONSTRAINT DF_TaiSan_TrangThai        DEFAULT N'DangApDung'  FOR TrangThai;
ALTER TABLE PhieuCoc     ADD CONSTRAINT DF_PhieuCoc_ThoiDiemCoc   DEFAULT GETDATE()       FOR ThoiDiemCoc;
ALTER TABLE PhieuCoc     ADD CONSTRAINT DF_PhieuCoc_TrangThai      DEFAULT N'KhoiTao'     FOR TrangThai;
ALTER TABLE ThanhVienDangKy ADD CONSTRAINT DF_ThanhVienDangKy_TrangThaiDuyet DEFAULT N'ChoDuyet' FOR TrangThaiDuyet;
ALTER TABLE HopDong      ADD CONSTRAINT DF_HopDong_TrangThai       DEFAULT N'ChoKy'       FOR TrangThai;
ALTER TABLE LichHen      ADD CONSTRAINT DF_LichHen_TrangThai       DEFAULT N'DaXacNhan'  FOR TrangThai;
ALTER TABLE ChiTietHopDong ADD CONSTRAINT DF_ChiTietHopDong_TrangThaiThue DEFAULT N'DangThue' FOR TrangThaiThue;
ALTER TABLE HoaDon       ADD CONSTRAINT DF_HoaDon_NgayLap          DEFAULT CAST(GETDATE() AS DATE) FOR NgayLap;
ALTER TABLE HoaDon       ADD CONSTRAINT DF_HoaDon_TrangThai        DEFAULT N'ChuaThanhToan' FOR TrangThai;
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT DF_PhieuDoiSoat_NgayDoiSoat DEFAULT CAST(GETDATE() AS DATE) FOR NgayDoiSoat;
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT DF_PhieuDoiSoat_TongKhauTru DEFAULT 0             FOR TongKhauTru;
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT DF_PhieuDoiSoat_TienHoan   DEFAULT 0              FOR TienHoan;
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT DF_PhieuDoiSoat_TienThuThem DEFAULT 0             FOR TienThuThem;
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT DF_PhieuDoiSoat_TrangThai  DEFAULT N'DaChot'     FOR TrangThai;
ALTER TABLE PhieuThu     ADD CONSTRAINT DF_PhieuThu_ThoiGian       DEFAULT GETDATE()      FOR ThoiGian;
ALTER TABLE PhieuHoanCoc ADD CONSTRAINT DF_PhieuHoanCoc_ThoiGian   DEFAULT GETDATE()      FOR ThoiGian;
GO


-- ============================================================
-- PHẦN 4: CHECK
-- ============================================================

-- NhanVien
ALTER TABLE NhanVien ADD CONSTRAINT CK_NhanVien_VaiTro
    CHECK (VaiTro IN (N'Sale', N'KeToan', N'QuanLy', N'QuanTri'));

-- LoaiPhong
ALTER TABLE LoaiPhong ADD CONSTRAINT CK_LoaiPhong_SucChua
    CHECK (SucChua > 0);
ALTER TABLE LoaiPhong ADD CONSTRAINT CK_LoaiPhong_GiaThue
    CHECK (GiaThue >= 0);

-- Phong
ALTER TABLE Phong ADD CONSTRAINT CK_Phong_TrangThai
    CHECK (TrangThai IN (N'Trong', N'ConGiuongTrong', N'GiuCho', N'DaCoc', N'DangSuDung', N'DangBaoTri', N'NgungSuDung'));

-- Giuong
ALTER TABLE Giuong ADD CONSTRAINT CK_Giuong_TrangThai
    CHECK (TrangThai IN (N'Trong', N'GiuCho', N'DaCoc', N'DangSuDung', N'DangBaoTri', N'NgungSuDung'));

-- ChinhSachHoanCoc
ALTER TABLE ChinhSachHoanCoc ADD CONSTRAINT CK_ChinSach_TiLe_ChuaKy
    CHECK (TiLe_ChuaKy BETWEEN 0 AND 1);
ALTER TABLE ChinhSachHoanCoc ADD CONSTRAINT CK_ChinhSach_TiLe_TruocHan_NganHan
    CHECK (TiLe_TruocHan_NganHan BETWEEN 0 AND 1);
ALTER TABLE ChinhSachHoanCoc ADD CONSTRAINT CK_ChinhSach_TiLe_TruocHan_DaiHan
    CHECK (TiLe_TruocHan_DaiHan BETWEEN 0 AND 1);
ALTER TABLE ChinhSachHoanCoc ADD CONSTRAINT CK_ChinhSach_TiLe_DungHan
    CHECK (TiLe_DungHan BETWEEN 0 AND 1);
ALTER TABLE ChinhSachHoanCoc ADD CONSTRAINT CK_ChinhSach_MocLuuTru
    CHECK (MocLuuTru > 0);
ALTER TABLE ChinhSachHoanCoc ADD CONSTRAINT CK_ChinhSach_NgayKetThuc
    CHECK (NgayKetThuc IS NULL OR NgayKetThuc >= NgayApDung);

-- QuyDinh
ALTER TABLE QuyDinh ADD CONSTRAINT CK_QuyDinh_LoaiQD
    CHECK (LoaiQD IN (N'DieuKienLuuTru', N'NoiQuySinhHoat', N'HoSoPhapLyCuTru',
                      N'TaiChinhThanhToan', N'TaiSanTienIchAnToan', N'ViPhamBoiThuong'));
ALTER TABLE QuyDinh ADD CONSTRAINT CK_QuyDinh_NgayKetThuc
    CHECK (NgayKetThuc IS NULL OR NgayKetThuc > NgayApDung);

-- PhieuDangKy
ALTER TABLE PhieuDangKy ADD CONSTRAINT CK_PhieuDangKy_SoLuongNguoi
    CHECK (SoLuongNguoi > 0);
ALTER TABLE PhieuDangKy ADD CONSTRAINT CK_PhieuDangKy_TrangThai
    CHECK (TrangThai IN (N'DangXuLy', N'DaHenXemPhong', N'DaHuy'));

-- PhieuCoc
ALTER TABLE PhieuCoc ADD CONSTRAINT CK_PhieuCoc_SoGiuongThue
    CHECK (SoGiuongThue > 0);
ALTER TABLE PhieuCoc ADD CONSTRAINT CK_PhieuCoc_TongTien
    CHECK (TongTien >= 0);
ALTER TABLE PhieuCoc ADD CONSTRAINT CK_PhieuCoc_HinhThucThue
    CHECK (HinhThucThue IN (N'NguyenCan', N'OGhep'));
ALTER TABLE PhieuCoc ADD CONSTRAINT CK_PhieuCoc_PhuongThucThanhToan
    CHECK (PhuongThucThanhToan IS NULL OR PhuongThucThanhToan IN (N'ChuyenKhoan', N'TienMat'));
ALTER TABLE PhieuCoc ADD CONSTRAINT CK_PhieuCoc_TrangThai
    CHECK (TrangThai IN (N'KhoiTao', N'ChoThanhToan', N'ChoDoiChieu', N'DaThanhToan', N'ChoDuyet', N'DaDuyet', N'DaHuy'));

-- ThanhVienDangKy
ALTER TABLE ThanhVienDangKy ADD CONSTRAINT CK_ThanhVienDangKy_VaiTro
    CHECK (VaiTro IN (N'DaiDien', N'ThanhVien'));
ALTER TABLE ThanhVienDangKy ADD CONSTRAINT CK_ThanhVienDangKy_TrangThaiDuyet
    CHECK (TrangThaiDuyet IN (N'ChoDuyet', N'HopLe', N'TuChoi'));

-- HopDong
ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_GiaThue
    CHECK (GiaThue >= 0);
ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_NgayBatDau
    CHECK (NgayBatDau < NgayKetThuc);
ALTER TABLE HopDong ADD CONSTRAINT CK_HopDong_TrangThai
    CHECK (TrangThai IN (N'ChoKy', N'ChoThanhToan', N'ChoBanGiao', N'DangHieuLuc', N'DaThanhLy', N'DaHuy'));

-- LichHen
ALTER TABLE LichHen ADD CONSTRAINT CK_LichHen_LoaiLichHen
    CHECK (LoaiLichHen IN (N'XemPhong', N'NhanPhong', N'TraPhong'));
ALTER TABLE LichHen ADD CONSTRAINT CK_LichHen_TrangThai
    CHECK (TrangThai IN (N'DaXacNhan', N'DaHuy', N'VangMat', N'DaCheckin', N'DaHoanThanh'));

-- ChiTietHopDong
ALTER TABLE ChiTietHopDong ADD CONSTRAINT CK_ChiTietHopDong_TrangThaiThue
    CHECK (TrangThaiThue IN (N'DangThue', N'DaTra'));

-- DichVu
ALTER TABLE DichVu ADD CONSTRAINT CK_DichVu_DonGia
    CHECK (DonGia >= 0);
ALTER TABLE DichVu ADD CONSTRAINT CK_DichVu_TrangThai
    CHECK (TrangThai IN (N'DangApDung', N'NgungApDung'));

-- HopDong_DichVu
ALTER TABLE HopDong_DichVu ADD CONSTRAINT CK_HopDong_DichVu_DonGiaKyKet
    CHECK (DonGiaKyKet >= 0);

-- TaiSan
ALTER TABLE TaiSan ADD CONSTRAINT CK_TaiSan_GiaTri
    CHECK (GiaTri >= 0);
ALTER TABLE TaiSan ADD CONSTRAINT CK_TaiSan_LoaiTaiSan
    CHECK (LoaiTaiSan IN (N'NoiThat', N'ThietBiDien', N'TienIchBanGiao'));
ALTER TABLE TaiSan ADD CONSTRAINT CK_TaiSan_TrangThai
    CHECK (TrangThai IN (N'DangApDung', N'NgungApDung'));

-- Phong_TaiSan
ALTER TABLE Phong_TaiSan ADD CONSTRAINT CK_Phong_TaiSan_SoLuong
    CHECK (SoLuongTieuChuan >= 0);

-- BienBanGiaoNhan
ALTER TABLE BienBanGiaoNhan ADD CONSTRAINT CK_BienBanGiaoNhan_LoaiBienBan
    CHECK (LoaiBienBan IN (N'BanGiao', N'ThuHoi'));

-- ChiTietGiaoNhan
ALTER TABLE ChiTietGiaoNhan ADD CONSTRAINT CK_ChiTietGiaoNhan_SoLuong
    CHECK (SoLuong >= 0);

-- HoaDon
ALTER TABLE HoaDon ADD CONSTRAINT CK_HoaDon_TongTien
    CHECK (TongTien >= 0);
ALTER TABLE HoaDon ADD CONSTRAINT CK_HoaDon_LoaiHoaDon
    CHECK (LoaiHoaDon IN (N'TienThue', N'DichVu', N'BoiThuong', N'KyDau'));
ALTER TABLE HoaDon ADD CONSTRAINT CK_HoaDon_TrangThai
    CHECK (TrangThai IN (N'ChuaThanhToan', N'ThanhToanMotPhan', N'DaThanhToan'));

-- ChiTietHoaDon
ALTER TABLE ChiTietHoaDon ADD CONSTRAINT CK_ChiTietHoaDon_SoLuong
    CHECK (SoLuong > 0);
ALTER TABLE ChiTietHoaDon ADD CONSTRAINT CK_ChiTietHoaDon_DonGia
    CHECK (DonGia >= 0);
ALTER TABLE ChiTietHoaDon ADD CONSTRAINT CK_ChiTietHoaDon_LoaiKhoanThu
    CHECK (LoaiKhoanThu IN (N'TienThue', N'DichVu', N'BoiThuong', N'Khac'));

-- PhieuDoiSoat
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT CK_PhieuDoiSoat_TyLeHoanCoc
    CHECK (TyLeHoanCoc BETWEEN 0 AND 1);
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT CK_PhieuDoiSoat_TongKhauTru
    CHECK (TongKhauTru >= 0);
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT CK_PhieuDoiSoat_TienHoan
    CHECK (TienHoan >= 0);
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT CK_PhieuDoiSoat_TienThuThem
    CHECK (TienThuThem >= 0);
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT CK_PhieuDoiSoat_TrangThai
    CHECK (TrangThai IN (N'DaChot', N'DaTatToan'));

-- PhieuThu
ALTER TABLE PhieuThu ADD CONSTRAINT CK_PhieuThu_SoTienThu
    CHECK (SoTienThu > 0);
ALTER TABLE PhieuThu ADD CONSTRAINT CK_PhieuThu_MucDich
    CHECK (
        (MaHoaDon IS NOT NULL AND MaPhieuCoc IS NULL AND MaPDS IS NULL) OR
        (MaPhieuCoc IS NOT NULL AND MaHoaDon IS NULL AND MaPDS IS NULL) OR
        (MaPDS IS NOT NULL AND MaHoaDon IS NULL AND MaPhieuCoc IS NULL)
    );

-- PhieuHoanCoc
ALTER TABLE PhieuHoanCoc ADD CONSTRAINT CK_PhieuHoanCoc_SoTienHoan
    CHECK (SoTienHoan > 0);
GO


-- ============================================================
-- PHẦN 5: FOREIGN KEY
-- ============================================================

-- NhanVien
ALTER TABLE NhanVien ADD CONSTRAINT FK_NhanVien_ChiNhanh
    FOREIGN KEY (MaCN) REFERENCES ChiNhanh(MaCN);

ALTER TABLE TaiKhoan ADD CONSTRAINT FK_TaiKhoan_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);

-- Phong
ALTER TABLE Phong ADD CONSTRAINT FK_Phong_LoaiPhong
    FOREIGN KEY (MaLP) REFERENCES LoaiPhong(MaLP);
ALTER TABLE Phong ADD CONSTRAINT FK_Phong_ChiNhanh
    FOREIGN KEY (MaCN) REFERENCES ChiNhanh(MaCN);

-- Giuong
ALTER TABLE Giuong ADD CONSTRAINT FK_Giuong_Phong
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong);

-- PhieuDangKy
ALTER TABLE PhieuDangKy ADD CONSTRAINT FK_PhieuDangKy_KhachHang
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH);
ALTER TABLE PhieuDangKy ADD CONSTRAINT FK_PhieuDangKy_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);



-- PhieuCoc
ALTER TABLE PhieuCoc ADD CONSTRAINT FK_PhieuCoc_KhachHang
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH);

ALTER TABLE PhieuCoc ADD CONSTRAINT FK_PhieuCoc_Phong
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong);
ALTER TABLE PhieuCoc ADD CONSTRAINT FK_PhieuCoc_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);
ALTER TABLE PhieuCoc ADD CONSTRAINT FK_PhieuCoc_NhanVienHuy
    FOREIGN KEY (MaNVHuy) REFERENCES NhanVien(MaNV);

-- ThanhVienDangKy
ALTER TABLE ThanhVienDangKy ADD CONSTRAINT FK_ThanhVienDangKy_PhieuCoc
    FOREIGN KEY (MaPhieuCoc) REFERENCES PhieuCoc(MaPhieuCoc);
ALTER TABLE ThanhVienDangKy ADD CONSTRAINT FK_ThanhVienDangKy_KhachHang
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH);

-- ChiTietPhieuCoc
ALTER TABLE ChiTietPhieuCoc ADD CONSTRAINT FK_ChiTietPhieuCoc_PhieuCoc
    FOREIGN KEY (MaPhieuCoc) REFERENCES PhieuCoc(MaPhieuCoc);
ALTER TABLE ChiTietPhieuCoc ADD CONSTRAINT FK_ChiTietPhieuCoc_Giuong
    FOREIGN KEY (MaGiuong) REFERENCES Giuong(MaGiuong);

-- HopDong
ALTER TABLE HopDong ADD CONSTRAINT FK_HopDong_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);
ALTER TABLE HopDong ADD CONSTRAINT FK_HopDong_QLDuyet
    FOREIGN KEY (MaQLDuyet) REFERENCES NhanVien(MaNV);
ALTER TABLE HopDong ADD CONSTRAINT FK_HopDong_PhieuCoc
    FOREIGN KEY (MaPhieuCoc) REFERENCES PhieuCoc(MaPhieuCoc);
ALTER TABLE HopDong ADD CONSTRAINT FK_HopDong_ChinhSach
    FOREIGN KEY (MaChinhSach) REFERENCES ChinhSachHoanCoc(MaChinhSach);
ALTER TABLE HopDong ADD CONSTRAINT FK_HopDong_QuyDinh
    FOREIGN KEY (MaQD) REFERENCES QuyDinh(MaQD);

-- LichHen
ALTER TABLE LichHen ADD CONSTRAINT FK_LichHen_PhieuDangKy
    FOREIGN KEY (MaPDK) REFERENCES PhieuDangKy(MaPDK);
ALTER TABLE LichHen ADD CONSTRAINT FK_LichHen_PhieuCoc
    FOREIGN KEY (MaPhieuCoc) REFERENCES PhieuCoc(MaPhieuCoc);
ALTER TABLE LichHen ADD CONSTRAINT FK_LichHen_HopDong
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD);
ALTER TABLE LichHen ADD CONSTRAINT FK_LichHen_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);
ALTER TABLE LichHen ADD CONSTRAINT FK_LichHen_ChiNhanh
    FOREIGN KEY (MaCN) REFERENCES ChiNhanh(MaCN);



-- ChiTietHopDong
ALTER TABLE ChiTietHopDong ADD CONSTRAINT FK_ChiTietHopDong_HopDong
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD);
ALTER TABLE ChiTietHopDong ADD CONSTRAINT FK_ChiTietHopDong_Giuong
    FOREIGN KEY (MaGiuong) REFERENCES Giuong(MaGiuong);
ALTER TABLE ChiTietHopDong ADD CONSTRAINT FK_ChiTietHopDong_KhachHang
    FOREIGN KEY (MaKH) REFERENCES KhachHang(MaKH);

-- HopDong_DichVu
ALTER TABLE HopDong_DichVu ADD CONSTRAINT FK_HopDong_DichVu_HopDong
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD);
ALTER TABLE HopDong_DichVu ADD CONSTRAINT FK_HopDong_DichVu_DichVu
    FOREIGN KEY (MaDV) REFERENCES DichVu(MaDV);

-- Phong_TaiSan
ALTER TABLE Phong_TaiSan ADD CONSTRAINT FK_Phong_TaiSan_Phong
    FOREIGN KEY (MaPhong) REFERENCES Phong(MaPhong);
ALTER TABLE Phong_TaiSan ADD CONSTRAINT FK_Phong_TaiSan_TaiSan
    FOREIGN KEY (MaTS) REFERENCES TaiSan(MaTS);

-- BienBanGiaoNhan
ALTER TABLE BienBanGiaoNhan ADD CONSTRAINT FK_BienBanGiaoNhan_HopDong
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD);
ALTER TABLE BienBanGiaoNhan ADD CONSTRAINT FK_BienBanGiaoNhan_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);

-- ChiTietGiaoNhan
ALTER TABLE ChiTietGiaoNhan ADD CONSTRAINT FK_ChiTietGiaoNhan_BienBan
    FOREIGN KEY (MaBienBan) REFERENCES BienBanGiaoNhan(MaBienBan);
ALTER TABLE ChiTietGiaoNhan ADD CONSTRAINT FK_ChiTietGiaoNhan_TaiSan
    FOREIGN KEY (MaTS) REFERENCES TaiSan(MaTS);

-- HoaDon
ALTER TABLE HoaDon ADD CONSTRAINT FK_HoaDon_HopDong
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD);
ALTER TABLE HoaDon ADD CONSTRAINT FK_HoaDon_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);

-- ChiTietHoaDon
ALTER TABLE ChiTietHoaDon ADD CONSTRAINT FK_ChiTietHoaDon_HoaDon
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon);
ALTER TABLE ChiTietHoaDon ADD CONSTRAINT FK_ChiTietHoaDon_DichVu
    FOREIGN KEY (MaDV) REFERENCES DichVu(MaDV);
ALTER TABLE ChiTietHoaDon ADD CONSTRAINT FK_ChiTietHoaDon_TaiSan
    FOREIGN KEY (MaTS) REFERENCES TaiSan(MaTS);
ALTER TABLE ChiTietHoaDon ADD CONSTRAINT FK_ChiTietHoaDon_Giuong
    FOREIGN KEY (MaGiuong) REFERENCES Giuong(MaGiuong);

-- PhieuDoiSoat
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT FK_PhieuDoiSoat_HopDong
    FOREIGN KEY (MaHD) REFERENCES HopDong(MaHD);
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT FK_PhieuDoiSoat_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT FK_PhieuDoiSoat_PhieuCoc
    FOREIGN KEY (MaPhieuCoc) REFERENCES PhieuCoc(MaPhieuCoc);
ALTER TABLE PhieuDoiSoat ADD CONSTRAINT FK_PhieuDoiSoat_Giuong
    FOREIGN KEY (MaGiuong) REFERENCES Giuong(MaGiuong);

-- ChiTietDoiSoat
ALTER TABLE ChiTietDoiSoat ADD CONSTRAINT FK_ChiTietDoiSoat_PhieuDoiSoat
    FOREIGN KEY (MaPDS) REFERENCES PhieuDoiSoat(MaPDS);
ALTER TABLE ChiTietDoiSoat ADD CONSTRAINT FK_ChiTietDoiSoat_HoaDon
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon);

-- PhieuThu
ALTER TABLE PhieuThu ADD CONSTRAINT FK_PhieuThu_HoaDon
    FOREIGN KEY (MaHoaDon) REFERENCES HoaDon(MaHoaDon);
ALTER TABLE PhieuThu ADD CONSTRAINT FK_PhieuThu_PhieuCoc
    FOREIGN KEY (MaPhieuCoc) REFERENCES PhieuCoc(MaPhieuCoc);
ALTER TABLE PhieuThu ADD CONSTRAINT FK_PhieuThu_PhieuDoiSoat
    FOREIGN KEY (MaPDS) REFERENCES PhieuDoiSoat(MaPDS);
ALTER TABLE PhieuThu ADD CONSTRAINT FK_PhieuThu_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);

-- PhieuHoanCoc
ALTER TABLE PhieuHoanCoc ADD CONSTRAINT FK_PhieuHoanCoc_PhieuDoiSoat
    FOREIGN KEY (MaPDS) REFERENCES PhieuDoiSoat(MaPDS);
ALTER TABLE PhieuHoanCoc ADD CONSTRAINT FK_PhieuHoanCoc_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);

-- ThongBao
ALTER TABLE ThongBao ADD CONSTRAINT CK_ThongBao_VaiTroNhan
    CHECK (VaiTroNhan IN (N'Sale', N'KeToan', N'QuanLy', N'QuanTri'));
ALTER TABLE ThongBao ADD CONSTRAINT CK_ThongBao_Tone
    CHECK (Tone IN (N'blue', N'green', N'orange'));
ALTER TABLE ThongBao ADD CONSTRAINT FK_ThongBao_NhanVienGui
    FOREIGN KEY (MaNVGui) REFERENCES NhanVien(MaNV);

-- ThongBao_NguoiDoc
ALTER TABLE ThongBao_NguoiDoc ADD CONSTRAINT FK_ThongBao_NguoiDoc_ThongBao
    FOREIGN KEY (MaTB) REFERENCES ThongBao(MaTB);
ALTER TABLE ThongBao_NguoiDoc ADD CONSTRAINT FK_ThongBao_NguoiDoc_NhanVien
    FOREIGN KEY (MaNV) REFERENCES NhanVien(MaNV);
GO

PRINT N'✅ Tạo cơ sở dữ liệu HomeStay thành công!';
GO
