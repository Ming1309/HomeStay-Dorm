namespace HomeStay.Application.DataAccess.DBs;

using Dapper;
using HomeStay.Application.DataAccess.DbConnections;

public static class MaTuDongDB
{
    public static async Task<string> TaoMaMoi(string bang, string cot, string tienTo, int doDaiPhanSo = 4)
    {
        int totalLength = tienTo.Length + doDaiPhanSo;
        var sql = $@"
            SELECT MAX({cot}) 
            FROM {bang} 
            WHERE {cot} LIKE @Prefix + '%' 
              AND LEN({cot}) = @TotalLength";
              
        var maxMa = await PhienDuLieu.Session.Connection.QuerySingleOrDefaultAsync<string>(
            sql, 
            new { Prefix = tienTo, TotalLength = totalLength }, 
            PhienDuLieu.Session.Transaction);

        if (string.IsNullOrEmpty(maxMa)) 
            return $"{tienTo}{1.ToString().PadLeft(doDaiPhanSo, '0')}";

        var numberStr = maxMa.Substring(tienTo.Length);
        if (int.TryParse(numberStr, out var number))
            return $"{tienTo}{(number + 1).ToString().PadLeft(doDaiPhanSo, '0')}";

        return $"{tienTo}{1.ToString().PadLeft(doDaiPhanSo, '0')}";
    }
}
