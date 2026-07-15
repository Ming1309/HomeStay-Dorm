namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DbConnections;

public sealed class SuaLichHen
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly DichVuThongBao _thongBao;

    public SuaLichHen(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider, DichVuThongBao thongBao)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _thongBao = thongBao;
    }

    public async Task<LichHen> ThucHien(string maLH, DateTime ngay, TimeSpan gio, string maNV, string trangThai)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var nhanVien = await NhanVien.DocPhamVi(maNV);
            var lichHen = await LichHen.DocChiTiet(maLH, nhanVien.MaCN, khoaCapNhat: true)
                ?? throw new KeyNotFoundException("Không tìm thấy lịch hẹn.");

            lichHen.CapNhatThongTin(ngay, gio, maNV, trangThai);

            if (lichHen.TrangThai == "DaXacNhan")
                lichHen.KiemTraThoiGianHopLe(_timeProvider.GetLocalNow().DateTime);

            await lichHen.KiemTraTrungLichCapNhat();
            await lichHen.LuuCapNhat();

            if (lichHen.LoaiLichHen == "TraPhong")
            {
                if (lichHen.TrangThai is "DaHuy" or "VangMat")
                {
                    await _thongBao.DongTacVu(
                        LoaiSuKienThongBao.LichTraPhong, lichHen.MaHD!, maNV, "DaHuy");
                    await _thongBao.PhatThongTin(
                        LoaiSuKienThongBao.LichTraPhongBiHuy,
                        nhanVien.MaCN,
                        "QuanLy",
                        null,
                        lichHen.TrangThai == "DaHuy" ? "Lịch trả phòng đã hủy" : "Khách vắng lịch trả phòng",
                        $"Lịch {lichHen.MaLH} của hợp đồng {lichHen.MaHD} không còn thực hiện theo thời gian đã hẹn.",
                        $"/manager/contracts?maHD={Uri.EscapeDataString(lichHen.MaHD!)}",
                        lichHen.MaHD!,
                        maNV,
                        tone: "red",
                        loaiThongBao: "CanhBao",
                        khoaChongTrung: $"{LoaiSuKienThongBao.LichTraPhongBiHuy}:{lichHen.MaLH}",
                        capNhatNeuTonTai: true);
                }
                else
                {
                    await _thongBao.PhatCanXuLyTheoVaiTro(
                        LoaiSuKienThongBao.LichTraPhong,
                        nhanVien.MaCN,
                        "QuanLy",
                        "Lịch trả phòng đã cập nhật",
                        $"Hợp đồng {lichHen.MaHD} đổi lịch trả phòng sang {lichHen.GioHen:hh\\:mm} ngày {lichHen.NgayHen:dd/MM/yyyy}.",
                        $"/manager/thu-hoi-tai-san?maHD={Uri.EscapeDataString(lichHen.MaHD!)}",
                        lichHen.MaHD!,
                        maNV,
                        khoaChongTrung: $"{LoaiSuKienThongBao.LichTraPhong}:{lichHen.MaLH}",
                        capNhatNeuTonTai: true);
                }
            }
            else if (lichHen.LoaiLichHen == "NhanPhong")
            {
                await _thongBao.PhatThongTin(
                    LoaiSuKienThongBao.LichNhanPhong,
                    nhanVien.MaCN,
                    "QuanLy",
                    null,
                    "Lịch nhận phòng đã cập nhật",
                    $"Phiếu {lichHen.MaPhieuCoc} có lịch nhận phòng lúc {lichHen.GioHen:hh\\:mm} ngày {lichHen.NgayHen:dd/MM/yyyy} ({lichHen.TrangThai}).",
                    $"/manager/tra-cuu-phieu-coc?maPhieuCoc={Uri.EscapeDataString(lichHen.MaPhieuCoc!)}",
                    lichHen.MaPhieuCoc!,
                    maNV,
                    tone: lichHen.TrangThai is "DaHuy" or "VangMat" ? "red" : "blue",
                    loaiThongBao: lichHen.TrangThai is "DaHuy" or "VangMat" ? "CanhBao" : "ThongTin",
                    khoaChongTrung: $"{LoaiSuKienThongBao.LichNhanPhong}:{lichHen.MaLH}",
                    capNhatNeuTonTai: true);
            }

            phien.Commit();
            return lichHen;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
