namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

public static class KhachHangDB
{
    public static Task<long> LaySoThuTuMoi() =>
        PhienDuLieu.Session.Connection.ExecuteScalarAsync<long>(
            "SELECT NEXT VALUE FOR dbo.Seq_KhachHang",
            transaction: PhienDuLieu.Session.Transaction);

    public static async Task<KhachHang?> TimTheoSoGiayTo(string soGiayTo)
    {
        const string sql = "SELECT * FROM KhachHang WITH (UPDLOCK, HOLDLOCK) WHERE SoGiayTo=@SoGiayTo";
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<KhachHang>(
            sql, new { SoGiayTo = soGiayTo.Trim() }, PhienDuLieu.Session.Transaction);
    }

    public static async Task Them(KhachHang khachHang)
    {
        const string sql = """
            INSERT INTO KhachHang (MaKH,HoTen,NgaySinh,GioiTinh,QuocTich,LoaiGiayTo,SoGiayTo,DiaChiThuongTru,SDT,Email)
            VALUES (@MaKH,@HoTen,@NgaySinh,@GioiTinh,@QuocTich,@LoaiGiayTo,@SoGiayTo,@DiaChiThuongTru,@SDT,@Email)
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, khachHang, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể thêm khách hàng mới.");
    }

    public static async Task CapNhat(KhachHang khachHang)
    {
        const string sql = """
            UPDATE KhachHang SET HoTen=@HoTen, NgaySinh=@NgaySinh, GioiTinh=@GioiTinh,
                QuocTich=@QuocTich, LoaiGiayTo=@LoaiGiayTo, SoGiayTo=@SoGiayTo,
                DiaChiThuongTru=@DiaChiThuongTru, SDT=@SDT, Email=@Email
            WHERE MaKH=@MaKH
            """;
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql, khachHang, PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật khách hàng.");
    }

    public static async Task CapNhatDiaChiThuongTru(string maKH, string diaChiThuongTru)
    {
        const string sql = "UPDATE KhachHang SET DiaChiThuongTru=@DiaChiThuongTru WHERE MaKH=@MaKH";
        if (await PhienDuLieu.Session.Connection.ExecuteAsync(sql,
                new { MaKH = maKH, DiaChiThuongTru = diaChiThuongTru },
                PhienDuLieu.Session.Transaction) != 1)
            throw new InvalidOperationException("Không thể cập nhật địa chỉ thường trú của khách hàng.");
    }

    public static async Task<List<KhachHang>> GetByMaPhieuCoc(string maPhieuCoc)
    {
        const string sql = """
            SELECT kh.MaKH, kh.HoTen, kh.NgaySinh, kh.GioiTinh, kh.QuocTich,
                   kh.LoaiGiayTo, kh.SoGiayTo, kh.SDT, kh.Email, kh.DiaChiThuongTru
            FROM KhachHang kh
            INNER JOIN ThanhVienDangKy tv ON tv.MaKH = kh.MaKH
            WHERE tv.MaPhieuCoc = @MaPhieuCoc
            ORDER BY tv.VaiTro DESC, kh.HoTen
            """;
        return (await PhienDuLieu.Session.Connection.QueryAsync<KhachHang>(sql,
            new { MaPhieuCoc = maPhieuCoc },
            PhienDuLieu.Session.Transaction)).ToList();
    }

    public static async Task<KhachHang?> GetByMaKH(string maKH)
    {
        const string sql = "SELECT * FROM KhachHang WHERE MaKH=@MaKH";
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<KhachHang>(sql,
            new { MaKH = maKH }, PhienDuLieu.Session.Transaction);
    }

    public static async Task<KhachHang?> GetKhachHangTheoMaKH(string maKH)
    {
        const string sql = "SELECT * FROM KhachHang WHERE MaKH = @MaKH";
        return await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<KhachHang>(
            sql, new { MaKH = maKH }, PhienDuLieu.Session.Transaction);
    }
}
