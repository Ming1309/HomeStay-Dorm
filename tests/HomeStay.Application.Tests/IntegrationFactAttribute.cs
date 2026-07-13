using Xunit;

namespace HomeStay.Application.Tests;

public sealed class IntegrationFactAttribute : FactAttribute
{
    public const string ConnectionStringEnvironmentVariable = "HOMESTAY_TEST_CONNECTION_STRING";

    public IntegrationFactAttribute()
    {
        if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariable)))
        {
            Skip = $"Set {ConnectionStringEnvironmentVariable} to run database integration tests.";
        }
    }
}
