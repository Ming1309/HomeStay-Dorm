using HomeStay.DataAccess.DbConnections;
using HomeStay.DataAccess.DBs;
using HomeStay.BusinessLogic.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Register Data Access dependencies
builder.Services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>(); // Giữ ISqlConnectionFactory vì nó là pattern chuẩn cho factory
builder.Services.AddScoped<KhachHangDB>();
builder.Services.AddScoped<PhieuCocDB>();
builder.Services.AddScoped<PhongDB>();
builder.Services.AddScoped<LichHenDB>();

// Register Business Logic dependencies
builder.Services.AddScoped<KhachHang>();
builder.Services.AddScoped<PhieuCoc>();
builder.Services.AddScoped<Phong>();
builder.Services.AddScoped<LichHen>();

var app = builder.Build();

app.MapControllers();

app.Run();
