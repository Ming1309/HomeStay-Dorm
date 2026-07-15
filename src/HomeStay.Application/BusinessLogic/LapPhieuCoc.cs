namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class LapPhieuCoc
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly DichVuThongBao _thongBao;

    public LapPhieuCoc(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider, DichVuThongBao thongBao)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _thongBao = thongBao;
    }

    public async Task<IReadOnlyList<LichHen>> LayDanhSachKhachChoCoc(string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await LichHen.LayDanhSachKhachChoCoc(nhanVien.MaCN);
    }

    public async Task<IReadOnlyList<LichHen>> TimKiemKhachChoCoc(string text, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await LichHen.LayDanhSachKhachChoCoc(nhanVien.MaCN, text);
    }

    public async Task<LichHen?> LayChiTietLichHen(string maLichHen, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await LichHen.DocChiTiet(maLichHen, nhanVien.MaCN);
    }

    public async Task<IReadOnlyList<Phong>> LayPhongOGhep(int soLuong, string? toaNha, string? loaiPhong,
        decimal giaMin, decimal giaMax, string? gioiTinh, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await Phong.LayPhongOGhep(soLuong, toaNha, loaiPhong, giaMin, giaMax,
            nhanVien.MaCN, ChuanHoaGioiTinh(gioiTinh));
    }

    public async Task<IReadOnlyList<Phong>> LayPhongNguyenCan(string? toaNha, string? loaiPhong,
        decimal giaMin, decimal giaMax, string? gioiTinh, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return await Phong.LayPhongNguyenCan(toaNha, loaiPhong, giaMin, giaMax,
            nhanVien.MaCN, ChuanHoaGioiTinh(gioiTinh));
    }

    public async Task<PhieuCoc> TaoPhieuCoc(string maLichHen, KhachHang thongTinKhachHang,
        string maPhong, IEnumerable<string> danhSachGiuong, string hinhThucThue, string? maNhanVien)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var nhanVien = await NhanVien.DocPhamVi(maNhanVien);
            var lichHen = await LichHen.DocChiTiet(maLichHen, nhanVien.MaCN, khoaCapNhat: true)
                ?? throw new KeyNotFoundException("Không tìm thấy lịch hẹn.");
            lichHen.KiemTraCoTheLapPhieuCoc();
            if (hinhThucThue is not ("OGhep" or "NguyenCan"))
                throw new ArgumentException("Hình thức thuê không hợp lệ.");

            KiemTraThongTinKhachHang(thongTinKhachHang);
            var khachHang = lichHen.KhachHang!;
            if (khachHang.CapNhatTu(thongTinKhachHang))
                await khachHang.CapNhat();

            var phong = await Phong.DocChiTiet(maPhong, nhanVien.MaCN)
                ?? throw new KeyNotFoundException("Không tìm thấy phòng.");
            if (!phong.KiemTraGioiTinhChoPhep([khachHang]))
                throw new InvalidOperationException("Phòng không phù hợp với giới tính của khách hàng.");
            var giuongs = hinhThucThue == "NguyenCan"
                ? phong.GiuNguyenPhong()
                : phong.GiuGiuong(danhSachGiuong);

            var phieuCoc = PhieuCoc.TaoMoi(hinhThucThue, khachHang, phong, giuongs,
                maNhanVien, _timeProvider.GetLocalNow().DateTime);
            await phieuCoc.Them();
            lichHen.GanPhieuCoc(phieuCoc.MaPhieuCoc);
            await phong.CapNhat();
            await lichHen.LuuPhieuCoc();
            await _thongBao.PhatCanXuLyTheoVaiTro(
                LoaiSuKienThongBao.PhieuCocChoTinhTien,
                phieuCoc.MaCN,
                "KeToan",
                "Phiếu cọc mới cần tính tiền",
                $"Phiếu cọc {phieuCoc.MaPhieuCoc} của {khachHang.HoTen} đang chờ xác định số tiền cọc.",
                $"/accountant/deposit-calc?maPhieuCoc={Uri.EscapeDataString(phieuCoc.MaPhieuCoc)}",
                phieuCoc.MaPhieuCoc,
                maNhanVien);
            phien.Commit();
            return phieuCoc;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    private static string? ChuanHoaGioiTinh(string? gioiTinh)
    {
        if (string.IsNullOrWhiteSpace(gioiTinh)) return null;
        var giaTri = gioiTinh.Trim();
        if (giaTri == "Nu") return "Nữ";
        if (giaTri is not ("Nam" or "Nữ"))
            throw new ArgumentException("Giới tính dùng để tìm phòng không hợp lệ.");
        return giaTri;
    }

    private static void KiemTraThongTinKhachHang(KhachHang khachHang)
    {
        if (string.IsNullOrWhiteSpace(khachHang.HoTen))
            throw new ArgumentException("Vui lòng nhập họ tên của khách hàng.");
        if (string.IsNullOrWhiteSpace(khachHang.QuocTich))
            throw new ArgumentException("Vui lòng nhập quốc tịch của khách hàng.");
        if (string.IsNullOrWhiteSpace(khachHang.LoaiGiayTo) || string.IsNullOrWhiteSpace(khachHang.SoGiayTo))
            throw new ArgumentException("Vui lòng nhập giấy tờ của khách hàng.");
        khachHang.GioiTinh = ChuanHoaGioiTinh(khachHang.GioiTinh)
            ?? throw new ArgumentException("Vui lòng chọn giới tính của khách hàng.");
        if (string.IsNullOrWhiteSpace(khachHang.SDT))
            throw new ArgumentException("Vui lòng nhập số điện thoại của khách hàng.");
        if (!KhachHang.KiemTraNgaySinh(khachHang.NgaySinh))
            throw new ArgumentException("Ngày sinh của khách hàng không hợp lệ.");
        if (!KhachHang.KiemTraSoGiayTo(khachHang.SoGiayTo, khachHang.LoaiGiayTo))
            throw new ArgumentException("Số giấy tờ của khách hàng không hợp lệ.");
        if (!KhachHang.KiemTraDinhDangEmail(khachHang.Email))
            throw new ArgumentException("Email của khách hàng không hợp lệ.");
    }
}
