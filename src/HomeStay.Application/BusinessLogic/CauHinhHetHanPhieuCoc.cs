namespace HomeStay.Application.BusinessLogic;

public sealed class CauHinhHetHanPhieuCoc
{
    public const string TenSection = "DepositExpiry";

    public int PaymentDeadlineMinutes { get; set; } = 24 * 60;
    public int ScanIntervalSeconds { get; set; } = 60;
    public int BatchSize { get; set; } = 50;

    public TimeSpan ThoiHanThanhToan => TimeSpan.FromMinutes(PaymentDeadlineMinutes);
    public TimeSpan ChuKyQuet => TimeSpan.FromSeconds(ScanIntervalSeconds);

    public void KiemTraHopLe()
    {
        if (PaymentDeadlineMinutes <= 0)
            throw new InvalidOperationException("DepositExpiry:PaymentDeadlineMinutes phải lớn hơn 0.");
        if (ScanIntervalSeconds <= 0)
            throw new InvalidOperationException("DepositExpiry:ScanIntervalSeconds phải lớn hơn 0.");
        if (BatchSize <= 0)
            throw new InvalidOperationException("DepositExpiry:BatchSize phải lớn hơn 0.");
    }
}
