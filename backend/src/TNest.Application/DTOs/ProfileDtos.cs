using TNest.Domain.Entities;

namespace TNest.Application.DTOs;

public class ClientProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string? CompanyName { get; set; }
    public string? ContactName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Industry { get; set; }
    public string? Bio { get; set; }
    public string? BusinessDescription { get; set; }
    public string? ClientType { get; set; } = "Business";
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Gender { get; set; }
    public string? DateOfBirth { get; set; }
    public string? Email { get; set; }
    public string? PhoneNumber { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? OtherUrl { get; set; }
    public int PostedRequirementsCount { get; set; }
    public int ActiveProjectsCount { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class PublicClientProfileDto
{
    public Guid Id { get; set; }
    public string? ContactName { get; set; }
    public string? CompanyName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Industry { get; set; }
    public string? Bio { get; set; }
    public string? BusinessDescription { get; set; }
    public string? ClientType { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? OtherUrl { get; set; }
    public decimal? Rating { get; set; }
    public int ReviewsCount { get; set; }
    public int CompletedProjectsCount { get; set; }
    public int PostedRequirementsCount { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public List<ClientPublicOpportunityDto> ActiveOpportunities { get; set; } = new();
    public List<ClientReviewDto> Reviews { get; set; } = new();
}

public class ClientPublicOpportunityDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BudgetMin { get; set; }
    public decimal BudgetMax { get; set; }
    public string Currency { get; set; } = "INR";
    public int ExpectedDeliveryDays { get; set; }
    public string Status { get; set; } = "Open";
    public DateTime CreatedAtUtc { get; set; }
}

public class ClientReviewDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public string ProjectTitle { get; set; } = string.Empty;
    public string DoerName { get; set; } = string.Empty;
    public string? DoerAvatar { get; set; }
    public int OverallRating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

public class UpdateClientProfileDto
{
    public string? ContactName { get; set; }
    public string? CompanyName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Industry { get; set; }
    public string? Bio { get; set; }
    public string? BusinessDescription { get; set; }
    public string? ClientType { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Gender { get; set; }
    public string? DateOfBirth { get; set; }
    public string? PhoneNumber { get; set; }
    public string? LinkedinUrl { get; set; }
    public string? InstagramUrl { get; set; }
    public string? YoutubeUrl { get; set; }
    public string? OtherUrl { get; set; }
}

public class ProfessionalProfileDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string ExperienceLevel { get; set; } = "Mid";
    public int YearsOfExperience { get; set; }
    public AvailabilityStatus AvailabilityStatus { get; set; }
    public decimal HourlyRate { get; set; }
    public string Currency { get; set; } = "INR";
    public int TurnaroundDays { get; set; }
    public List<string> Languages { get; set; } = new();
    public bool AppearsOnCamera { get; set; }
    public bool AcceptsProductShipments { get; set; }
    public decimal AverageRating { get; set; }
    public int CompletedProjectsCount { get; set; }
    public bool IsVerified { get; set; }
    
    public List<RoleTaxonomyDto> Roles { get; set; } = new();
    public List<SkillTaxonomyDto> Skills { get; set; } = new();
    public List<PortfolioItemDto> PortfolioItems { get; set; } = new();
    public List<ReviewDto> RecentReviews { get; set; } = new();
}

public class UpdateProfessionalProfileDto
{
    public string DisplayName { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string ExperienceLevel { get; set; } = "Mid";
    public int YearsOfExperience { get; set; }
    public AvailabilityStatus AvailabilityStatus { get; set; }
    public decimal HourlyRate { get; set; }
    public int TurnaroundDays { get; set; }
    public List<string> Languages { get; set; } = new();
    public bool AppearsOnCamera { get; set; }
    public bool AcceptsProductShipments { get; set; }
    public List<Guid> RoleIds { get; set; } = new();
    public List<Guid> SkillIds { get; set; } = new();
}

public class PortfolioItemDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string RolePerformed { get; set; } = string.Empty;
    public List<string> ToolsUsed { get; set; } = new();
    public string? ThumbnailUrl { get; set; }
    public string? MediaUrl { get; set; }
    public string MediaType { get; set; } = "Video";
    public string? LiveUrl { get; set; }
}

public class CreatePortfolioItemDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string RolePerformed { get; set; } = string.Empty;
    public List<string> ToolsUsed { get; set; } = new();
    public string? ThumbnailUrl { get; set; }
    public string? MediaUrl { get; set; }
    public string MediaType { get; set; } = "Video";
    public string? LiveUrl { get; set; }
}
