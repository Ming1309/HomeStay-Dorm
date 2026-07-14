namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class PhieuCoc
{
    public string MaPhieuCoc { get; set; } = string.Empty;
    public DateTime? HanThanhToan { get; set; }
    public string HinhThucThue { get; set; } = string.Empty;
    public int SoGiuongThue { get; set; }
    public decimal TongTien { get; set; }
    public DateTime ThoiDiemCoc { get; set; }
    public string? AnhMinhChung { get; set; }
    public string? PhuongThucThanhToan { get; set; }
    public string? LyDoYeuCauBoSung { get; set; }
    public string TrangThai { get; set; } = "KhoiTao";
    public string MaKH { get; set; } = string.Empty;
    public string MaPhong { get; set; } = string.Empty;
    public string? MaNV { get; set; }
    public DateTime? ThoiDiemHuy { get; set; }
    public string? MaNVHuy { get; set; }
    public bool DaDongTien { get; set; }
    public KhachHang KhachHang { get; set; } = new();
    public Phong Phong { get; set; } = new();
    public List<Giuong> Giuongs { get; set; } = [];
    public List<ThanhVienDangKy> ThanhViens { get; set; } = [];

    public static PhieuCoc TaoMoi(string maPhieu, string hinhThucThue, KhachHang khachHang, Phong phong,
        IReadOnlyList<Giuong> giuongs, string? maNhanVien, DateTime thoiDiem)
    {
        if (hinhThucThue is not ("NguyenCan" or "OGhep"))
            throw new InvalidOperationException("Hình thức thuê không hợp lệ.");
        
        return new PhieuCoc
        {
            MaPhieuCoc = maPhieu,
            HanThanhToan = null,
            HinhThucThue = hinhThucThue,
            SoGiuongThue = giuongs.Count,
            TongTien = 0,
            ThoiDiemCoc = thoiDiem,
            MaKH = khachHang.MaKH,
            MaPhong = phong.MaPhong,
            MaNV = maNhanVien,
            KhachHang = khachHang,
            Phong = phong,
            Giuongs = giuongs.ToList(),
            ThanhViens = [new ThanhVienDangKy { MaPhieuCoc = maPhieu, MaKH = khachHang.MaKH }]
        };
    }

    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachKhoiTao(string? text = null) =>
        PhieuCocDB.LayDanhSachKhoiTao(text);

    // ==========================================================
    // Methods from feat/lap-phieu-doi-soat branch
    // ==========================================================
    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachDaHuyDaThanhToan() =>
        PhieuCocDB.LayDanhSachDaHuyDaThanhToan();

    public static Task<decimal> LaySoTienCoc(string maPhieuCoc) =>
        PhieuCocDB.LaySoTienCoc(maPhieuCoc);

    // ==========================================================
    // Methods from develop branch
    // ==========================================================
    public static Task<IReadOnlyList<PhieuCoc>> LayPhieuCocDaThanhToanNhanPhongHomNay(string? text = null) =>
        PhieuCocDB.LayPhieuCocDaThanhToanNhanPhongHomNay(text);

    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoThanhToan(string? text = null) =>
        PhieuCocDB.LayDanhSachChoThanhToan(text);

    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoDoiChieu(string? text = null) =>
        PhieuCocDB.LayDanhSachChoDoiChieu(text);

    public static Task<PhieuCoc?> DocChiTiet(string maPhieuCoc) => PhieuCocDB.DocChiTiet(maPhieuCoc);

    // ==========================================================
    // Methods from feat/lap-phieu-hoan-coc branch
    // ==========================================================
    public static Task<PhieuCoc?> LayChiTietPhieuCoc(string maPhieuCoc) => DocChiTiet(maPhieuCoc);

    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoDuyet(string? text = null) =>
        PhieuCocDB.LayDanhSachChoDuyet(text);

    public static Task<PhieuCoc?> LayChiTietChoDuyet(string maPhieuCoc) =>
        PhieuCocDB.LayChiTietChoDuyet(maPhieuCoc);

    public bool KiemTraTrangThaiChoDuyet() => TrangThai == "ChoDuyet";

    public bool KiemTraCoThanhVienHopLe() =>
        ThanhViens.Any(tv => tv.TrangThaiDuyet == "HopLe");

    public void KiemTraDaThanhToan()
    {
        if (TrangThai != "DaThanhToan")
            throw new InvalidOperationException("Phiếu cọc không còn ở trạng thái thanh toán.");
    }

    public void KiemTraHinhThucThue()
    {
        if (HinhThucThue is not ("NguyenCan" or "OGhep"))
            throw new InvalidOperationException("Hình thức thuê không hợp lệ.");
    }

    public void KiemTraSoLuongThanhVien(int soLuongThanhVien)
    {
        if (soLuongThanhVien <= 0)
            throw new InvalidOperationException("Số lượng thành viên không hợp lệ.");
        if (soLuongThanhVien > SoGiuongThue)
            throw new InvalidOperationException(
                $"Số người ({soLuongThanhVien}) vượt quá số giường đã đặt cọc ({SoGiuongThue}).");
        if (soLuongThanhVien > Phong.LoaiPhong.SucChua)
            throw new InvalidOperationException(
                $"Số người ({soLuongThanhVien}) vượt quá sức chứa phòng ({Phong.LoaiPhong.SucChua}).");
    }

    public static Task<IReadOnlyList<PhieuCoc>> TraCuu(
        string? maPhieuCoc, string? sdt, string? email, string? soGiayTo) =>
        PhieuCocDB.TraCuu(maPhieuCoc, sdt, email, soGiayTo);

    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachCoTheHuy(string? text = null) =>
        PhieuCocDB.LayDanhSachCoTheHuy(text);

    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachDaHuyChoDoiSoat() =>
        PhieuCocDB.LayDanhSachDaHuyChoDoiSoat();

    public int TinhTienDuKien()
    {
        KiemTraCoTheTinhTien();
        SoGiuongThue = HinhThucThue == "NguyenCan" ? Phong.LoaiPhong.SucChua : Giuongs.Count;
        TongTien = Phong.TinhTienCoc(SoGiuongThue);
        return SoGiuongThue;
    }

    public void XacNhanTinhTien(DateTime thoiDiemXacNhan)
    {
        if (TrangThai != "KhoiTao")
            throw new InvalidOperationException("Phiếu cọc không còn ở trạng thái khởi tạo.");
        TinhTienDuKien();
        HanThanhToan = thoiDiemXacNhan.AddHours(24);
        TrangThai = "ChoThanhToan";
    }

    public void KiemTraTrangThaiChoGhiNhan()
    {
        if (TrangThai != "ChoThanhToan")
            throw new InvalidOperationException("Phiếu cọc không còn ở trạng thái chờ thanh toán.");
    }

    public void KiemTraCoTheGhiNhanThanhToan(string phuongThucThanhToan)
    {
        KiemTraTrangThaiChoGhiNhan();
        if (phuongThucThanhToan is not ("ChuyenKhoan" or "TienMat"))
            throw new ArgumentException("Phương thức thanh toán không hợp lệ.", nameof(phuongThucThanhToan));
    }

    public void GhiNhanThanhToan(string phuongThucThanhToan, string anhMinhChung)
    {
        KiemTraCoTheGhiNhanThanhToan(phuongThucThanhToan);
        if (string.IsNullOrWhiteSpace(anhMinhChung))
            throw new ArgumentException("Vui lòng tải lên chứng từ thanh toán để tiếp tục.", nameof(anhMinhChung));

        PhuongThucThanhToan = phuongThucThanhToan;
        AnhMinhChung = anhMinhChung;
        LyDoYeuCauBoSung = null;
        TrangThai = "ChoDoiChieu";
    }

    public void KiemTraCoTheXacNhanThanhToan()
    {
        if (TrangThai != "ChoDoiChieu")
            throw new InvalidOperationException("Phiếu cọc không còn ở trạng thái chờ đối chiếu.");
        if (TongTien <= 0)
            throw new InvalidOperationException("Số tiền cọc chưa hợp lệ để xác nhận.");
        if (PhuongThucThanhToan is not ("ChuyenKhoan" or "TienMat"))
            throw new InvalidOperationException("Phiếu cọc chưa có phương thức thanh toán hợp lệ.");
        if (string.IsNullOrWhiteSpace(AnhMinhChung))
            throw new InvalidOperationException("Phiếu cọc chưa có chứng từ thanh toán.");
        if (Giuongs.Count != SoGiuongThue || Giuongs.Count == 0)
            throw new InvalidOperationException("Chi tiết giường của phiếu cọc không hợp lệ.");
    }

    public void XacNhanThanhToan()
    {
        KiemTraCoTheXacNhanThanhToan();
        LyDoYeuCauBoSung = null;
        TrangThai = "DaThanhToan";
    }

    public void YeuCauBoSung(string lyDo)
    {
        if (TrangThai != "ChoDoiChieu")
            throw new InvalidOperationException("Phiếu cọc không còn ở trạng thái chờ đối chiếu.");
        var noiDung = lyDo?.Trim() ?? string.Empty;
        if (noiDung.Length is < 1 or > 500)
            throw new ArgumentException("Lý do yêu cầu bổ sung phải có từ 1 đến 500 ký tự.", nameof(lyDo));
        LyDoYeuCauBoSung = noiDung;
        TrangThai = "ChoThanhToan";
    }

    public void KiemTraCoTheXetDuyet()
    {
        if (TrangThai != "ChoDuyet")
            throw new InvalidOperationException("Phiếu cọc không còn ở trạng thái chờ duyệt.");
        if (string.IsNullOrWhiteSpace(MaPhong))
            throw new InvalidOperationException("Phiếu cọc chưa có thông tin phòng.");
        if (Giuongs.Count == 0)
            throw new InvalidOperationException("Phiếu cọc chưa có giường.");
    }

    public void CapNhatTrangThaiDaDuyet()
    {
        KiemTraCoTheXetDuyet();
        TrangThai = "DaDuyet";
    }

    public void CapNhatTrangThaiDaHuy()
    {
        if (TrangThai == "DaHuy")
            throw new InvalidOperationException("Phiếu cọc đã được hủy trước đó.");
        TrangThai = "DaHuy";
    }

    public void Huy(string maNhanVien, DateTime thoiDiem)
    {
        if (TrangThai == "DaHuy")
            throw new InvalidOperationException("Phiếu cọc đã được hủy trước đó.");
        if (string.IsNullOrWhiteSpace(maNhanVien))
            throw new ArgumentException("Không xác định được Nhân viên Sale đang đăng nhập.", nameof(maNhanVien));

        TrangThai = "DaHuy";
        MaNVHuy = maNhanVien.Trim();
        ThoiDiemHuy = thoiDiem;
    }

    private void KiemTraCoTheTinhTien()
    {
        if (HinhThucThue is not ("NguyenCan" or "OGhep"))
            throw new InvalidOperationException("Hình thức thuê không hợp lệ.");
        if (Phong.LoaiPhong.GiaThue <= 0)
            throw new InvalidOperationException("Phòng chưa có đơn giá hợp lệ.");
        if (HinhThucThue == "NguyenCan" && Phong.LoaiPhong.SucChua <= 0)
            throw new InvalidOperationException("Phòng chưa có sức chứa hợp lệ.");
        if (HinhThucThue == "OGhep" && Giuongs.Count == 0)
            throw new InvalidOperationException("Phiếu cọc chưa có giường thuê.");
    }

    public void CapNhatTrangThai(string trangThaiMoi) => TrangThai = trangThaiMoi;

    public Task LuuCapNhatTrangThai() => PhieuCocDB.CapNhatTrangThai(MaPhieuCoc, TrangThai);

    public Task CapNhatTinhTien() => PhieuCocDB.CapNhatTinhTien(this);

    public Task CapNhatThanhToan() => PhieuCocDB.CapNhatThanhToan(this);

    public Task CapNhatXacNhanThanhToan() => PhieuCocDB.CapNhatXacNhanThanhToan(this);

    public Task CapNhatYeuCauBoSung() => PhieuCocDB.CapNhatYeuCauBoSung(this);

    public Task CapNhatTrangThaiDaDuyetDB() => PhieuCocDB.CapNhatDaDuyet(this);

    public Task CapNhatTrangThaiDaHuyDB() => PhieuCocDB.CapNhatDaHuy(this);

    public Task<bool> CapNhatTrangThaiKhongDieuKien(string trangThai) => PhieuCocDB.CapNhatTrangThaiKhongDieuKien(MaPhieuCoc, trangThai);

    public Task CapNhatHuy() => PhieuCocDB.CapNhatHuy(this);

    public Task Them() => PhieuCocDB.Them(this);
}