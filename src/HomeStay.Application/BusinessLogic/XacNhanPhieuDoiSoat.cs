namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class XacNhanPhieuDoiSoat(
    Func<PhienDuLieu> taoPhienDuLieu,
    TimeProvider timeProvider,
    DichVuThongBao dichVuThongBao)
{
    public async Task<IReadOnlyList<DoiSoatChoXacNhanItemDto>> LayDanhSachChoXacNhan()
    {
        using var phien = taoPhienDuLieu();
        var danhSach = await PhieuDoiSoat.LayDanhSachChoXacNhan();
        var ketQua = new List<DoiSoatChoXacNhanItemDto>();
        foreach (var pds in danhSach)
        {
            var phieuCoc = await DocPhieuCocVaKiemTraDuLieuNen(pds);
            var (loaiKetQua, soTienKetQua) = pds.XacDinhKetQua();
            ketQua.Add(new DoiSoatChoXacNhanItemDto
            {
                MaPDS = pds.MaPDS,
                MaHD = pds.MaHD,
                MaPhieuCoc = pds.MaPhieuCoc,
                NgayDoiSoat = pds.NgayDoiSoat,
                TenKhachHang = phieuCoc.KhachHang.HoTen,
                SoDienThoai = ChuanHoaTuyChon(phieuCoc.KhachHang.SDT),
                Phong = TaoTenPhong(phieuCoc),
                LoaiKetQua = loaiKetQua,
                SoTienKetQua = soTienKetQua,
                TrangThai = pds.TrangThai,
            });
        }

        return ketQua;
    }

    public async Task<ChiTietDoiSoatChoXacNhanDto> LayChiTiet(string maPDS)
    {
        using var phien = taoPhienDuLieu();
        var pds = await PhieuDoiSoat.LayChiTietPhieuDoiSoat(maPDS.Trim())
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu đối soát.");
        KiemTraDangChoXacNhan(pds);

        var phieuCoc = await DocPhieuCocVaKiemTraDuLieuNen(pds);
        pds.HoaDons = (await HoaDon.LayDSHoaDonTheoPhieuDoiSoat(pds.MaPDS)).ToList();
        return TaoChiTietDto(pds, phieuCoc);
    }

    public async Task<PhieuDoiSoat> XacNhan(string maPDS, bool khachHangDongY, string maNhanVien)
    {
        if (!khachHangDongY)
            throw new ArgumentException("Cần xác nhận khách hàng đã đồng ý kết quả đối soát.", nameof(khachHangDongY));

        using var phien = taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var pds = await PhieuDoiSoat.LayChiTietChoCapNhat(maPDS.Trim())
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu đối soát.");
            KiemTraDangChoXacNhan(pds);

            // Luôn đọc lại hồ sơ trong transaction. Client chỉ gửi xác nhận và ghi chú,
            // không được quyết định khách/phòng/số tiền hay điều kiện xử lý.
            var phieuCoc = await DocPhieuCocVaKiemTraDuLieuNen(pds);
            KiemTraCoKenhLienHe(phieuCoc.KhachHang);

            await pds.XacNhanKhachHangDongY(maNhanVien, timeProvider.GetLocalNow().DateTime);

            if (pds.TrangThai == "DaChot" && pds.TienThuThem > 0)
            {
                await dichVuThongBao.GuiThongBaoKeToan(
                    "Đối soát đã xác nhận - cần thu thêm",
                    $"Phiếu đối soát {pds.MaPDS} đã được Quản lý xác nhận, cần thu thêm {pds.TienThuThem:N0} VNĐ.",
                    "/accountant/payments", maNhanVien, pds.MaPDS);
            }
            else if (pds.TrangThai == "DaChot" && pds.TienHoan > 0 && pds.MaHD is null)
            {
                await dichVuThongBao.GuiThongBaoKeToan(
                    "Đối soát đã xác nhận - cần hoàn cọc",
                    $"Phiếu đối soát {pds.MaPDS} đã được Quản lý xác nhận, cần hoàn {pds.TienHoan:N0} VNĐ.",
                    "/accountant/refunds", maNhanVien, pds.MaPDS);
            }

            phien.Commit();
            return pds;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    private static async Task<PhieuCoc> DocPhieuCocVaKiemTraDuLieuNen(PhieuDoiSoat pds)
    {
        var phieuCoc = await PhieuCoc.DocChiTiet(pds.MaPhieuCoc)
            ?? throw new InvalidOperationException(
                $"Không tìm thấy khách hàng, phòng hoặc phiếu cọc {pds.MaPhieuCoc}. Vui lòng tải lại hàng đợi.");

        if (string.IsNullOrWhiteSpace(phieuCoc.KhachHang.MaKH)
            || string.IsNullOrWhiteSpace(phieuCoc.KhachHang.HoTen)
            || string.IsNullOrWhiteSpace(phieuCoc.Phong.MaPhong)
            || string.IsNullOrWhiteSpace(phieuCoc.Phong.SoPhong)
            || phieuCoc.TongTien <= 0)
            throw new InvalidOperationException(
                "Hồ sơ thiếu thông tin khách hàng, phòng hoặc tiền cọc. Vui lòng yêu cầu bộ phận liên quan cập nhật.");

        return phieuCoc;
    }

    private static void KiemTraDangChoXacNhan(PhieuDoiSoat pds)
    {
        if (pds.TrangThai != "ChoXacNhan")
            throw new InvalidOperationException("Phiếu đối soát không còn chờ xác nhận. Vui lòng tải lại hàng đợi.");
    }

    private static void KiemTraCoKenhLienHe(KhachHang khachHang)
    {
        if (!khachHang.CoKenhLienHe())
            throw new InvalidOperationException(
                "Khách hàng chưa có số điện thoại hoặc email. Yêu cầu Sale cập nhật thông tin khách hàng trước khi xác nhận.");
    }

    private static ChiTietDoiSoatChoXacNhanDto TaoChiTietDto(PhieuDoiSoat pds, PhieuCoc phieuCoc)
    {
        var khachHang = phieuCoc.KhachHang;
        var (loaiKetQua, soTienKetQua) = pds.XacDinhKetQua();
        var coKenhLienHe = khachHang.CoKenhLienHe();
        return new ChiTietDoiSoatChoXacNhanDto
        {
            MaPDS = pds.MaPDS,
            MaHD = pds.MaHD,
            MaPhieuCoc = pds.MaPhieuCoc,
            NgayDoiSoat = pds.NgayDoiSoat,
            TenKhachHang = khachHang.HoTen,
            SoDienThoai = ChuanHoaTuyChon(khachHang.SDT),
            Email = ChuanHoaTuyChon(khachHang.Email),
            SoGiayTo = ChuanHoaTuyChon(khachHang.SoGiayTo),
            Phong = TaoTenPhong(phieuCoc),
            SoTienCoc = phieuCoc.TongTien,
            TyLeHoanCoc = pds.TyLeHoanCoc,
            TienHoanCoBan = phieuCoc.TongTien * pds.TyLeHoanCoc,
            TongKhauTru = pds.TongKhauTru,
            TienHoan = pds.TienHoan,
            TienThuThem = pds.TienThuThem,
            LoaiKetQua = loaiKetQua,
            SoTienKetQua = soTienKetQua,
            TrangThai = pds.TrangThai,
            GhiChu = pds.GhiChu,
            DuDieuKienXacNhan = coKenhLienHe,
            LyDoKhongDuDieuKien = coKenhLienHe
                ? null
                : "Yêu cầu Sale cập nhật thông tin khách hàng: cần có số điện thoại hoặc email.",
            HoaDons = pds.HoaDons.Select(x => new HoaDonDoiSoatChoXacNhanDto
            {
                MaHoaDon = x.MaHoaDon,
                LoaiHoaDon = x.LoaiHoaDon,
                TongTien = x.TongTien,
                NgayLap = x.NgayLap,
            }).ToList(),
        };
    }

    private static string TaoTenPhong(PhieuCoc phieuCoc) =>
        string.IsNullOrWhiteSpace(phieuCoc.Phong.ToaNha)
            ? phieuCoc.Phong.SoPhong
            : $"{phieuCoc.Phong.ToaNha} - {phieuCoc.Phong.SoPhong}";

    private static string ChuanHoaTuyChon(string? giaTri) => giaTri?.Trim() ?? string.Empty;
}

public sealed class DoiSoatChoXacNhanItemDto
{
    public string MaPDS { get; set; } = string.Empty;
    public string? MaHD { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public DateTime NgayDoiSoat { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string Phong { get; set; } = string.Empty;
    public string LoaiKetQua { get; set; } = string.Empty;
    public decimal SoTienKetQua { get; set; }
    public string TrangThai { get; set; } = string.Empty;
}

public sealed class ChiTietDoiSoatChoXacNhanDto
{
    public string MaPDS { get; set; } = string.Empty;
    public string? MaHD { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public DateTime NgayDoiSoat { get; set; }
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SoGiayTo { get; set; } = string.Empty;
    public string Phong { get; set; } = string.Empty;
    public decimal SoTienCoc { get; set; }
    public decimal TyLeHoanCoc { get; set; }
    public decimal TienHoanCoBan { get; set; }
    public decimal TongKhauTru { get; set; }
    public decimal TienHoan { get; set; }
    public decimal TienThuThem { get; set; }
    public string LoaiKetQua { get; set; } = string.Empty;
    public decimal SoTienKetQua { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public bool DuDieuKienXacNhan { get; set; }
    public string? LyDoKhongDuDieuKien { get; set; }
    public IReadOnlyList<HoaDonDoiSoatChoXacNhanDto> HoaDons { get; set; } = [];
}

public sealed class HoaDonDoiSoatChoXacNhanDto
{
    public string MaHoaDon { get; set; } = string.Empty;
    public string LoaiHoaDon { get; set; } = string.Empty;
    public decimal TongTien { get; set; }
    public DateTime NgayLap { get; set; }
}
