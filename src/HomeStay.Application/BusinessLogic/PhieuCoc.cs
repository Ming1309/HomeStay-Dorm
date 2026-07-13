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
    public KhachHang KhachHang { get; set; } = new();
    public Phong Phong { get; set; } = new();
    public List<Giuong> Giuongs { get; set; } = [];
    public List<ThanhVienDangKy> ThanhViens { get; set; } = [];

    public static PhieuCoc TaoMoi(string hinhThucThue, KhachHang khachHang, Phong phong,
        IReadOnlyList<Giuong> giuongs, string? maNhanVien, DateTime thoiDiem)
    {
        if (hinhThucThue is not ("NguyenCan" or "OGhep"))
            throw new InvalidOperationException("Hình thức thuê không hợp lệ.");
        var maPhieu = $"PC{thoiDiem:yyyyMMddHHmmssfff}";
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

    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoThanhToan(string? text = null) =>
        PhieuCocDB.LayDanhSachChoThanhToan(text);

    public static Task<IReadOnlyList<PhieuCoc>> LayDanhSachChoDoiChieu(string? text = null) =>
        PhieuCocDB.LayDanhSachChoDoiChieu(text);

    public static Task<PhieuCoc?> DocChiTiet(string maPhieuCoc) => PhieuCocDB.DocChiTiet(maPhieuCoc);

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

    public Task CapNhatTinhTien() => PhieuCocDB.CapNhatTinhTien(this);

    public Task CapNhatThanhToan() => PhieuCocDB.CapNhatThanhToan(this);

    public Task CapNhatXacNhanThanhToan() => PhieuCocDB.CapNhatXacNhanThanhToan(this);

    public Task CapNhatYeuCauBoSung() => PhieuCocDB.CapNhatYeuCauBoSung(this);

    public Task Them() => PhieuCocDB.Them(this);
}
