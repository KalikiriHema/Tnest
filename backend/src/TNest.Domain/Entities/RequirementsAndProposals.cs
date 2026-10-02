namespace TNest.Domain.Entities;

public enum RequirementStatus
{
    Open,
    InReview,
    Matched,
    Closed,
    Cancelled
}

public class Requirement
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClientProfileId { get; set; }
    public ClientProfile ClientProfile { get; set; } = null!;
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BudgetMin { get; set; }
    public decimal BudgetMax { get; set; }
    public string Currency { get; set; } = "INR";
    public int ExpectedDeliveryDays { get; set; } = 5;
    public List<string> RequiredLanguages { get; set; } = new();
    public bool RequiresOnCamera { get; set; }
    public bool RequiresProductShipment { get; set; }
    public string DynamicAttributesJson { get; set; } = "{}"; // Captured dynamic questions
    public bool IsPublicListing { get; set; } = true;
    public bool IsHidden { get; set; } = false;
    public string? ModerationReason { get; set; }
    public RequirementStatus Status { get; set; } = RequirementStatus.Open;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAtUtc { get; set; }

    public ICollection<Proposal> Proposals { get; set; } = new List<Proposal>();
    public ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
    public ICollection<Project> Projects { get; set; } = new List<Project>();
}

public enum ProposalStatus
{
    Submitted,
    Shortlisted,
    Accepted,
    Declined
}

public class Proposal
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid RequirementId { get; set; }
    public Requirement Requirement { get; set; } = null!;
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    
    public string CoverLetter { get; set; } = string.Empty;
    public decimal ProposedPrice { get; set; }
    public int EstimatedDays { get; set; }
    public ProposalStatus Status { get; set; } = ProposalStatus.Submitted;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public enum InquiryStatus
{
    Pending,
    Accepted,
    Declined,
    ConvertedToProject
}

public class Inquiry
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClientProfileId { get; set; }
    public ClientProfile ClientProfile { get; set; } = null!;
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public Guid? RequirementId { get; set; }
    public Requirement? Requirement { get; set; }
    
    public string InitialMessage { get; set; } = string.Empty;
    public InquiryStatus Status { get; set; } = InquiryStatus.Pending;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
