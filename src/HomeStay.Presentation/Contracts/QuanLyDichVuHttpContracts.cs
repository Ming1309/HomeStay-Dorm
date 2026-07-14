namespace HomeStay.Presentation.Contracts;

public sealed record DichVuHttpResponse(
    string MaDV,
    string TenDV,
    string DonViTinh,
    decimal DonGia,
    string TrangThai);

public sealed record LuuDichVuHttpRequest(
    string TenDV,
    string DonViTinh,
    decimal DonGia,
    string TrangThai);
