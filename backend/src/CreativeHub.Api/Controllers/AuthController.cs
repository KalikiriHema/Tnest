using System.Security.Claims;
using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Data;
using CreativeHub.Infrastructure.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthController(AppDbContext context, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
    }

    public record RegisterRequest(
        string FullName,
        string Email,
        string PhoneNumber,
        string Password,
        string Role, // "Client" or "Professional"
        string? CompanyName = null,
        string? Headline = null
    );

    public record LoginRequest(string Email, string Password);
    public record RefreshRequest(string RefreshToken);

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FullName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.PhoneNumber) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Full Name, Email, Phone Number, and Password are required." });
        }

        if (await _context.Users.AnyAsync(u => u.Email.ToLower() == request.Email.ToLower()))
        {
            return Conflict(new { message = "A user with this email address already exists." });
        }

        if (!Enum.TryParse<UserRole>(request.Role, true, out var role) || role == UserRole.Admin)
        {
            role = UserRole.Client;
        }

        var passwordHash = _passwordHasher.HashPassword(request.Password);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            PhoneNumber = request.PhoneNumber.Trim(),
            PasswordHash = passwordHash,
            Role = role,
            IsEmailVerified = true,
            IsPhoneVerified = true
        };

        if (role == UserRole.Client)
        {
            user.ClientProfile = new ClientProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CompanyName = request.CompanyName ?? request.FullName,
                ContactName = request.FullName
            };
        }
        else if (role == UserRole.Professional)
        {
            var slug = request.FullName.ToLowerInvariant().Replace(" ", "-") + "-" + Random.Shared.Next(100, 999);
            user.ProfessionalProfile = new ProfessionalProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                DisplayName = request.FullName,
                Slug = slug,
                Headline = request.Headline ?? "Creative Professional & Content Specialist",
                Bio = "Passionate creative producing high-retention digital media assets.",
                HourlyRate = 2000,
                TurnaroundDays = 3,
                Languages = new List<string> { "English" }
            };
        }

        _context.Users.Add(user);

        var (refreshToken, refreshExpires) = _jwtTokenService.GenerateRefreshToken();
        user.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshToken,
            ExpiresAtUtc = refreshExpires,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        });

        await _context.SaveChangesAsync();

        var (accessToken, accessExpires) = _jwtTokenService.GenerateAccessToken(user);

        return Ok(new
        {
            token = accessToken,
            refreshToken,
            expiresAt = accessExpires,
            user = new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                role = user.Role.ToString(),
                clientProfileId = user.ClientProfile?.Id,
                professionalProfileId = user.ProfessionalProfile?.Id,
                slug = user.ProfessionalProfile?.Slug
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.ClientProfile)
            .Include(u => u.ProfessionalProfile)
            .Include(u => u.RefreshTokens)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password credentials." });
        }

        var (accessToken, accessExpires) = _jwtTokenService.GenerateAccessToken(user);
        var (refreshToken, refreshExpires) = _jwtTokenService.GenerateRefreshToken();

        user.RefreshTokens.Add(new RefreshToken
        {
            Token = refreshToken,
            ExpiresAtUtc = refreshExpires,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        });

        await _context.SaveChangesAsync();

        return Ok(new
        {
            token = accessToken,
            refreshToken,
            expiresAt = accessExpires,
            user = new
            {
                id = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phoneNumber = user.PhoneNumber,
                role = user.Role.ToString(),
                clientProfileId = user.ClientProfile?.Id,
                professionalProfileId = user.ProfessionalProfile?.Id,
                slug = user.ProfessionalProfile?.Slug
            }
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser([FromHeader(Name = "Authorization")] string? authHeader)
    {
        if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
        {
            return Unauthorized(new { message = "Missing authorization token." });
        }

        var token = authHeader["Bearer ".Length..].Trim();
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        if (!handler.CanReadToken(token)) return Unauthorized();

        var jwt = handler.ReadJwtToken(token);
        var subClaim = jwt.Claims.FirstOrDefault(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (!Guid.TryParse(subClaim, out var userId)) return Unauthorized();

        var user = await _context.Users
            .Include(u => u.ClientProfile)
            .Include(u => u.ProfessionalProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound();

        return Ok(new
        {
            id = user.Id,
            fullName = user.FullName,
            email = user.Email,
            phoneNumber = user.PhoneNumber,
            role = user.Role.ToString(),
            clientProfileId = user.ClientProfile?.Id,
            professionalProfileId = user.ProfessionalProfile?.Id,
            clientProfile = user.ClientProfile,
            professionalProfile = user.ProfessionalProfile
        });
    }
}
