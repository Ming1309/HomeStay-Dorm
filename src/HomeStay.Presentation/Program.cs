using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;
using HomeStay.Application.DataAccess.FileStorage;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
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

// Register Business Logic dependencies
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<LapPhieuCoc>();
builder.Services.AddScoped<TinhTienCoc>();
builder.Services.AddScoped<GhiNhanThanhToanCoc>();
builder.Services.AddSingleton<MatKhauHasher>();
builder.Services.AddScoped<XacThucNguoiDung>();
builder.Services.AddScoped<QuanLyNguoiDung>();

var app = builder.Build();

app.Lifetime.ApplicationStarted.Register(() =>
{
    _ = Task.Run(() => app.Services.GetRequiredService<AuthDatabaseInitializer>().TryInitializeAsync());
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
