using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Application.DataAccess.FileStorage;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

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

// Register Business Logic dependencies
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<LapPhieuCoc>();
builder.Services.AddScoped<TinhTienCoc>();

// Shared notification service (UC 1.4.17, 1.4.18, ...)
builder.Services.AddScoped<DichVuThongBao>();

// Đối soát / trả phòng / hoàn cọc / thanh toán hợp đồng
builder.Services.AddScoped<LapPhieuDoiSoat>();
builder.Services.AddScoped<ThanhToanTraPhong>();
builder.Services.AddScoped<LapPhieuHoanCoc>();
builder.Services.AddScoped<XuLyThanhToanHopDong>();

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
builder.Services.AddScoped<TaoLichHen>();
builder.Services.AddScoped<TraCuuLichHen>();
builder.Services.AddScoped<SuaLichHen>();
builder.Services.AddScoped<LapPhieuDangKy>();

// UC 1.4.15 Lập biên bản bàn giao
builder.Services.AddScoped<LapBienBanBanGiao>();

var app = builder.Build();

app.Lifetime.ApplicationStarted.Register(() =>
{
    _ = Task.Run(() => app.Services.GetRequiredService<AuthDatabaseInitializer>().TryInitializeAsync());
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();