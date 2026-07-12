namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhieuCocDB
{
    public static async Task Them(PhieuCoc phieu)
    {
        const string insertDeposit = """
            INSERT INTO PhieuCoc (MaPhieuCoc,HanThanhToan,HinhThucThue,SoGiuongThue,TongTien,ThoiDiemCoc,AnhMinhChung,TrangThai,MaKH,MaPhong,MaNV)
            VALUES (@MaPhieuCoc,@HanThanhToan,@HinhThucThue,@SoGiuongThue,@TongTien,@ThoiDiemCoc,@AnhMinhChung,@TrangThai,@MaKH,@MaPhong,@MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertDeposit, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo phiếu cọc.");
        const string insertBed = "INSERT INTO ChiTietPhieuCoc (MaPhieuCoc,MaGiuong) VALUES (@MaPhieuCoc,@MaGiuong)";
        foreach (var giuong in phieu.Giuongs)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertBed, new { phieu.MaPhieuCoc, giuong.MaGiuong }, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("Không thể lưu chi tiết giường của phiếu cọc.");
        const string insertMember = "INSERT INTO ThanhVienDangKy (MaPhieuCoc,MaKH,VaiTro,TrangThaiDuyet) VALUES (@MaPhieuCoc,@MaKH,@VaiTro,@TrangThaiDuyet)";
        foreach (var thanhVien in phieu.ThanhViens)
            if (await PhienDuLieu.Session.Connection.ExecuteAsync(insertMember, thanhVien, PhienDuLieu.Session.Transaction) != 1)
                throw new InvalidOperationException("Không thể lưu thành viên đăng ký của phiếu cọc.");
    }
}
