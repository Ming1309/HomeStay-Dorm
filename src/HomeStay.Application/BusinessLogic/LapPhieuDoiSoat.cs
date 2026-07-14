namespace HomeStay.Application.BusinessLogic;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DbConnections;

public sealed class LapPhieuDoiSoat
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly DichVuThongBao _dichVuThongBao;

    public LapPhieuDoiSoat(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider, DichVuThongBao dichVuThongBao)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _dichVuThongBao = dichVuThongBao;
    }

    public async Task<IReadOnlyList<HoSoChoDoiSoat>> LayDanhSachChoDoiSoat(string? text = null)
    {
        using var phien = _taoPhienDuLieu();
        var results = new List<HoSoChoDoiSoat>();

        var hopDongs = await HopDong.LayDanhSachChoDoiSoat();
        foreach (var hd in hopDongs)
        {
            results.Add(new HoSoChoDoiSoat
            {
                MaHoSo = hd.MaHD,
                LoaiHoSo = "HopDong",
                TenKhachHang = hd.KhachHang?.HoTen ?? string.Empty,
                Phong = hd.PhieuCoc?.Phong != null ? $"{hd.PhieuCoc.Phong.ToaNha} - {hd.PhieuCoc.Phong.SoPhong}" : string.Empty,
                SoTien = hd.PhieuCoc?.TongTien ?? 0,
                NgayYeuCau = hd.NgayKetThuc,
                TrangThai = hd.TrangThai
            });
        }

        var phieuCocs = await PhieuCoc.LayDanhSachDaHuyDaThanhToan();
        foreach (var pc in phieuCocs)
        {
            results.Add(new HoSoChoDoiSoat
            {
                MaHoSo = pc.MaPhieuCoc,
                LoaiHoSo = "PhieuCoc",
                TenKhachHang = pc.KhachHang?.HoTen ?? string.Empty,
                Phong = pc.Phong != null ? $"{pc.Phong.ToaNha} - {pc.Phong.SoPhong}" : string.Empty,
                SoTien = pc.TongTien,
                NgayYeuCau = pc.ThoiDiemCoc,
                TrangThai = pc.TrangThai
            });
        }

        var ordered = results.OrderByDescending(x => x.NgayYeuCau).ToList();
        if (!string.IsNullOrWhiteSpace(text))
        {
            var q = text.Trim().ToLower();
            ordered = ordered.Where(x => x.MaHoSo.ToLower().Contains(q) ||
                                         x.TenKhachHang.ToLower().Contains(q) ||
                                         x.Phong.ToLower().Contains(q)).ToList();
        }

        return ordered;
    }

    public async Task<ChiTietDoiSoatDto> LayChiTietVaTinhToan(string maHoSo, string loaiHoSo)
    {
        using var phien = _taoPhienDuLieu();
        return await LayChiTietVaTinhToanInternal(maHoSo, loaiHoSo);
    }

    private async Task<ChiTietDoiSoatDto> LayChiTietVaTinhToanInternal(string maHoSo, string loaiHoSo)
    {
        if (loaiHoSo == "PhieuCoc")
        {
            var homNay = DateOnly.FromDateTime(_timeProvider.GetLocalNow().DateTime);
            var cs = await ChinhSachHoanCoc.LayChinhSachDangApDung(homNay)
                ?? throw new InvalidOperationException("Không tìm thấy chính sách hoàn cọc đang áp dụng.");
            decimal tienCoc = await PhieuCoc.LaySoTienCoc(maHoSo);
            var pds = PhieuDoiSoat.TaoMoi(maHoSo, null, null, _timeProvider.GetLocalNow().DateTime);
            pds.ApDungChinhSachHoanCoc(cs.TiLe_ChuaKy);
            pds.TinhTongKhauTru(0);
            pds.ChotKetQua(tienCoc);

            return new ChiTietDoiSoatDto
            {
                MaHoSo = maHoSo,
                LoaiHoSo = loaiHoSo,
                SoTienCoc = tienCoc,
                TyLeHoanCoc = pds.TyLeHoanCoc,
                TongKhauTru = pds.TongKhauTru,
                TienHoan = pds.TienHoan,
                TienThuThem = pds.TienThuThem,
                HoaDons = []
            };
        }
        else if (loaiHoSo == "HopDong")
        {
            var hd = await HopDong.LayThongTinLuuTru(maHoSo)
                ?? throw new InvalidOperationException("Không tìm thấy thông tin lưu trú của hợp đồng.");

            decimal tienCoc = hd.PhieuCoc?.TongTien ?? 0;
            int soThangThucTe = hd.TinhSoThangThucTe(_timeProvider.GetLocalNow().DateTime);
            int soThangHopDong = hd.TinhSoThangHopDong();

            var homNay = DateOnly.FromDateTime(_timeProvider.GetLocalNow().DateTime);
            var cs = (hd.MaChinhSach is not null
                ? await ChinhSachHoanCoc.LayChinhSachTheoMa(hd.MaChinhSach)
                : await ChinhSachHoanCoc.LayChinhSachDangApDung(homNay))
                ?? throw new InvalidOperationException(
                    "Không tìm thấy chính sách hoàn cọc của hợp đồng.");
            decimal tyLe = cs.XacDinhTyLeHoan(soThangThucTe, soThangHopDong);
            var dsHoaDon = await HoaDon.LayDanhSachChuaThanhToan(maHoSo);

            var pds = PhieuDoiSoat.TaoMoi(hd.MaPhieuCoc, maHoSo, null, _timeProvider.GetLocalNow().DateTime);
            pds.TinhToanDoiSoat(tienCoc, tyLe, dsHoaDon);

            return new ChiTietDoiSoatDto
            {
                MaHoSo = maHoSo,
                LoaiHoSo = loaiHoSo,
                SoTienCoc = tienCoc,
                TyLeHoanCoc = pds.TyLeHoanCoc,
                TongKhauTru = pds.TongKhauTru,
                TienHoan = pds.TienHoan,
                TienThuThem = pds.TienThuThem,
                HoaDons = dsHoaDon.Select(x => new HoaDonDto
                {
                    MaHoaDon = x.MaHoaDon,
                    LoaiHoaDon = x.LoaiHoaDon,
                    TongTien = x.TongTien,
                    NgayLap = x.NgayLap
                }).ToList()
            };
        }
        else
        {
            throw new ArgumentException("Loại hồ sơ không hợp lệ.");
        }
    }

    public async Task<PhieuDoiSoat> TaoPhieuDoiSoat(string maHoSo, string loaiHoSo, string? ghiChu, string? maNhanVien)
    {
        if (string.IsNullOrWhiteSpace(maNhanVien))
            throw new ArgumentException("Không xác định được Kế toán thực hiện.", nameof(maNhanVien));

        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var detail = await LayChiTietVaTinhToanInternal(maHoSo, loaiHoSo);

            var now = _timeProvider.GetLocalNow().DateTime;
            string maPhieuCoc;
            if (loaiHoSo == "PhieuCoc")
            {
                maPhieuCoc = maHoSo;
            }
            else
            {
                var hd = await HopDong.LayThongTinLuuTru(maHoSo)
                    ?? throw new InvalidOperationException("Không tìm thấy thông tin hợp đồng.");
                maPhieuCoc = hd.MaPhieuCoc;
            }
            string? maHD = loaiHoSo == "HopDong" ? maHoSo : null;

            var pds = PhieuDoiSoat.TaoMoi(maPhieuCoc, maHD, maNhanVien, now);
            pds.TyLeHoanCoc = detail.TyLeHoanCoc;
            pds.TongKhauTru = detail.TongKhauTru;
            pds.TienHoan = detail.TienHoan;
            pds.TienThuThem = detail.TienThuThem;
            pds.GhiChu = ghiChu;

            if (loaiHoSo == "HopDong")
            {
                var dsHoaDon = await HoaDon.LayDanhSachChuaThanhToan(maHoSo);
                pds.HoaDons = dsHoaDon.ToList();
            }

            await pds.LuuPhieu();
            await _dichVuThongBao.GuiThongBaoQuanLy(pds.MaPDS);

            phien.Commit();
            return pds;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}

public sealed class HoSoChoDoiSoat
{
    public string MaHoSo { get; set; } = string.Empty;
    public string LoaiHoSo { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string Phong { get; set; } = string.Empty;
    public decimal SoTien { get; set; }
    public DateTime NgayYeuCau { get; set; }
    public string TrangThai { get; set; } = string.Empty;
}

public sealed class ChiTietDoiSoatDto
{
    public string MaHoSo { get; set; } = string.Empty;
    public string LoaiHoSo { get; set; } = string.Empty;
    public decimal SoTienCoc { get; set; }
    public decimal TyLeHoanCoc { get; set; }
    public decimal TongKhauTru { get; set; }
    public decimal TienHoan { get; set; }
    public decimal TienThuThem { get; set; }
    public List<HoaDonDto> HoaDons { get; set; } = [];
}

public sealed class HoaDonDto
{
    public string MaHoaDon { get; set; } = string.Empty;
    public string LoaiHoaDon { get; set; } = string.Empty;
    public decimal TongTien { get; set; }
    public DateTime NgayLap { get; set; }
}
