namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class PhieuDangKyDB
{
    // Cài đặt tối thiểu để phục vụ tra cứu tạo lịch hẹn (Tránh conflict với người làm UC1)
    public static async Task<IReadOnlyList<dynamic>> TimKiemPhieuDuDieuKien(string? tuKhoa)
    {
        const string sql = """
            SELECT pdk.MaPDK, pdk.TrangThai, kh.MaKH, kh.HoTen, kh.SDT
            FROM PhieuDangKy pdk
            JOIN KhachHang kh ON pdk.MaKH = kh.MaKH
            WHERE pdk.TrangThai = N'DangXuLy'
              AND (@TuKhoa IS NULL OR pdk.MaPDK LIKE '%' + @TuKhoa + '%' OR kh.HoTen LIKE '%' + @TuKhoa + '%' OR kh.SDT LIKE '%' + @TuKhoa + '%')
            ORDER BY pdk.MaPDK DESC
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync(
            sql, new { TuKhoa = string.IsNullOrWhiteSpace(tuKhoa) ? null : tuKhoa.Trim() }, PhienDuLieu.Session.Transaction);
        return rows.ToList();
    }

    public static async Task<bool> KiemTraConHopLe(string maPDK)
    {
        const string sql = "SELECT COUNT(1) FROM PhieuDangKy WHERE MaPDK = @MaPDK AND TrangThai = N'DangXuLy'";
        return await PhienDuLieu.Session.Connection.ExecuteScalarAsync<int>(
            sql, new { MaPDK = maPDK }, PhienDuLieu.Session.Transaction) > 0;
    }

    public static async Task Them(PhieuDangKy phieu)
    {
        const string sql = """
            INSERT INTO PhieuDangKy (MaPDK,KhuVuc,SoLuongNguoi,LoaiDichVu,MucGia,ThoiGianDuKienVao,ThoiHanThue,YeuCauKhac,TrangThai,MaKH,MaNV)
            VALUES (@MaPDK,@KhuVuc,@SoLuongNguoi,@LoaiDichVu,@MucGia,@ThoiGianDuKienVao,@ThoiHanThue,@YeuCauKhac,@TrangThai,@MaKH,@MaNV)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, phieu, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể tạo phiếu đăng ký.");
    }

    public static async Task<PhieuDangKy?> LayTheoMa(string maPDK)
    {
        const string sql = """
            SELECT pdk.MaPDK,pdk.KhuVuc,pdk.SoLuongNguoi,pdk.LoaiDichVu,pdk.MucGia,
                   pdk.ThoiGianDuKienVao,pdk.ThoiHanThue,pdk.YeuCauKhac,pdk.TrangThai,pdk.MaKH,pdk.MaNV,
                   kh.MaKH,kh.HoTen,kh.GioiTinh,kh.NgaySinh,kh.QuocTich,
                   kh.LoaiGiayTo,kh.SoGiayTo,kh.DiaChiThuongTru,kh.SDT,kh.Email
            FROM PhieuDangKy pdk
            LEFT JOIN KhachHang kh ON pdk.MaKH=kh.MaKH
            WHERE pdk.MaPDK=@MaPDK
            """;
        var rows = await PhienDuLieu.Session.Connection.QueryAsync<PhieuDangKy, KhachHang, PhieuDangKy>(
            sql, (phieu, khach) =>
            {
                phieu.KhachHang = string.IsNullOrWhiteSpace(khach?.MaKH) ? null : khach;
                return phieu;
            },
            new { MaPDK = maPDK }, PhienDuLieu.Session.Transaction, splitOn: "MaKH");
        return rows.SingleOrDefault();
    }

    public static async Task<IReadOnlyList<PhieuDangKy>> TimKiem(string? sdt, string? soGiayTo, string? email)
    {
        if (string.IsNullOrWhiteSpace(sdt) && string.IsNullOrWhiteSpace(soGiayTo) && string.IsNullOrWhiteSpace(email))
            throw new InvalidOperationException("Vui lòng nhập ít nhất một tiêu chí tìm kiếm.");

        const string sql = """
            SELECT pdk.MaPDK,pdk.KhuVuc,pdk.SoLuongNguoi,pdk.LoaiDichVu,pdk.MucGia,
                   pdk.ThoiGianDuKienVao,pdk.ThoiHanThue,pdk.YeuCauKhac,pdk.TrangThai,pdk.MaKH,pdk.MaNV,
                   kh.MaKH,kh.HoTen,kh.GioiTinh,kh.NgaySinh,kh.QuocTich,
                   kh.LoaiGiayTo,kh.SoGiayTo,kh.DiaChiThuongTru,kh.SDT,kh.Email
            FROM PhieuDangKy pdk
            LEFT JOIN KhachHang kh ON pdk.MaKH=kh.MaKH
            WHERE (@SDT IS NULL OR kh.SDT=@SDT)
              AND (@SoGiayTo IS NULL OR kh.SoGiayTo=@SoGiayTo)
              AND (@Email IS NULL OR kh.Email=@Email)
            ORDER BY pdk.MaPDK DESC
            """;
        var dict = new Dictionary<string, PhieuDangKy>();
        await PhienDuLieu.Session.Connection.QueryAsync<PhieuDangKy, KhachHang, PhieuDangKy>(
            sql, (phieu, khach) =>
            {
                if (!dict.TryGetValue(phieu.MaPDK, out var current))
                {
                    current = phieu;
                    current.KhachHang = string.IsNullOrWhiteSpace(khach?.MaKH) ? null : khach;
                    dict.Add(current.MaPDK, current);
                }
                return current;
            },
            new
            {
                SDT = string.IsNullOrWhiteSpace(sdt) ? null : sdt.Trim(),
                SoGiayTo = string.IsNullOrWhiteSpace(soGiayTo) ? null : soGiayTo.Trim(),
                Email = string.IsNullOrWhiteSpace(email) ? null : email.Trim()
            },
            PhienDuLieu.Session.Transaction, splitOn: "MaKH");
        return dict.Values.ToList();
    }
}
