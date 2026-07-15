namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;
using HomeStay.Application.DataAccess.DbConnections;

public sealed class TaoLichHen
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly DichVuThongBao _thongBao;

    public TaoLichHen(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider, DichVuThongBao thongBao)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _thongBao = thongBao;
    }

    public async Task<IReadOnlyList<dynamic>> TaiDanhSachChungTu(string loaiLichHen, string? tuKhoa, string? maNV)
    {
        using var phien = _taoPhienDuLieu();
        var nhanVien = await NhanVien.DocPhamVi(maNV);
        return loaiLichHen switch
        {
            "XemPhong" => await PhieuDangKyDB.TimKiemPhieuDuDieuKien(nhanVien.MaCN, tuKhoa),
            "NhanPhong" => await PhieuCocDB.TimKiemPhieuDaDuyet(nhanVien.MaCN, tuKhoa),
            "TraPhong" => await HopDongDB.TimKiemHopDongHieuLuc(nhanVien.MaCN, tuKhoa),
            _ => throw new ArgumentException("Loại lịch hẹn không hợp lệ.")
        };
    }

    public async Task<LichHen> LuuLichHen(string loai, string maChungTu, DateTime ngayHen, TimeSpan gioHen, string maNV)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var thoiDiem = _timeProvider.GetLocalNow().DateTime;
            var nhanVien = await NhanVien.DocPhamVi(maNV);
            var lichHen = LichHen.TaoMoi(loai, maChungTu, nhanVien.MaCN, ngayHen, gioHen, maNV, thoiDiem);

            lichHen.KiemTraThoiGianHopLe(thoiDiem);
            await lichHen.KiemTraHopLe();
            await lichHen.KiemTraTrungLich();
            await lichHen.Them();

            if (lichHen.LoaiLichHen == "NhanPhong")
            {
                await _thongBao.PhatThongTin(
                    LoaiSuKienThongBao.LichNhanPhong,
                    nhanVien.MaCN,
                    "QuanLy",
                    null,
                    "Có lịch nhận phòng mới",
                    $"Phiếu {lichHen.MaPhieuCoc} dự kiến nhận phòng lúc {lichHen.GioHen:hh\\:mm} ngày {lichHen.NgayHen:dd/MM/yyyy}.",
                    $"/manager/tra-cuu-phieu-coc?maPhieuCoc={Uri.EscapeDataString(lichHen.MaPhieuCoc!)}",
                    lichHen.MaPhieuCoc!,
                    maNV,
                    khoaChongTrung: $"{LoaiSuKienThongBao.LichNhanPhong}:{lichHen.MaLH}");
            }
            else if (lichHen.LoaiLichHen == "TraPhong")
            {
                await _thongBao.PhatCanXuLyTheoVaiTro(
                    LoaiSuKienThongBao.LichTraPhong,
                    nhanVien.MaCN,
                    "QuanLy",
                    "Lịch trả phòng mới",
                    $"Hợp đồng {lichHen.MaHD} hẹn trả phòng lúc {lichHen.GioHen:hh\\:mm} ngày {lichHen.NgayHen:dd/MM/yyyy}.",
                    $"/manager/thu-hoi-tai-san?maHD={Uri.EscapeDataString(lichHen.MaHD!)}",
                    lichHen.MaHD!,
                    maNV,
                    khoaChongTrung: $"{LoaiSuKienThongBao.LichTraPhong}:{lichHen.MaLH}");
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
