namespace HomeStay.BusinessLogic.Services;

using HomeStay.DataAccess.DBs;
using HomeStay.DataAccess.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

public class Phong
{
    private readonly PhongDB _phongDB;

    public Phong(PhongDB phongDB)
    {
        _phongDB = phongDB;
    }

    public async Task<IEnumerable<PhongDTO>> TimKiemPhongConGiuongTrong(int soLuong, string toaNha, string loaiPhong, decimal giaMin, decimal giaMax)
    {
        return await _phongDB.LayDanhSachPhongVaGiuongTrong(soLuong, toaNha, loaiPhong, giaMin, giaMax);
    }

    public async Task<IEnumerable<PhongDTO>> TimKiemPhongTrong(string toaNha, string loaiPhong, decimal giaMin, decimal giaMax)
    {
        return await _phongDB.LayDanhSachPhongTrong(toaNha, loaiPhong, giaMin, giaMax);
    }

    public decimal TinhTienCoc(string maPhong, decimal giaThue, int soLuong, string hinhThuc)
    {
        if (soLuong <= 0)
            return 0;

        return giaThue * soLuong;
    }

    public async Task<bool> CapNhatTrangThai(IEnumerable<string> dsGiuong, string trangThai)
    {
        return await _phongDB.CapNhatTrangThai(dsGiuong, trangThai);
    }

    public async Task<bool> CapNhatTrangThaiPhong(string maPhong, string trangThai)
    {
        return await _phongDB.CapNhatTrangThaiPhong(maPhong, trangThai);
    }
}
