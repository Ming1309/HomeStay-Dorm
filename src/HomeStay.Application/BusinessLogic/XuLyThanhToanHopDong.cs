namespace HomeStay.Application.BusinessLogic;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HomeStay.Application.DataAccess.DbConnections;

public sealed class XuLyThanhToanHopDong
{
    private readonly Func<PhienDuLieu> _taoPhienDuLieu;
    private readonly TimeProvider _timeProvider;
    private readonly DichVuThongBao _thongBao;

    public XuLyThanhToanHopDong(Func<PhienDuLieu> taoPhienDuLieu, TimeProvider timeProvider, DichVuThongBao thongBao)
    {
        _taoPhienDuLieu = taoPhienDuLieu;
        _timeProvider = timeProvider;
        _thongBao = thongBao;
    }

    public async Task<IReadOnlyList<HopDongDto>> LayDSChoThanhToan()
    {
        using var phien = _taoPhienDuLieu();
        var dsHD = await HopDong.LayDanhSachChoThanhToan();
        return dsHD.Select(hd => new HopDongDto
        {
            MaHD = hd.MaHD,
            TenKhachHang = hd.KhachHang.HoTen,
            SoPhong = hd.Phong.SoPhong,
            ToaNha = hd.Phong.ToaNha,
            GiaThue = hd.GiaThue,
            KyThanhToan = hd.KyThanhToan ?? 1,
            TongTienCanThu = hd.GiaThue * (hd.KyThanhToan ?? 1)
        }).ToList();
    }

    public async Task<ChiTietThanhToanDto> LayChiTietThanhToan(string maHD)
    {
        using var phien = _taoPhienDuLieu();

        if (string.IsNullOrWhiteSpace(maHD))
            throw new ArgumentException("Mã hợp đồng không được để trống.");

        var hopDong = await HopDong.DocChiTiet(maHD.Trim())
            ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng.");

        hopDong.KiemTraChoThanhToan();

        var dsDV = hopDong.DichVus.Count > 0
            ? hopDong.DichVus
            : (await DichVuHopDong.LayDanhSachTheoHopDong(maHD)).ToList();

        var kyThanhToan = hopDong.KyThanhToan ?? 1;
        var tienThueKyDau = hopDong.GiaThue * kyThanhToan;
        var tienDichVu = dsDV.Sum(dv => dv.DonGiaKyKet);
        var tongCong = tienThueKyDau + tienDichVu;

        return new ChiTietThanhToanDto
        {
            MaHD = hopDong.MaHD,
            TenKhachHang = hopDong.KhachHang?.HoTen ?? string.Empty,
            SoPhong = hopDong.Phong?.SoPhong ?? string.Empty,
            ToaNha = hopDong.Phong?.ToaNha,
            GiaThue = hopDong.GiaThue,
            KyThanhToan = kyThanhToan,
            TienThueKyDau = tienThueKyDau,
            TienDichVu = tienDichVu,
            TongCong = tongCong,
            KhoanThus = BuildKhoanThus(hopDong, dsDV, kyThanhToan)
        };
    }

