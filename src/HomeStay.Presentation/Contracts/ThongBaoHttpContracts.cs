namespace HomeStay.Presentation.Contracts;

public sealed record ThongBaoHttpResponse(
    string MaTB,
    string LoaiSuKien,
    string LoaiThongBao,
    string TieuDe,
    string NoiDung,
    string? LienKet,
    string Tone,
    string TrangThai,
    DateTime ThoiGianTao,
    bool DaDoc,
    string? MaThamChieu,
    string? MaNVXuLy,
    string? TenNguoiXuLy,
    DateTime? ThoiGianXuLy);

public sealed record TrangThongBaoHttpResponse(
    IReadOnlyList<ThongBaoHttpResponse> Items,
    int UnreadCount,
    string? NextCursor);
