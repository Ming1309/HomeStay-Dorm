namespace HomeStay.Presentation.Contracts;

public sealed record TaiSanHttpResponse(
    string MaTS,
    string TenTaiSan,
    string LoaiTaiSan,
    decimal GiaTri,
    string? MoTa,
    string TrangThai);

public sealed record LuuTaiSanHttpRequest(
    string TenTaiSan,
    string LoaiTaiSan,
    decimal GiaTri,
    string? MoTa,
    string TrangThai);
