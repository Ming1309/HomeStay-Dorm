namespace HomeStay.Presentation.Contracts;

// UC 1.4.28 - HTTP contracts cho Quan ly chinh sach hoan coc.
// Ty le su dung don vi thap phan 0..1, dong nhat voi domain va DB.

/// <summary>Response trả về một phiên bản chính sách hoàn cọc.</summary>
public sealed record ChinhSachHoanCocResponse(
    string MaChinhSach,
    string TenChinhSach,
    decimal TiLe_ChuaKy,
    decimal TiLe_TruocHan_NganHan,
    decimal TiLe_TruocHan_DaiHan,
    decimal TiLe_DungHan,
    int MocLuuTru,
    DateOnly NgayApDung,
    DateOnly? NgayKetThuc,
    string TrangThai);

/// <summary>Request tạo phiên bản mới. Mỗi tỷ lệ phải nằm trong [0, 1].</summary>
public sealed record TaoPhienBanChinhSachHoanCocRequest(
    string? TenChinhSach,
    decimal? TiLe_ChuaKy,
    decimal? TiLe_TruocHan_NganHan,
    decimal? TiLe_TruocHan_DaiHan,
    decimal? TiLe_DungHan,
    int? MocLuuTru,
    DateOnly? NgayApDung,
    DateOnly? NgayKetThuc);
