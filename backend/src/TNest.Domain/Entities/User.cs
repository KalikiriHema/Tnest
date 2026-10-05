namespace TNest.Domain.Entities;

public enum UserRole
{
    Client,
    Professional,
    DualRole,
    Admin
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsEmailVerified { get; set; }
    public bool IsPhoneVerified { get; set; }
    public bool IsActive { get; set; } = true;
    public string? SuspensionReason { get; set; }
    public string? GoogleSubjectId { get; set; }
    public string AuthProvider { get; set; } = "Local";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }

    public ClientProfile? ClientProfile { get; set; }
    public ProfessionalProfile? ProfessionalProfile { get; set; }
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}

public class RefreshToken
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public string? CreatedByIp { get; set; }

    public bool IsActive => RevokedAtUtc == null && DateTime.UtcNow < ExpiresAtUtc;
}
