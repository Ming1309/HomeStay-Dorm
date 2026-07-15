using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace HomeStay.Application.DataAccess.DbConnections
{
    public class SqlConnectionFactory : ISqlConnectionFactory
    {
        private readonly IConfiguration _configuration;

        public SqlConnectionFactory(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public IDbConnection CreateConnection()
        {
            var connectionString = _configuration.GetConnectionString("DefaultConnection");
            var connection = new SqlConnection(connectionString);
            connection.Open();
            using var command = connection.CreateCommand();
            command.CommandText = """
                EXEC sys.sp_set_session_context @key=N'MaNV', @value=@MaNV;
                EXEC sys.sp_set_session_context @key=N'BoQuaPhamVi', @value=@BoQuaPhamVi;
                """;
            command.Parameters.AddWithValue("@MaNV", (object?)PhamViThucThi.MaNV ?? DBNull.Value);
            command.Parameters.AddWithValue("@BoQuaPhamVi", PhamViThucThi.BoQuaPhamVi ? 1 : 0);
            command.ExecuteNonQuery();
            return connection;
        }
    }
}
