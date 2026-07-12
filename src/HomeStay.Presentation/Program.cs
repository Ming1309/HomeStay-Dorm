using HomeStay.Application.BusinessLogic;
using HomeStay.Application.DataAccess.DbConnections;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSingleton<ISqlConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<Func<PhienDuLieu>>(provider =>
    () => new PhienDuLieu(new SqlSession(provider.GetRequiredService<ISqlConnectionFactory>())));

// Register Business Logic dependencies
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<LapPhieuCoc>();

var app = builder.Build();

app.MapControllers();

app.Run();
