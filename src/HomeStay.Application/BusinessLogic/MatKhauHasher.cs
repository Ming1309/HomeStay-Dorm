namespace HomeStay.Application.BusinessLogic;

using System.Security.Cryptography;

public sealed class MatKhauHasher
{
    private const int SoVongLap = 100_000;
    private const int DoDaiSalt = 16;
    private const int DoDaiHash = 32;

    public string TaoHash(string matKhau)
    {
        var salt = RandomNumberGenerator.GetBytes(DoDaiSalt);
        var hash = Rfc2898DeriveBytes.Pbkdf2(matKhau, salt, SoVongLap, HashAlgorithmName.SHA256, DoDaiHash);
        return $"PBKDF2$SHA256${SoVongLap}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public bool KiemTra(string matKhau, string hashDaLuu)
    {
        var parts = hashDaLuu.Split('$');
        if (parts.Length != 5 || parts[0] != "PBKDF2" || parts[1] != "SHA256" ||
            !int.TryParse(parts[2], out var iterations)) return false;

        try
        {
            var salt = Convert.FromBase64String(parts[3]);
            var expected = Convert.FromBase64String(parts[4]);
            var actual = Rfc2898DeriveBytes.Pbkdf2(matKhau, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch (FormatException) { return false; }
    }
}
