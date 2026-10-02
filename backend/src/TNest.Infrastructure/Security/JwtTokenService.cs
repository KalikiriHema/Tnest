using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using TNest.Application.Common.Interfaces;
using TNest.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace TNest.Infrastructure.Security;

public class JwtTokenService : IJwtTokenService
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryMinutes;

    public JwtTokenService() : this("TNest_SuperSecret_Jwt_EncryptionKey_2026_KeyMustBeLongEnough!", "TNest", "TNestAudience", 60)
    {
    }

    public JwtTokenService(IConfiguration configuration)
    {
        _secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") 
            ?? configuration["Jwt:SecretKey"] 
            ?? "TNest_SuperSecret_Jwt_EncryptionKey_2026_KeyMustBeLongEnough!";
        _issuer = configuration["Jwt:Issuer"] ?? "TNest";
        _audience = configuration["Jwt:Audience"] ?? "TNestAudience";
        _expiryMinutes = int.TryParse(configuration["Jwt:ExpiryMinutes"], out var exp) ? exp : 60;
    }

    public JwtTokenService(string secretKey, string issuer = "TNest", string audience = "TNestAudience", int expiryMinutes = 60)
    {
        _secretKey = secretKey;
        _issuer = issuer;
        _audience = audience;
        _expiryMinutes = expiryMinutes;
    }

    public (string Token, DateTime ExpiresAtUtc) GenerateAccessToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_secretKey);
        var expiresAt = DateTime.UtcNow.AddMinutes(_expiryMinutes);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.Role.ToString()),
            new("phoneNumber", user.PhoneNumber)
        };

        if (user.ClientProfile != null)
        {
            claims.Add(new Claim("clientProfileId", user.ClientProfile.Id.ToString()));
        }

        if (user.ProfessionalProfile != null)
        {
            claims.Add(new Claim("professionalProfileId", user.ProfessionalProfile.Id.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return (tokenHandler.WriteToken(token), expiresAt);
    }

    public (string RefreshToken, DateTime ExpiresAtUtc) GenerateRefreshToken()
    {
        var randomNumber = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomNumber);
        return (Convert.ToBase64String(randomNumber), DateTime.UtcNow.AddDays(7));
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var tokenValidationParameters = new TokenValidationParameters
        {
            ValidateAudience = false,
            ValidateIssuer = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey)),
            ValidateLifetime = false // Here we check expired token
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

        if (securityToken is not JwtSecurityToken jwtSecurityToken || 
            !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
        {
            throw new SecurityTokenException("Invalid token");
        }

        return principal;
    }
}
