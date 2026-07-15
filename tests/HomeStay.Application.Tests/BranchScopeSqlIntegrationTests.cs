using System.Text.RegularExpressions;
using Microsoft.Data.SqlClient;
using Xunit;

namespace HomeStay.Application.Tests;

public sealed class BranchScopeSqlIntegrationTests
{
    [Fact]
    public async Task InitSeedValidation_VaRlsKhongRoCheoChiNhanh()
    {
        var configured = Environment.GetEnvironmentVariable("HOMESTAY_TEST_CONNECTION_STRING");
        if (string.IsNullOrWhiteSpace(configured)) return;

        var root = TimThuMucGoc();
        var scripts = Path.Combine(root, "src", "HomeStay.Application", "DataAccess", "SqlScripts");
        var masterBuilder = new SqlConnectionStringBuilder(configured) { InitialCatalog = "master" };

        await using (var connection = new SqlConnection(masterBuilder.ConnectionString))
        {
            await connection.OpenAsync();
            foreach (var file in new[]
                     {
                         "01_InitTables.sql", "02_Seeds.sql", "03_Auth.sql",
                         "04_DemoScenarios.sql", "05_ValidateDemoData.sql",
                     })
            {
                var content = await File.ReadAllTextAsync(Path.Combine(scripts, file));
                foreach (var batch in Regex.Split(content, @"^\s*GO\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase))
                {
                    if (string.IsNullOrWhiteSpace(batch)) continue;
                    await using var command = new SqlCommand(batch, connection) { CommandTimeout = 120 };
                    await command.ExecuteNonQueryAsync();
                }
            }
        }

        var appBuilder = new SqlConnectionStringBuilder(configured) { InitialCatalog = "HomeStay" };
        await using var scoped = new SqlConnection(appBuilder.ConnectionString);
        await scoped.OpenAsync();
        await DatPhamVi(scoped, "NV03");
        Assert.Equal(0, await Dem(scoped, "SELECT COUNT(*) FROM PhieuCoc WHERE MaCN='CN02'"));
        Assert.True(await Dem(scoped, "SELECT COUNT(*) FROM PhieuCoc WHERE MaCN='CN01'") > 0);
        Assert.Equal(0, await Dem(scoped, "SELECT COUNT(*) FROM Phong WHERE MaCN='CN02'"));
        Assert.True(await Dem(scoped, "SELECT COUNT(*) FROM Phong WHERE MaCN='CN01'") > 0);
        Assert.Equal(0, await ThucThi(scoped,
            "UPDATE PhieuCoc SET TrangThai=TrangThai WHERE MaPhieuCoc='PC0008'"));

        await DatPhamVi(scoped, "NV04");
        Assert.Equal(0, await Dem(scoped, "SELECT COUNT(*) FROM PhieuCoc WHERE MaCN='CN01'"));
        Assert.True(await Dem(scoped, "SELECT COUNT(*) FROM PhieuCoc WHERE MaCN='CN02'") > 0);
        Assert.Equal(0, await Dem(scoped, "SELECT COUNT(*) FROM Phong WHERE MaCN='CN01'"));
        Assert.True(await Dem(scoped, "SELECT COUNT(*) FROM Phong WHERE MaCN='CN02'") > 0);
    }

    private static async Task DatPhamVi(SqlConnection connection, string maNV)
    {
        await using var command = new SqlCommand("""
            EXEC sys.sp_set_session_context @key=N'MaNV', @value=@MaNV;
            EXEC sys.sp_set_session_context @key=N'BoQuaPhamVi', @value=0;
            """, connection);
        command.Parameters.AddWithValue("@MaNV", maNV);
        await command.ExecuteNonQueryAsync();
    }

    private static async Task<int> Dem(SqlConnection connection, string sql)
    {
        await using var command = new SqlCommand(sql, connection);
        return Convert.ToInt32(await command.ExecuteScalarAsync());
    }

    private static async Task<int> ThucThi(SqlConnection connection, string sql)
    {
        await using var command = new SqlCommand(sql, connection);
        return await command.ExecuteNonQueryAsync();
    }

    private static string TimThuMucGoc()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "HomeStay.sln")))
            directory = directory.Parent;
        return directory?.FullName ?? throw new DirectoryNotFoundException("Không tìm thấy thư mục gốc repository.");
    }
}
