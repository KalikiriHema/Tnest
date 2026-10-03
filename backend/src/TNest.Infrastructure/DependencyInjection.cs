using TNest.Application.Common.Interfaces;
using TNest.Infrastructure.Data;
using TNest.Infrastructure.Matching;
using TNest.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace TNest.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        var rawConnectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? Environment.GetEnvironmentVariable("POSTGRES_CONNECTION_STRING")
            ?? configuration.GetConnectionString("PostgresConnection")
            ?? configuration.GetConnectionString("DefaultConnection");

        var formattedNpgsql = FormatPostgresConnectionString(rawConnectionString ?? "Host=localhost;Port=5432;Database=tnest_db;Username=postgres;Password=pgsql;");
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(formattedNpgsql, npgsqlOptions =>
            {
                npgsqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 5,
                    maxRetryDelay: TimeSpan.FromSeconds(10),
                    errorCodesToAdd: null);
            }));

        services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
        services.AddScoped<IPasswordHasher, Argon2PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IRuleBasedMatcher, RuleBasedMatcher>();

        return services;
    }

    private static string FormatPostgresConnectionString(string connectionString)
    {
        var trimmed = connectionString.Trim();
        if (trimmed.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
            trimmed.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var uri = new Uri(trimmed);
                var userInfo = uri.UserInfo.Split(':');
                var username = userInfo.Length > 0 ? Uri.UnescapeDataString(userInfo[0]) : "postgres";
                var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
                var port = uri.Port > 0 ? uri.Port : 5432;
                var database = uri.AbsolutePath.TrimStart('/');
                if (string.IsNullOrWhiteSpace(database)) database = "postgres";

                var isLocal = uri.Host == "localhost" || uri.Host == "127.0.0.1";
                var sslConfig = isLocal ? "SSL Mode=Prefer;" : "SSL Mode=Require;Trust Server Certificate=true;";

                return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};{sslConfig}";
            }
            catch
            {
                return connectionString;
            }
        }

        var isLocalHost = trimmed.Contains("Host=localhost", StringComparison.OrdinalIgnoreCase) ||
                          trimmed.Contains("Host=127.0.0.1", StringComparison.OrdinalIgnoreCase) ||
                          trimmed.Contains("Server=localhost", StringComparison.OrdinalIgnoreCase) ||
                          trimmed.Contains("Server=127.0.0.1", StringComparison.OrdinalIgnoreCase);

        if (!isLocalHost && !trimmed.Contains("SSL Mode", StringComparison.OrdinalIgnoreCase) && !trimmed.Contains("SslMode", StringComparison.OrdinalIgnoreCase))
        {
            trimmed += ";SSL Mode=Require;Trust Server Certificate=true;";
        }

        return trimmed;
    }
}
