namespace HomeStay.BusinessLogic.Services;

using HomeStay.DataAccess.DBs;
using HomeStay.DataAccess.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

public class LichHen
{
    private readonly LichHenDB _lichHenDB;

    public LichHen(LichHenDB lichHenDB)
    {
        _lichHenDB = lichHenDB;
    }

    public async Task<IEnumerable<LichHenDTO>> LayDanhSachXemPhong(string trangThai)
    {
        return await _lichHenDB.LayDanhSach("XemPhong", trangThai);
    }

    public async Task<IEnumerable<LichHenDTO>> TimKiemXemPhongHoanThanh(string txtText)
    {
        return await _lichHenDB.TimKiem(txtText, "XemPhong", "DaHoanThanh");
    }

    public async Task<string?> LayMaKhachHang(string maLH)
    {
        return await _lichHenDB.LayMaKhachHang(maLH);
    }

    public async Task<bool> GanPhieuCoc(string maLichHen, string maPhieuCoc)
    {
        return await _lichHenDB.GanPhieuCoc(maLichHen, maPhieuCoc);
    }

    public async Task<bool> HoanThanh(string maLichHen)
    {
        return await _lichHenDB.CapNhatTrangThai(maLichHen, "DaHoanThanh");
    }
}
