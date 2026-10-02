using TNest.Domain.Entities;
using System.Security.Claims;

namespace TNest.Application.Common.Interfaces;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAtUtc) GenerateAccessToken(User user);
    (string RefreshToken, DateTime ExpiresAtUtc) GenerateRefreshToken();
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
}
