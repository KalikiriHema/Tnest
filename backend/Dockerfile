# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and project files first for optimal Docker layer caching
COPY ["TNest.sln", "./"]
COPY ["src/TNest.Domain/TNest.Domain.csproj", "src/TNest.Domain/"]
COPY ["src/TNest.Application/TNest.Application.csproj", "src/TNest.Application/"]
COPY ["src/TNest.Infrastructure/TNest.Infrastructure.csproj", "src/TNest.Infrastructure/"]
COPY ["src/TNest.Api/TNest.Api.csproj", "src/TNest.Api/"]
COPY ["tests/TNest.Tests/TNest.Tests.csproj", "tests/TNest.Tests/"]

RUN dotnet restore "TNest.sln"

# Copy the entire backend source code
COPY . .

# Run tests during build
RUN dotnet test "tests/TNest.Tests/TNest.Tests.csproj" -c Release --no-restore

# Publish the Web API
WORKDIR "/src/src/TNest.Api"
RUN dotnet publish "TNest.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Production Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Install curl for container health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

COPY --from=build --chown=1000:1000 /app/publish .

# Default environment variables
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
ENV PORT=8080

USER 1000

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8080/healthz || exit 1

ENTRYPOINT ["dotnet", "TNest.Api.dll"]
