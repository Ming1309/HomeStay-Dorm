namespace HomeStay.Presentation.Contracts;

public sealed record AssetRecoveryListItemHttpResponse(
    string MaHD,
    string TenKhachHang,
    string SoPhong,
    string? ToaNha,
    DateTime NgayTraPhong,
    string GioTraPhong,
    string MaLH);

public sealed record AssetRecoveryAssetHttpResponse(
    string MaTS,
    string TenTaiSan,
    int SoLuongTieuChuan,
    decimal? GiaTri);

public sealed record AssetRecoveryDetailHttpResponse(
    string MaHD,
    string TenKhachHang,
    string SoPhong,
    string? ToaNha,
    string MaPhong,
    IReadOnlyList<AssetRecoveryAssetHttpResponse> TaiSan);

public sealed record AssetRecoveryInputHttpRequest(
    string MaTS,
    int SoLuong,
    string TinhTrang,
    string? GhiChu,
    string? MinhChung);

public sealed record LapBienBanThuHoiHttpRequest(
    IReadOnlyList<AssetRecoveryInputHttpRequest> Assets);

public sealed record LapBienBanThuHoiHttpResponse(
    string MaBienBan,
    DateTime NgayBanGiao,
    string MaHD,
    string LoaiBienBan);

public sealed record UploadMinhChungThuHoiHttpResponse(
    string DuongDan,
    string TenTep);
