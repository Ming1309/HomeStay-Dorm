using System.Data;

namespace HomeStay.DataAccess.DbConnections
{
    public interface ISqlConnectionFactory
    {
        IDbConnection CreateConnection();
    }
}
