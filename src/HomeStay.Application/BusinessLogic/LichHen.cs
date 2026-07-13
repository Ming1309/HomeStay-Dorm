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

    public void KiemTraTrangThaiHopLe()
    {
        var hopLe = TrangThai is "DaXacNhan" or "DaCheckin" or "DaHoanThanh";
        if (!hopLe)
            throw new InvalidOperationException("Lịch hẹn không ở trạng thái hợp lệ để nhập hồ sơ.");
    }

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
