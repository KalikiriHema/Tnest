namespace CreativeHub.Core.Entities;

public class ClientProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string? CompanyName { get; set; }
    public string? ContactName { get; set; }
    public string? AvatarUrl { get; set; }
    public string? WebsiteUrl { get; set; }
    public string? Industry { get; set; }
    public string? Bio { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<Requirement> Requirements { get; set; } = new List<Requirement>();
    public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

public enum AvailabilityStatus
{
    AvailableNow,
    PartiallyBooked,
    FullyBooked,
    NotTakingWork
}

public class ProfessionalProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
    public string DisplayName { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Headline { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? BannerUrl { get; set; }
    public string ExperienceLevel { get; set; } = "Mid"; // Junior, Mid, Senior, Lead
    public int YearsOfExperience { get; set; } = 3;
    public AvailabilityStatus AvailabilityStatus { get; set; } = AvailabilityStatus.AvailableNow;
    public decimal HourlyRate { get; set; }
    public string Currency { get; set; } = "INR";
    public int TurnaroundDays { get; set; } = 3;
    public List<string> Languages { get; set; } = new();
    public bool AppearsOnCamera { get; set; }
    public bool AcceptsProductShipments { get; set; }
    public decimal AverageRating { get; set; } = 5.0m;
    public int CompletedProjectsCount { get; set; }
    public bool IsVerified { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<ProfessionalRole> ProfessionalRoles { get; set; } = new List<ProfessionalRole>();
    public ICollection<ProfessionalSkill> ProfessionalSkills { get; set; } = new List<ProfessionalSkill>();
    public ICollection<PortfolioItem> PortfolioItems { get; set; } = new List<PortfolioItem>();
    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}
