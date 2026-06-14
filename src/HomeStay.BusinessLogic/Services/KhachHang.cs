namespace HomeStay.BusinessLogic.Services;

using HomeStay.DataAccess.DBs;
using HomeStay.DataAccess.DTOs;
using System.Threading.Tasks;

public class KhachHang
{
    private readonly KhachHangDB _khachHangDB;

    public KhachHang(KhachHangDB khachHangDB)
    {
        _khachHangDB = khachHangDB;
    }

    public async Task<KhachHangDTO> LayThongTinKhachHang(string maKH)
    {
        return await _khachHangDB.DocThongTin(maKH);
    }

    public async Task<bool> CapNhatThongTin(KhachHangDTO kh)
    {
        return await _khachHangDB.CapNhat(kh);
    }
}
