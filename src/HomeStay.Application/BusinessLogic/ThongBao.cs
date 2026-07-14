namespace HomeStay.Application.BusinessLogic;

using HomeStay.Application.DataAccess.DBs;

public sealed class ThongBao
{
    public string MaTB { get; set; } = string.Empty;
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string VaiTroNhan { get; set; } = string.Empty;
    public string? LienKet { get; set; }
    public string Tone { get; set; } = "blue";
    public DateTime ThoiGianTao { get; set; }
    public string? MaNVGui { get; set; }
    public string? MaThamChieu { get; set; }
    public bool DaDoc { get; set; }

    public static ThongBao Tao(
        string maTB,
        string tieuDe,
        string noiDung,
        string vaiTroNhan,
        string? lienKet,
        string tone,
        string? maNVGui,
        string? maThamChieu,
        DateTime thoiGianTao)
    {
        if (string.IsNullOrWhiteSpace(tieuDe))
            throw new ArgumentException("Tiêu đề thông báo không được để trống.");
        if (string.IsNullOrWhiteSpace(noiDung))
            throw new ArgumentException("Nội dung thông báo không được để trống.");
        if (string.IsNullOrWhiteSpace(vaiTroNhan))
            throw new ArgumentException("Vai trò nhận thông báo không được để trống.");

        return new ThongBao
        {
            MaTB = maTB,
            TieuDe = tieuDe.Trim(),
            NoiDung = noiDung.Trim(),
            VaiTroNhan = vaiTroNhan.Trim(),
            LienKet = string.IsNullOrWhiteSpace(lienKet) ? null : lienKet.Trim(),
            Tone = string.IsNullOrWhiteSpace(tone) ? "blue" : tone.Trim(),
            ThoiGianTao = thoiGianTao,
            MaNVGui = maNVGui,
            MaThamChieu = maThamChieu,
        };
    }

    public Task Luu() => ThongBaoDB.Them(this);

    public static Task<IReadOnlyList<ThongBao>> LayTheoVaiTro(string vaiTro, string maNV, int soLuong = 20) =>
        ThongBaoDB.LayTheoVaiTro(vaiTro, maNV, soLuong);

    public static Task DanhDauDaDoc(string maTB, string maNV, DateTime thoiGianDoc) =>
        ThongBaoDB.DanhDauDaDoc(maTB, maNV, thoiGianDoc);

    public static Task DanhDauTatCaDaDoc(string vaiTro, string maNV, DateTime thoiGianDoc) =>
        ThongBaoDB.DanhDauTatCaDaDoc(vaiTro, maNV, thoiGianDoc);
}
