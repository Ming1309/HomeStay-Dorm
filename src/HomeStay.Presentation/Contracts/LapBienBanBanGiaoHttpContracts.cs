namespace HomeStay.Presentation.Contracts;

public sealed record HandoverListItemHttpResponse(
    string MaHD,
    string TenKhachHang,
    string SoPhong,
    string? ToaNha);

public sealed record HandoverAssetHttpResponse(
    string MaTS,
    string TenTaiSan,
    int SoLuongTieuChuan);

public sealed record HandoverDetailHttpResponse(
    string MaHD,
    string TenKhachHang,
    string SoPhong,
    string? ToaNha,
    string MaPhong,
    IReadOnlyList<HandoverAssetHttpResponse> TaiSan);

public sealed record HandoverAssetInputHttpRequest(
    string MaTS,
    int SoLuong,
    string TinhTrang,
    string? GhiChu);

public sealed record LapBienBanBanGiaoHttpRequest(
    IReadOnlyList<HandoverAssetInputHttpRequest> Assets);

public sealed record LapBienBanBanGiaoHttpResponse(
    string MaBienBan,
    DateTime NgayBanGiao,
    string MaHD,
    string LoaiBienBan);
