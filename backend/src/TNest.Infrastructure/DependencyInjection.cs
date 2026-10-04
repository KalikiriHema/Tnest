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
        try
        {
            var builder = new Npgsql.NpgsqlConnectionStringBuilder(trimmed);
            var isLocal = string.Equals(builder.Host, "localhost", StringComparison.OrdinalIgnoreCase) ||
                          string.Equals(builder.Host, "127.0.0.1", StringComparison.OrdinalIgnoreCase);

            if (!isLocal)
            {
                builder.SslMode = Npgsql.SslMode.Require;
            }

            return builder.ConnectionString;
        }
        catch
        {
            return trimmed;
        }
    }
}
