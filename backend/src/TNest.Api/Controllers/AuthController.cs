using System.Security.Claims;
using TNest.Application.Common.Interfaces;
using TNest.Application.DTOs;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[EnableRateLimiting("AuthPolicy")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IPasswordHasher passwordHasher, IJwtTokenService jwtTokenService, IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _configuration = configuration;
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
    public record GoogleAuthRequest(
        string IdToken,
        string? Role = null,
        string? CompanyName = null,
        string? Headline = null
    );

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

        if (role == UserRole.Client || role == UserRole.DualRole)
        {
            user.ClientProfile = new ClientProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CompanyName = request.CompanyName ?? request.FullName,
                ContactName = request.FullName
            };
        }

        if (role == UserRole.Professional || role == UserRole.DualRole)
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
        var newRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAtUtc = refreshExpires,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        };
        _context.RefreshTokens.Add(newRefreshToken);

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
                slug = user.ProfessionalProfile?.Slug,
                companyName = user.ClientProfile?.CompanyName,
                headline = user.ProfessionalProfile?.Headline,
                avatarUrl = user.ClientProfile?.AvatarUrl ?? user.ProfessionalProfile?.AvatarUrl,
                bio = user.ClientProfile?.Bio ?? user.ProfessionalProfile?.Bio,
                websiteUrl = user.ClientProfile?.WebsiteUrl ?? user.ProfessionalProfile?.WebsiteUrl,
                hourlyRate = user.ProfessionalProfile?.HourlyRate,
                city = user.ProfessionalProfile?.City
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.ClientProfile)
            .Include(u => u.ProfessionalProfile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password credentials." });
        }

        var (accessToken, accessExpires) = _jwtTokenService.GenerateAccessToken(user);
        var (refreshToken, refreshExpires) = _jwtTokenService.GenerateRefreshToken();

        var newRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAtUtc = refreshExpires,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        };
        _context.RefreshTokens.Add(newRefreshToken);

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
                slug = user.ProfessionalProfile?.Slug,
                companyName = user.ClientProfile?.CompanyName,
                headline = user.ProfessionalProfile?.Headline,
                avatarUrl = user.ClientProfile?.AvatarUrl ?? user.ProfessionalProfile?.AvatarUrl,
                bio = user.ClientProfile?.Bio ?? user.ProfessionalProfile?.Bio,
                websiteUrl = user.ClientProfile?.WebsiteUrl ?? user.ProfessionalProfile?.WebsiteUrl,
                hourlyRate = user.ProfessionalProfile?.HourlyRate,
                city = user.ProfessionalProfile?.City
            }
        });
    }

    [HttpPost("google")]
    public async Task<IActionResult> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return BadRequest(new { message = "Google ID token is required." });
        }

        GoogleJsonWebSignature.Payload payload;
        try
        {
            var clientId = _configuration["GoogleAuth:ClientId"]
                ?? Environment.GetEnvironmentVariable("GOOGLE_CLIENT_ID")
                ?? Environment.GetEnvironmentVariable("VITE_GOOGLE_CLIENT_ID");

            var settings = new GoogleJsonWebSignature.ValidationSettings();
            if (!string.IsNullOrWhiteSpace(clientId))
            {
                settings.Audience = new[] { clientId };
            }

            payload = await GoogleJsonWebSignature.ValidateAsync(request.IdToken, settings);
        }
        catch (Exception ex)
        {
            return Unauthorized(new { message = "Invalid Google authentication token: " + ex.Message });
        }

        if (payload == null || string.IsNullOrWhiteSpace(payload.Email))
        {
            return Unauthorized(new { message = "Could not retrieve email from Google token." });
        }

        var normalizedEmail = payload.Email.Trim().ToLowerInvariant();
        var user = await _context.Users
            .Include(u => u.ClientProfile)
            .Include(u => u.ProfessionalProfile)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail || (u.GoogleSubjectId != null && u.GoogleSubjectId == payload.Subject));

        if (user == null)
        {
            if (!Enum.TryParse<UserRole>(request.Role, true, out var role) || role == UserRole.Admin)
            {
                role = UserRole.Client;
            }

            var name = !string.IsNullOrWhiteSpace(payload.Name) 
                ? payload.Name.Trim() 
                : (!string.IsNullOrWhiteSpace(payload.GivenName) ? $"{payload.GivenName} {payload.FamilyName}".Trim() : normalizedEmail.Split('@')[0]);

            user = new User
            {
                Id = Guid.NewGuid(),
                FullName = name,
                Email = normalizedEmail,
                PhoneNumber = "",
                PasswordHash = "",
                Role = role,
                IsEmailVerified = true,
                IsPhoneVerified = false,
                GoogleSubjectId = payload.Subject,
                AuthProvider = "Google",
                IsActive = true
            };

            if (role == UserRole.Client || role == UserRole.DualRole)
            {
                user.ClientProfile = new ClientProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    CompanyName = request.CompanyName ?? user.FullName,
                    ContactName = user.FullName,
                    AvatarUrl = payload.Picture
                };
            }

            if (role == UserRole.Professional || role == UserRole.DualRole)
            {
                var slug = name.ToLowerInvariant().Replace(" ", "-") + "-" + Random.Shared.Next(100, 999);
                user.ProfessionalProfile = new ProfessionalProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    DisplayName = name,
                    Slug = slug,
                    Headline = request.Headline ?? "Creative Specialist & Content Creator",
                    Bio = "Passionate creative producing high-retention digital media assets.",
                    HourlyRate = 2000,
                    TurnaroundDays = 3,
                    Languages = new List<string> { "English" },
                    AvatarUrl = payload.Picture
                };
            }

            _context.Users.Add(user);
        }
        else
        {
            if (string.IsNullOrEmpty(user.GoogleSubjectId))
            {
                user.GoogleSubjectId = payload.Subject;
            }
            user.IsEmailVerified = true;

            if (user.ClientProfile != null && string.IsNullOrEmpty(user.ClientProfile.AvatarUrl) && !string.IsNullOrEmpty(payload.Picture))
            {
                user.ClientProfile.AvatarUrl = payload.Picture;
            }
            if (user.ProfessionalProfile != null && string.IsNullOrEmpty(user.ProfessionalProfile.AvatarUrl) && !string.IsNullOrEmpty(payload.Picture))
            {
                user.ProfessionalProfile.AvatarUrl = payload.Picture;
            }
        }

        if (!user.IsActive)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = "Your account has been deactivated or suspended." });
        }

        var (refreshToken, refreshExpires) = _jwtTokenService.GenerateRefreshToken();
        var newRefreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Token = refreshToken,
            ExpiresAtUtc = refreshExpires,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        };
        _context.RefreshTokens.Add(newRefreshToken);

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
                slug = user.ProfessionalProfile?.Slug,
                companyName = user.ClientProfile?.CompanyName,
                headline = user.ProfessionalProfile?.Headline,
                avatarUrl = user.ClientProfile?.AvatarUrl ?? user.ProfessionalProfile?.AvatarUrl ?? payload.Picture,
                bio = user.ClientProfile?.Bio ?? user.ProfessionalProfile?.Bio,
                websiteUrl = user.ClientProfile?.WebsiteUrl ?? user.ProfessionalProfile?.WebsiteUrl,
                hourlyRate = user.ProfessionalProfile?.HourlyRate,
                city = user.ProfessionalProfile?.City
            }
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            return BadRequest(new { message = "Refresh token is required." });
        }

        var storedToken = await _context.RefreshTokens
            .Include(r => r.User).ThenInclude(u => u.ClientProfile)
            .Include(r => r.User).ThenInclude(u => u.ProfessionalProfile)
            .FirstOrDefaultAsync(r => r.Token == request.RefreshToken);

        if (storedToken == null || !storedToken.IsActive)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token. Please sign in again." });
        }

        // Revoke the old token
        storedToken.RevokedAtUtc = DateTime.UtcNow;

        // Generate new token pair
        var (newAccessToken, accessExpires) = _jwtTokenService.GenerateAccessToken(storedToken.User);
        var (newRefreshToken, refreshExpires) = _jwtTokenService.GenerateRefreshToken();

        var replacementToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = storedToken.UserId,
            Token = newRefreshToken,
            ExpiresAtUtc = refreshExpires,
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        };
        _context.RefreshTokens.Add(replacementToken);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            token = newAccessToken,
            refreshToken = newRefreshToken,
            expiresAt = accessExpires,
            user = new
            {
                id = storedToken.User.Id,
                fullName = storedToken.User.FullName,
                email = storedToken.User.Email,
                phoneNumber = storedToken.User.PhoneNumber,
                role = storedToken.User.Role.ToString(),
                clientProfileId = storedToken.User.ClientProfile?.Id,
                professionalProfileId = storedToken.User.ProfessionalProfile?.Id,
                slug = storedToken.User.ProfessionalProfile?.Slug,
                companyName = storedToken.User.ClientProfile?.CompanyName,
                headline = storedToken.User.ProfessionalProfile?.Headline,
                avatarUrl = storedToken.User.ClientProfile?.AvatarUrl ?? storedToken.User.ProfessionalProfile?.AvatarUrl,
                bio = storedToken.User.ClientProfile?.Bio ?? storedToken.User.ProfessionalProfile?.Bio,
                websiteUrl = storedToken.User.ClientProfile?.WebsiteUrl ?? storedToken.User.ProfessionalProfile?.WebsiteUrl,
                hourlyRate = storedToken.User.ProfessionalProfile?.HourlyRate,
                city = storedToken.User.ProfessionalProfile?.City
            }
        });
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest? request)
    {
        if (!string.IsNullOrWhiteSpace(request?.RefreshToken))
        {
            var storedToken = await _context.RefreshTokens.FirstOrDefaultAsync(r => r.Token == request.RefreshToken);
            if (storedToken != null && storedToken.IsActive)
            {
                storedToken.RevokedAtUtc = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }
        return Ok(new { message = "Successfully logged out." });
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (!Guid.TryParse(subClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid session claims." });
        }

        var user = await _context.Users
            .AsNoTracking()
            .Include(u => u.ClientProfile)
            .Include(u => u.ProfessionalProfile)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null) return NotFound(new { message = "User not found." });

        return Ok(new
        {
            id = user.Id,
            fullName = user.FullName,
            email = user.Email,
            phoneNumber = user.PhoneNumber,
            role = user.Role.ToString(),
            clientProfileId = user.ClientProfile?.Id,
            professionalProfileId = user.ProfessionalProfile?.Id,
            slug = user.ProfessionalProfile?.Slug,
            companyName = user.ClientProfile?.CompanyName,
            headline = user.ProfessionalProfile?.Headline,
            avatarUrl = user.ClientProfile?.AvatarUrl ?? user.ProfessionalProfile?.AvatarUrl,
            bio = user.ClientProfile?.Bio ?? user.ProfessionalProfile?.Bio,
            websiteUrl = user.ClientProfile?.WebsiteUrl ?? user.ProfessionalProfile?.WebsiteUrl,
            hourlyRate = user.ProfessionalProfile?.HourlyRate,
            city = user.ProfessionalProfile?.City,
            clientProfile = user.ClientProfile,
            professionalProfile = user.ProfessionalProfile
        });
    }

    public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

    [HttpPost("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (!Guid.TryParse(subClaim, out var userId))
        {
            return Unauthorized(new { message = "Invalid session claims." });
        }

        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Current and new password are required." });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters long." });
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return NotFound(new { message = "User account not found." });

        if (!_passwordHasher.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(new { message = "Incorrect current password. Please try again." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        user.UpdatedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password successfully changed and updated." });
    }
}
