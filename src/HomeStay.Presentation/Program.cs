using HomeStay.DataAccess.DbConnections;

var builder = WebApplication.CreateBuilder(args);

// Register Data Access dependencies
builder.Services.AddScoped<ISqlConnectionFactory, SqlConnectionFactory>();

var app = builder.Build();

app.Run();
