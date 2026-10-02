using Microsoft.Extensions.DependencyInjection;

namespace TNest.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Add Application Services, MediatR, FluentValidation or AutoMapper as needed
        return services;
    }
}
