namespace HomeStay.Presentation.HostedServices;

using HomeStay.Application.BusinessLogic;

public sealed class TuDongHuyPhieuCocQuaHanWorker(
    IServiceScopeFactory scopeFactory,
    CauHinhHetHanPhieuCoc cauHinh,
    TimeProvider timeProvider,
    ILogger<TuDongHuyPhieuCocQuaHanWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await QuetQuaHan();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Không thể quét phiếu cọc quá hạn. Worker sẽ thử lại ở lượt sau.");
            }

            try
            {
                await Task.Delay(cauHinh.ChuKyQuet, timeProvider, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }
    }

    private async Task QuetQuaHan()
    {
        using var scope = scopeFactory.CreateScope();
        var huyPhieuCoc = scope.ServiceProvider.GetRequiredService<HuyPhieuCoc>();
        var now = timeProvider.GetLocalNow().DateTime;
        var danhSach = await huyPhieuCoc.LayDanhSachMaQuaHan(now, cauHinh.BatchSize);
        var daHuy = 0;

        foreach (var maPhieuCoc in danhSach)
        {
            try
            {
                if (await huyPhieuCoc.TuDongHuyQuaHan(maPhieuCoc, now))
                    daHuy++;
            }
            catch (Exception ex)
            {
                logger.LogError(ex,
                    "Không thể tự động hủy phiếu cọc quá hạn {MaPhieuCoc}.", maPhieuCoc);
            }
        }

        if (daHuy > 0)
            logger.LogInformation("Đã tự động hủy {SoLuong} phiếu cọc quá hạn.", daHuy);
    }
}
