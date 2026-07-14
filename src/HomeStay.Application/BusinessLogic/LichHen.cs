namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class LichHen
{
    public string MaLH { get; set; } = string.Empty;
    public DateTime NgayHen { get; set; }
    public TimeSpan GioHen { get; set; }
    public string LoaiLichHen { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public string? MaPDK { get; set; }
    public string? MaPhieuCoc { get; set; }
    public string? MaHD { get; set; }
    public string? MaNV { get; set; }
    public string? MaCN { get; set; }
    public KhachHang? KhachHang { get; set; }

    public static Task<IReadOnlyList<LichHen>> LayDanhSachKhachChoCoc(string? text = null) =>
        LichHenDB.LayDanhSachKhachChoCoc(text);

    public static Task<LichHen?> DocChiTiet(string maLichHen) => LichHenDB.DocChiTiet(maLichHen);

    public static Task<LichHen?> DocTheoMaPhieuCoc(string maPhieuCoc) => LichHenDB.DocTheoMaPhieuCoc(maPhieuCoc);

    public bool KiemTraLichNhanPhongHomNay()
    {
        if (LoaiLichHen != "NhanPhong") return false;
        if (string.IsNullOrWhiteSpace(MaPhieuCoc)) return false;
        return NgayHen.Date == DateTime.Today;
    }

    public void KiemTraLoaiNhanPhong()
    {
        if (LoaiLichHen != "NhanPhong")
            throw new InvalidOperationException("Lịch hẹn không phải loại nhận phòng.");
    }

    public void KiemTraThoiGianHopLe(DateTime thoiDiemHienTai)
    {
        var thoiGianHen = NgayHen.Date + GioHen;
        if (thoiGianHen <= thoiDiemHienTai)
            throw new InvalidOperationException("Thời gian hẹn phải lớn hơn thời điểm hiện tại.");
    }

    public void KiemTraTrangThaiHopLe()
    {
        var hopLe = TrangThai is "DaXacNhan" or "DaCheckin" or "DaHoanThanh";
        if (!hopLe)
            throw new InvalidOperationException("Lịch hẹn không ở trạng thái hợp lệ để nhập hồ sơ.");
    }

    public static LichHen TaoMoi(
        string loai, string maChungTu, string maCN, DateTime ngay, TimeSpan gio, string maNV, DateTime thoiDiemTao)
    {
        var lh = new LichHen
        {
            MaLH = $"LH{thoiDiemTao:yyyyMMddHHmmssfff}",
            NgayHen = ngay,
            GioHen = gio,
            LoaiLichHen = loai,
            TrangThai = "DaXacNhan",
            MaCN = string.IsNullOrWhiteSpace(maCN) ? null : maCN,
            MaNV = maNV
        };

        if (loai == "XemPhong") lh.MaPDK = maChungTu;
        else if (loai == "NhanPhong") lh.MaPhieuCoc = maChungTu;
        else if (loai == "TraPhong") lh.MaHD = maChungTu;
        else throw new ArgumentException("Loại lịch hẹn không hợp lệ.");

        return lh;
    }

    public async Task KiemTraHopLe()
    {
        bool hopLe = LoaiLichHen switch
        {
            "XemPhong" => await PhieuDangKyDB.KiemTraConHopLe(MaPDK!),
            "NhanPhong" => await PhieuCocDB.KiemTraConHopLe(MaPhieuCoc!),
            "TraPhong" => await HopDongDB.KiemTraConHopLe(MaHD!),
            _ => false
        };

        if (!hopLe)
            throw new InvalidOperationException("Chứng từ liên kết không còn hợp lệ hoặc sai trạng thái.");
    }

    public async Task KiemTraTrungLich()
    {
        if (await LichHenDB.KiemTraLichTrungCaNhanVien(MaNV!, NgayHen, GioHen))
            throw new InvalidOperationException("Nhân viên đã có lịch bận vào thời điểm này.");
    }

    public async Task KiemTraTrungLichCapNhat()
    {
        if (await LichHenDB.KiemTraLichTrungCaNhanVienKhacLichHienTai(MaNV!, NgayHen, GioHen, MaLH))
            throw new InvalidOperationException("Nhân viên đã có lịch bận vào thời điểm này.");
    }

    public Task Them() => LichHenDB.Them(this);

    public void CapNhatThongTin(DateTime ngay, TimeSpan gio, string maNV, string trangThai)
    {
        NgayHen = ngay;
        GioHen = gio;
        MaNV = maNV;
        TrangThai = trangThai;
    }

    public Task LuuCapNhat() => LichHenDB.CapNhat(this);
    public void KiemTraCoTheLapPhieuCoc()
    {
        if (LoaiLichHen != "XemPhong" || TrangThai != "DaHoanThanh")
            throw new InvalidOperationException("Lịch hẹn xem phòng chưa hoàn thành.");
        if (!string.IsNullOrWhiteSpace(MaPhieuCoc))
            throw new InvalidOperationException("Lịch hẹn đã được gắn phiếu cọc.");
        if (KhachHang is null)
            throw new InvalidOperationException("Lịch hẹn không có khách hàng hợp lệ.");
    }

    public void GanPhieuCoc(string maPhieuCoc) => MaPhieuCoc = maPhieuCoc;

    public Task LuuPhieuCoc() => LichHenDB.GanPhieuCoc(this);
}
