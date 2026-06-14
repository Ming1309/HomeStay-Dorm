namespace HomeStay.BusinessLogic.Services;

using HomeStay.DataAccess.DBs;
using HomeStay.DataAccess.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Transactions;

public class PhieuCoc
{
    private readonly KhachHang _khachHang;
    private readonly PhieuCocDB _phieuCocDB;
    private readonly Phong _phong;
    private readonly LichHen _lichHen;

    public PhieuCoc(KhachHang khachHang, PhieuCocDB phieuCocDB, Phong phong, LichHen lichHen)
    {
        _khachHang = khachHang;
        _phieuCocDB = phieuCocDB;
        _phong = phong;
        _lichHen = lichHen;
    }

    public async Task<bool> TaoPhieuCoc(
        string maLichHen,
        KhachHangDTO kh,
        PhieuCocDTO pc,
        List<string> dsGiuong)
    {
        using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);

        try
        {
            // 8.1.1. CapNhatThongTin(kh)
            await _khachHang.CapNhatThongTin(kh);
            
            // Sync MaKH in case it was updated to an existing customer's ID
            pc.MaKH = kh.MaKH;

            // 8.1.2. ThemPhieuCoc(pc)
            await _phieuCocDB.ThemPhieuCoc(pc);

            // 8.1.3. ThemChiTiet(pc.MaPhieu, dsGiuong)
            await _phieuCocDB.ThemChiTiet(pc.MaPhieuCoc, dsGiuong);

            // 8.1.4. ThemThanhVien(pc.MaPhieu, kh.MaKH, "DaiDien")
            await _phieuCocDB.ThemThanhVien(pc.MaPhieuCoc, kh.MaKH, "DaiDien");

            // 8.1.5. CapNhatTrangThai(dsGiuong, "GiuCho")
            await _phong.CapNhatTrangThai(dsGiuong, "GiuCho");

            if (pc.HinhThucThue == "NguyenCan")
            {
                await _phong.CapNhatTrangThaiPhong(pc.MaPhong, "GiuCho");
            }

            await _lichHen.GanPhieuCoc(maLichHen, pc.MaPhieuCoc);

            scope.Complete();
            return true;
        }
        catch (Exception)
        {
            throw;
        }
    }
}
