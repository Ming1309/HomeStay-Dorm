using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DbConnections;

namespace HomeStay.Application.BusinessLogic;

public sealed class DoiSoatChoHoanCocDto
{
    public string MaPDS { get; set; } = string.Empty;
    public string? MaHD { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string Phong { get; set; } = string.Empty;
    public decimal TienHoan { get; set; }
    public string NgayDoiSoat { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
}

public sealed class ChiTietHoanCocDto
{
    public string MaPDS { get; set; } = string.Empty;
    public string? MaHD { get; set; }
    public string MaPhieuCoc { get; set; } = string.Empty;
    public string MaKH { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phong { get; set; } = string.Empty;
    public decimal SoTienCoc { get; set; }
    public string NgayDoiSoat { get; set; } = string.Empty;
    public decimal TyLeHoanCoc { get; set; }
    public decimal TongKhauTru { get; set; }
    public decimal TienHoan { get; set; }
    public decimal TienThuThem { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string PolicyCode { get; set; } = string.Empty;
    public int RefundRate { get; set; }
}

public sealed class LapPhieuHoanCoc
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;

    public LapPhieuHoanCoc(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
    }

    public async Task<IReadOnlyList<DoiSoatChoHoanCocDto>> LayDSPhieuDoiSoatCanHoan()
    {
        using var phien = _taoPhienDuLieu();
        var list = await PhieuDoiSoat.LayDSPhieuDoiSoatCanHoan();
        var results = new List<DoiSoatChoHoanCocDto>();
        foreach (var p in list)
        {
            var pc = await PhieuCoc.LayChiTietPhieuCoc(p.MaPhieuCoc);
            var kh = pc != null ? await KhachHang.LayThongTinKhachHang(pc.MaKH) : null;
            var phg = pc != null ? await Phong.DocChiTiet(pc.MaPhong) : null;
            results.Add(new DoiSoatChoHoanCocDto
            {
                MaPDS = p.MaPDS,
                MaHD = p.MaHD,
                MaPhieuCoc = p.MaPhieuCoc,
                TenKhachHang = kh?.HoTen ?? "Khách hàng",
                Phong = phg != null ? $"Tòa {phg.ToaNha} - {phg.SoPhong}" : "",
                TienHoan = p.TienHoan,
                NgayDoiSoat = p.NgayDoiSoat.ToString("yyyy-MM-dd"),
                TrangThai = p.TrangThai
            });
        }
        return results;
    }

    public async Task<ChiTietHoanCocDto?> LayChiTietPhieuDoiSoatDto(string maPDS)
    {
        using var phien = _taoPhienDuLieu();
        var pds = await PhieuDoiSoat.LayChiTietPhieuDoiSoat(maPDS);
        if (pds == null) return null;
        if (pds.TrangThai != "DaChot" || pds.TienHoan <= 0 || await PhieuHoanCoc.DaTonTaiChoPhieuDoiSoat(maPDS))
            throw new InvalidOperationException("Phiếu đối soát không còn trong hàng đợi hoàn cọc.");

        var pc = await PhieuCoc.LayChiTietPhieuCoc(pds.MaPhieuCoc);
        if (pc == null) return null;

        var kh = await KhachHang.LayThongTinKhachHang(pc.MaKH);
        var hd = pds.MaHD != null ? await HopDong.LayChiTietHopDong(pds.MaHD) : null;
        if (pds.MaHD is not null && hd?.TrangThai != "DaThanhLy")
            throw new InvalidOperationException("Hợp đồng chưa thanh lý nên chưa thể hoàn cọc.");
        var policy = hd?.MaChinhSach != null
            ? await ChinhSachHoanCoc.LayChinhSachTheoMa(hd.MaChinhSach)
            : null;
        var phg = await Phong.DocChiTiet(pc.MaPhong);

        return new ChiTietHoanCocDto
        {
            MaPDS = pds.MaPDS,
            MaHD = pds.MaHD,
            MaPhieuCoc = pds.MaPhieuCoc,
            MaKH = kh?.MaKH ?? "",
            TenKhachHang = kh?.HoTen ?? "Khách hàng",
            Phone = kh?.SDT ?? "",
            Email = kh?.Email ?? "",
            Phong = phg != null ? $"Tòa {phg.ToaNha} - {phg.SoPhong}" : "",
            SoTienCoc = pc.TongTien,
            NgayDoiSoat = pds.NgayDoiSoat.ToString("yyyy-MM-dd"),
            TyLeHoanCoc = pds.TyLeHoanCoc,
            TongKhauTru = pds.TongKhauTru,
            TienHoan = pds.TienHoan,
            TienThuThem = pds.TienThuThem,
            TrangThai = pds.TrangThai,
            PolicyCode = policy?.MaChinhSach ?? string.Empty,
            RefundRate = (int)(pds.TyLeHoanCoc * 100)
        };
    }

    public async Task<PhieuHoanCoc?> LayThongTinPhieuHoanCoc(string maPHC)
    {
        using var phien = _taoPhienDuLieu();
        return await PhieuHoanCoc.LayThongTinPhieuHoanCoc(maPHC);
    }

    public async Task<PhieuHoanCoc> ThucHienHoanCoc(
        string maPDS, string phuongThuc, string thongTinNhanTien, string? maGiaoDich,
        string minhChung, string maNV)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var pds = await PhieuDoiSoat.LayChiTietChoCapNhat(maPDS);
            if (pds == null)
                throw new KeyNotFoundException("Phiếu đối soát không tồn tại.");

            if (pds.TrangThai != "DaChot")
                throw new InvalidOperationException("Phiếu đối soát phải ở trạng thái Đã chốt.");

            if (pds.TienHoan <= 0)
                throw new InvalidOperationException("Phiếu đối soát này không có tiền cọc cần hoàn trả.");
            if (pds.MaHD is not null)
            {
                var hopDong = await HopDong.LayChiTietHopDong(pds.MaHD)
                    ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng của phiếu đối soát.");
                if (hopDong.TrangThai != "DaThanhLy")
                    throw new InvalidOperationException("Chỉ được hoàn cọc sau khi hợp đồng đã thanh lý.");
            }
            if (await PhieuHoanCoc.DaTonTaiChoPhieuDoiSoat(maPDS))
                throw new InvalidOperationException("Phiếu đối soát đã có phiếu hoàn cọc.");

            var phieuHoanCoc = PhieuHoanCoc.TaoPhieuHoanCoc(
                maPDS, pds.TienHoan, phuongThuc, thongTinNhanTien, maGiaoDich, minhChung, maNV,
                _timeProvider.GetLocalNow().DateTime);

            await phieuHoanCoc.LuuPhieu();
            await PhieuDoiSoat.ChuyenSangDaTatToan(maPDS);

            phien.Commit();

            return phieuHoanCoc;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }
}
