using System.Data;

namespace HomeStay.Application.DataAccess.DbConnections
{
    public interface ISqlConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
