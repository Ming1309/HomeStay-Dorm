namespace HomeStay.Application.DataAccess.DbConnections;

using System.Data;

public interface ISqlSession : IDisposable
{
    IDbConnection Connection { get; }
    IDbTransaction? Transaction { get; }
    void BeginTransaction(IsolationLevel isolationLevel = IsolationLevel.Serializable);
    void Commit();
    void Rollback();
}

public sealed class SqlSession : ISqlSession
{
    private readonly ISqlConnectionFactory _factory;
    private IDbConnection? _connection;

    public SqlSession(ISqlConnectionFactory factory) => _factory = factory;

    public IDbConnection Connection => _connection ??= _factory.CreateConnection();
    public IDbTransaction? Transaction { get; private set; }

    public void BeginTransaction(IsolationLevel isolationLevel = IsolationLevel.Serializable)
    {
        if (Transaction is not null)
            throw new InvalidOperationException("Một transaction đang được thực thi.");
        Transaction = Connection.BeginTransaction(isolationLevel);
    }

    public void Commit()
    {
        Transaction?.Commit();
        EndTransaction();
    }

    public void Rollback()
    {
        if (Transaction is null) return;
        Transaction.Rollback();
        EndTransaction();
    }

    public void Dispose()
    {
        try { Rollback(); } catch { }
        _connection?.Dispose();
    }

    private void EndTransaction()
    {
        Transaction?.Dispose();
        Transaction = null;
    }
}
