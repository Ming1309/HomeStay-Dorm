namespace HomeStay.Application.DataAccess.DbConnections;

public sealed class PhamViThucThi : IDisposable
{
    private static readonly AsyncLocal<ThongTinPhamVi?> HienTai = new();
    private readonly ThongTinPhamVi? _truocDo;

    private PhamViThucThi(ThongTinPhamVi? truocDo) => _truocDo = truocDo;

    public static string? MaNV => HienTai.Value?.MaNV;
    public static bool BoQuaPhamVi => HienTai.Value?.BoQuaPhamVi ?? true;

    public static PhamViThucThi BatDau(string? maNV, string? vaiTro)
    {
        var truocDo = HienTai.Value;
        var boQua = string.Equals(vaiTro, "QuanTri", StringComparison.OrdinalIgnoreCase);
        HienTai.Value = new ThongTinPhamVi(maNV, boQua);
        return new PhamViThucThi(truocDo);
    }

    public void Dispose() => HienTai.Value = _truocDo;

    private sealed record ThongTinPhamVi(string? MaNV, bool BoQuaPhamVi);
}
