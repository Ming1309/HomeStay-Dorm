namespace HomeStay.Application.DataAccess.DbConnections;

public sealed class PhienDuLieu : IDisposable
{
    private static readonly AsyncLocal<PhienDuLieu?> PhienHienTai = new();
    private readonly ISqlSession _session;
    private bool _daDong;

    public PhienDuLieu(ISqlSession session)
    {
        if (PhienHienTai.Value is not null)
            throw new InvalidOperationException("Một phiên dữ liệu đang được thực thi.");

        _session = session;
        PhienHienTai.Value = this;
    }

    public static ISqlSession Session => PhienHienTai.Value?._session
        ?? throw new InvalidOperationException("Lớp truy cập dữ liệu phải được gọi trong một phiên dữ liệu.");

    public void BatDauGiaoDich() => _session.BeginTransaction();

    public void Commit() => _session.Commit();

    public void Rollback() => _session.Rollback();

    public void Dispose()
    {
        if (_daDong) return;
        _daDong = true;
        try { _session.Rollback(); } catch { }
        _session.Dispose();
        PhienHienTai.Value = null;
    }
}