    public async Task<PhieuThu> TienHanhThuTien(string maHD, string phuongThuc, string? anhMinhChung, string maNV)
    {
        using var phien = _taoPhienDuLieu();
        phien.BatDauGiaoDich();
        try
        {
            var hopDong = await HopDong.DocChiTiet(maHD.Trim())
                ?? throw new KeyNotFoundException("Không tìm thấy hợp đồng.");

            hopDong.KiemTraChoThanhToan();

            if (await HoaDon.KiemTraChuaCoHoaDonKyDau(maHD))
                throw new InvalidOperationException("Hợp đồng này đã có hóa đơn kỳ đầu.");

            var dsDV = hopDong.DichVus.Count > 0
                ? hopDong.DichVus
                : (await DichVuHopDong.LayDanhSachTheoHopDong(maHD)).ToList();

            var kyThanhToan = hopDong.KyThanhToan ?? 1;
            var tienThueKyDau = hopDong.GiaThue * kyThanhToan;
            var tienDichVu = dsDV.Sum(dv => dv.DonGiaKyKet);
            var tongCong = tienThueKyDau + tienDichVu;

            var now = _timeProvider.GetLocalNow().DateTime;
            var maNVTrimmed = maNV.Trim();

            var chiTietList = new List<ChiTietHoaDon>();

            var dongThue = ChiTietHoaDon.TaoDongTienThueKyDau(
                maHoaDon: string.Empty,
                stt: 1,
                donGia: hopDong.GiaThue,
                soLuong: kyThanhToan);
            chiTietList.Add(dongThue);

            var dongDVs = ChiTietHoaDon.TaoDongDichVu(
                string.Empty,
                dsDV,
                sttBatDau: 2);
            chiTietList.AddRange(dongDVs);

            var hoaDon = await HoaDon.TaoHoaDonKyDauDaThanhToan(
                maHD, tongCong, maNVTrimmed, now, chiTietList);

            foreach (var ct in chiTietList)
                ct.MaHoaDon = hoaDon.MaHoaDon;

            await ChiTietHoaDon.LuuDanhSachChiTietHoaDon(chiTietList);

            var phieuThu = PhieuThu.TaoPhieuThuTienHoaDon(
                hoaDon.MaHoaDon, tongCong, phuongThuc, anhMinhChung, maNVTrimmed, now);
            await phieuThu.LuuPhieu();

            await HopDong.CapNhatTrangThaiChoBanGiao(maHD);
            var phieuCoc = hopDong.PhieuCoc ?? await PhieuCoc.DocChiTiet(hopDong.MaPhieuCoc)
                ?? throw new KeyNotFoundException("Không tìm thấy phiếu cọc của hợp đồng.");
            await _thongBao.DongTacVu(
                LoaiSuKienThongBao.HopDongChoThanhToan, maHD, maNVTrimmed);
            await _thongBao.PhatCanXuLyTheoVaiTro(
                LoaiSuKienThongBao.HopDongChoBanGiao,
                phieuCoc.MaCN,
                "QuanLy",
                "Hợp đồng đã thanh toán, chờ bàn giao",
                $"Hợp đồng {maHD} đã thu đủ {tongCong:N0} VNĐ và có thể bàn giao phòng.",
                $"/manager/handover?maHD={Uri.EscapeDataString(maHD)}",
                maHD,
                maNVTrimmed,
                tone: "green");

            phien.Commit();
            return phieuThu;
        }
        catch
        {
            phien.Rollback();
            throw;
        }
    }

    private static List<KhoanThuDto> BuildKhoanThus(HopDong hopDong, IReadOnlyList<DichVuHopDong> dsDV, int kyThanhToan)
    {
        var list = new List<KhoanThuDto>
        {
            new()
            {
                TenKhoanThu = "Tiền thuê phòng",
                SoLuongKy = kyThanhToan,
                DonGia = hopDong.GiaThue,
                ThanhTien = hopDong.GiaThue * kyThanhToan
            }
        };

        foreach (var dv in dsDV)
        {
            if (string.IsNullOrWhiteSpace(dv.MaDV)) continue;
            list.Add(new KhoanThuDto
            {
                TenKhoanThu = dv.DichVu?.TenDV ?? dv.MaDV,
                SoLuongKy = 1,
                DonGia = dv.DonGiaKyKet,
                ThanhTien = dv.DonGiaKyKet
            });
        }

        return list;
    }
}

public sealed class HopDongDto
{
    public string MaHD { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoPhong { get; set; } = string.Empty;
    public string? ToaNha { get; set; }
    public decimal GiaThue { get; set; }
    public int KyThanhToan { get; set; }
    public decimal TongTienCanThu { get; set; }
}

public sealed class ChiTietThanhToanDto
{
    public string MaHD { get; set; } = string.Empty;
    public string TenKhachHang { get; set; } = string.Empty;
    public string SoPhong { get; set; } = string.Empty;
    public string? ToaNha { get; set; }
    public decimal GiaThue { get; set; }
    public int KyThanhToan { get; set; }
    public decimal TienThueKyDau { get; set; }
    public decimal TienDichVu { get; set; }
    public decimal TongCong { get; set; }
    public List<KhoanThuDto> KhoanThus { get; set; } = [];
}

public sealed class KhoanThuDto
{
    public string TenKhoanThu { get; set; } = string.Empty;
    public int SoLuongKy { get; set; }
    public decimal DonGia { get; set; }
    public decimal ThanhTien { get; set; }
}
