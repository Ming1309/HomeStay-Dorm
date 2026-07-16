using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Application.DataAccess.FileStorage;
using HomeStay.Presentation.HostedServices;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

var cauHinhHetHanPhieuCoc = builder.Configuration
    .GetSection(CauHinhHetHanPhieuCoc.TenSection)
    .Get<CauHinhHetHanPhieuCoc>() ?? new CauHinhHetHanPhieuCoc();
cauHinhHetHanPhieuCoc.KiemTraHopLe();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "homestay.auth";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Lax;
        options.Events.OnRedirectToLogin = context => { context.Response.StatusCode = StatusCodes.Status401Unauthorized; return Task.CompletedTask; };
        options.Events.OnRedirectToAccessDenied = context => { context.Response.StatusCode = StatusCodes.Status403Forbidden; return Task.CompletedTask; };
    });
builder.Services.AddAuthorization();

builder.Services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();
builder.Services.AddSingleton<AuthDatabaseInitializer>();
builder.Services.AddScoped<Func<PhienDuLieu>>(provider =>
    () => new PhienDuLieu(new SqlSession(provider.GetRequiredService<ISqlConnectionFactory>())));
builder.Services.AddSingleton<IChungTuCocStorage>(new ChungTuCocFileStorage(
    Path.Combine(builder.Environment.ContentRootPath, "App_Data", "ChungTuCoc")));
builder.Services.AddSingleton<IMinhChungThuHoiStorage>(new MinhChungThuHoiFileStorage(
    Path.Combine(builder.Environment.ContentRootPath, "App_Data", "MinhChungThuHoi")));
builder.Services.AddSingleton<IChungTuTaiChinhStorage>(new ChungTuTaiChinhFileStorage(
    Path.Combine(builder.Environment.ContentRootPath, "App_Data", "ChungTuTaiChinh")));
var thuMucQuyDinh = Path.Combine(builder.Environment.ContentRootPath, "App_Data", "QuyDinh");
var thuMucQuyDinhMau = Path.Combine(builder.Environment.ContentRootPath, "SeedData");
builder.Services.AddSingleton<IQuyDinhFileStorage>(
    new QuyDinhFileStorage(thuMucQuyDinh, thuMucQuyDinhMau));

// Register Business Logic dependencies
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton(cauHinhHetHanPhieuCoc);
if (!builder.Environment.IsEnvironment("Testing"))
    builder.Services.AddHostedService<TuDongHuyPhieuCocQuaHanWorker>();
builder.Services.AddScoped<LapPhieuCoc>();
builder.Services.AddScoped<TinhTienCoc>();

// Shared notification service (UC 1.4.17, 1.4.18, ...)
builder.Services.AddScoped<DichVuThongBao>();

// Đối soát / trả phòng / hoàn cọc / thanh toán hợp đồng
builder.Services.AddScoped<LapPhieuDoiSoat>();
builder.Services.AddScoped<XacNhanPhieuDoiSoat>();
builder.Services.AddScoped<ThanhToanTraPhong>();
builder.Services.AddScoped<LapPhieuHoanCoc>();
builder.Services.AddScoped<XuLyThanhToanHopDong>();
builder.Services.AddScoped<KiemTraQuyenChungTu>();

// Cọc / hồ sơ / lịch hẹn
builder.Services.AddScoped<NhapHoSoLuuTru>();
builder.Services.AddScoped<GhiNhanThanhToanCoc>();
builder.Services.AddScoped<XacNhanKhoanTienCoc>();
builder.Services.AddScoped<TraCuuPhieuCoc>();
builder.Services.AddScoped<HuyPhieuCoc>();
builder.Services.AddScoped<XetDuyetHoSo>();
builder.Services.AddScoped<TraCuuHopDong>();
builder.Services.AddScoped<LapBienBanThuHoiTaiSan>();

builder.Services.AddSingleton<MatKhauHasher>();
builder.Services.AddScoped<XacThucNguoiDung>();
builder.Services.AddScoped<QuanLyNguoiDung>();
builder.Services.AddScoped<QuanLyPhongGiuong>();
builder.Services.AddScoped<QuanLyDichVu>();
builder.Services.AddScoped<QuanLyTaiSan>();
builder.Services.AddScoped<QuanLyQuyDinh>();
builder.Services.AddScoped<QuanLyChinhSachHoanCoc>();
builder.Services.AddScoped<TaoLichHen>();
builder.Services.AddScoped<TraCuuLichHen>();
builder.Services.AddScoped<SuaLichHen>();
builder.Services.AddScoped<LapPhieuDangKy>();
builder.Services.AddScoped<LapHopDongThue>();

// UC 1.4.15 Lập biên bản bàn giao
builder.Services.AddScoped<LapBienBanBanGiao>();

// Dashboard tổng quan theo role
builder.Services.AddScoped<TongQuanDashboard>();

var app = builder.Build();

if (!app.Environment.IsEnvironment("Testing"))
{
    app.Lifetime.ApplicationStarted.Register(() =>
    {
        _ = Task.Run(() => app.Services.GetRequiredService<AuthDatabaseInitializer>().TryInitializeAsync());
    });
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.Use(async (context, next) =>
{
    using var phamVi = PhamViThucThi.BatDau(
        context.User.FindFirstValue("MaNV"),
        context.User.FindFirstValue(ClaimTypes.Role));
    await next();
});
app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (SqlException ex) when (!context.Response.HasStarted && ex.Number == 33504)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsJsonAsync(new { Message = "Không tìm thấy hồ sơ." });
    }
    catch (SqlException ex) when (!context.Response.HasStarted && ex.Number is 2601 or 2627 or 1205)
    {
        context.Response.StatusCode = StatusCodes.Status409Conflict;
        await context.Response.WriteAsJsonAsync(new { Message = "Dữ liệu vừa được xử lý bởi yêu cầu khác. Vui lòng tải lại." });
    }
});
app.UseAuthorization();
app.MapControllers();

app.Run();

public partial class Program { }
