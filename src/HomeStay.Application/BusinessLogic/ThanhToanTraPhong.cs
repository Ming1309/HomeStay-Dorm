using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DbConnections;

namespace HomeStay.Application.BusinessLogic;

public sealed class ThanhToanTraPhong
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public ThanhToanTraPhong(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<PhieuDoiSoatDto>> LayDSPhieuDoiSoatDaChot()
    {
        using var phien = _taoPhienDuLieu();
        var dsPds = await PhieuDoiSoat.LayDSPhieuDoiSoatDaChot();
        var dtos = new List<PhieuDoiSoatDto>();

        foreach (var pds in dsPds)
        {
            string tenKhachHang = "";
            string phong = "";

            if (!string.IsNullOrWhiteSpace(pds.MaHD))
            {
                var hd = await HopDong.LayThongTinLuuTru(pds.MaHD);
                if (hd != null)
                {
                    tenKhachHang = hd.PhieuCoc?.KhachHang?.HoTen ?? "";
                    phong = hd.PhieuCoc?.Phong != null 
                        ? $"Tòa {hd.PhieuCoc.Phong.ToaNha} - {hd.PhieuCoc.Phong.SoPhong}" 
                        : "";
                }
            }
            else
            {
                var pc = await PhieuCoc.DocChiTiet(pds.MaPhieuCoc);
                if (pc != null)
                {
                    tenKhachHang = pc.KhachHang?.HoTen ?? "";
                    phong = pc.Phong != null 
                        ? $"Tòa {pc.Phong.ToaNha} - {pc.Phong.SoPhong}" 
                        : "";
                }
            }

            dtos.Add(new PhieuDoiSoatDto
            {
                MaPDS = pds.MaPDS,
                MaHD = pds.MaHD,
                MaPhieuCoc = pds.MaPhieuCoc,
                TenKhachHang = tenKhachHang,
                Phong = phong,
                TienThuThem = pds.TienThuThem,
                NgayDoiSoat = pds.NgayDoiSoat,
                TrangThai = pds.TrangThai
            });
        }

        return dtos;
    }

    public async Task<ChiTietPhieuDoiSoatDto> LayChiTietPhieuDoiSoat(string maPDS)
    {
        using var phien = _taoPhienDuLieu();
        var pds = await PhieuDoiSoat.LayChiTietPhieuDoiSoat(maPDS)
            ?? throw new KeyNotFoundException("Không tìm thấy phiếu đối soát.");

        string tenKhachHang = "";
        string phone = "";
        string email = "";
        string phong = "";
        decimal soTienCoc = 0;

        if (!string.IsNullOrWhiteSpace(pds.MaHD))
        {
            var hd = await HopDong.LayThongTinLuuTru(pds.MaHD);
            if (hd != null)
            {
                tenKhachHang = hd.PhieuCoc?.KhachHang?.HoTen ?? "";
                phone = hd.PhieuCoc?.KhachHang?.SDT ?? "";
                email = hd.PhieuCoc?.KhachHang?.Email ?? "";
                phong = hd.PhieuCoc?.Phong != null 
                    ? $"Tòa {hd.PhieuCoc.Phong.ToaNha} - {hd.PhieuCoc.Phong.SoPhong}" 
                    : "";
                soTienCoc = hd.PhieuCoc?.TongTien ?? 0;
            }
        }
        else
        {
            var pc = await PhieuCoc.DocChiTiet(pds.MaPhieuCoc);
            if (pc != null)
            {
                tenKhachHang = pc.KhachHang?.HoTen ?? "";
                phone = pc.KhachHang?.SDT ?? "";
                email = pc.KhachHang?.Email ?? "";
                phong = pc.Phong != null 
                    ? $"Tòa {pc.Phong.ToaNha} - {pc.Phong.SoPhong}" 
                    : "";
                soTienCoc = pc.TongTien;
            }
        }

        var dsHoaDon = await HoaDon.LayDSHoaDonTheoPhieuDoiSoat(maPDS);

        return new ChiTietPhieuDoiSoatDto
        {
            MaPDS = pds.MaPDS,
            MaHD = pds.MaHD,
            MaPhieuCoc = pds.MaPhieuCoc,
            TenKhachHang = tenKhachHang,
            Phone = phone,
            Email = email,
            Phong = phong,
            SoTienCoc = soTienCoc,
            NgayDoiSoat = pds.NgayDoiSoat,
            TyLeHoanCoc = pds.TyLeHoanCoc,
            TongKhauTru = pds.TongKhauTru,
            TienHoan = pds.TienHoan,
            TienThuThem = pds.TienThuThem,
            TrangThai = pds.TrangThai,
            HoaDons = dsHoaDon.Select(x => new HoaDonDto
            {
                MaHoaDon = x.MaHoaDon,
                LoaiHoaDon = x.LoaiHoaDon,
                TongTien = x.TongTien,
                NgayLap = x.NgayLap
            }).ToList()
        };
    }

    public async Task<PhieuThu> TienHanhThuTien(string maPDS, decimal soTien, string phuongThuc, string? anhMinhChung, string maNV)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var pds = await PhieuDoiSoat.LayChiTietPhieuDoiSoat(maPDS)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu đối soát.");

            if (pds.TrangThai != "DaChot")
                throw new InvalidOperationException("Phiếu đối soát không ở trạng thái chờ thu tiền.");

            // Create PhieuThu entity
            var thoiDiem = _timeProvider.GetLocalNow().DateTime;
            var phieuThu = PhieuThu.TaoPhieuThu(maPDS, soTien, phuongThuc, anhMinhChung, maNV, thoiDiem);
            await phieuThu.LuuPhieu();

            // Update Reconciliation slip status to DaTatToan
            await PhieuDoiSoat.CapNhatTrangThai(maPDS, "DaTatToan");

            phien.Commit();
            return phieuThu;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}

public sealed class PhieuDoiSoatDto
{
    public string MaPDS { get; set; } = string.Empty;
    public string? MaHD { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string Phong { get; set; } = string.Empty;
    public decimal TienThuThem { get; set; }
    public DateTime NgayDoiSoat { get; set; }
    public string TrangThai { get; set; } = string.Empty;
}

public sealed class ChiTietPhieuDoiSoatDto
{
    public string MaPDS { get; set; } = string.Empty;
    public string? MaHD { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phong { get; set; } = string.Empty;
    public decimal SoTienCoc { get; set; }
    public DateTime NgayDoiSoat { get; set; }
    public decimal TyLeHoanCoc { get; set; }
    public decimal TongKhauTru { get; set; }
    public decimal TienHoan { get; set; }
    public decimal TienThuThem { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public List<HoaDonDto> HoaDons { get; set; } = [];
}
