namespace HomeStay.Application.BusinessLogic;

public sealed class DichVuThongBao
{
    public Task GuiThongBaoQuanLy(string maPDS)
    {
        System.Diagnostics.Debug.WriteLine($"[Thông báo] Đã lập phiếu đối soát thành công: {maPDS}");
        return Task.CompletedTask;
    }
}
