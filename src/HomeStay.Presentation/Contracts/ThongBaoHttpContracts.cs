namespace HomeStay.Presentation.Contracts;

public sealed record ThongBaoHttpResponse(
    string MaTB,
    string TieuDe,
    string NoiDung,
    string VaiTroNhan,
    string? LienKet,
    string Tone,
    DateTime ThoiGianTao,
    bool DaDoc,
    string? MaThamChieu);
