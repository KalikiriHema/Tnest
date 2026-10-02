using System.ComponentModel.DataAnnotations;
using TNest.Domain.Entities;

namespace TNest.Application.DTOs;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(100, MinimumLength = 2, ErrorMessage = "Full name must be between 2 and 100 characters")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email address format")]
    [StringLength(150, ErrorMessage = "Email cannot exceed 150 characters")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Phone number is required")]
    [Phone(ErrorMessage = "Invalid phone number format")]
    [StringLength(25, ErrorMessage = "Phone number cannot exceed 25 characters")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters long")]
    [StringLength(128, ErrorMessage = "Password cannot exceed 128 characters")]
    public string Password { get; set; } = string.Empty;

    [Required]
    public UserRole Role { get; set; }
    
    // Client specific optional initial fields
    [StringLength(150, ErrorMessage = "Company name cannot exceed 150 characters")]
    public string? CompanyName { get; set; }
    
    // Professional specific optional initial fields
    [StringLength(100, ErrorMessage = "Display name cannot exceed 100 characters")]
    public string? DisplayName { get; set; }

    [StringLength(200, ErrorMessage = "Headline cannot exceed 200 characters")]
    public string? Headline { get; set; }

    public Guid? CategoryId { get; set; }
}

public class LoginRequestDto
{
    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Invalid email format")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required")]
    public string Password { get; set; } = string.Empty;
}

public class RefreshTokenRequestDto
{
    [Required(ErrorMessage = "Refresh token is required")]
    public string RefreshToken { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public Guid? ProfileId { get; set; }
}
