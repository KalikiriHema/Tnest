namespace TNest.Domain.Entities;

public class Conversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClientProfileId { get; set; }
    public ClientProfile ClientProfile { get; set; } = null!;
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public Guid? RequirementId { get; set; }
    public Requirement? Requirement { get; set; }
    public Guid? ProjectId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime LastMessageAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

public class ChatMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public Conversation Conversation { get; set; } = null!;
    public Guid SenderUserId { get; set; }
    public UserRole SenderRole { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    public string? AttachmentType { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public enum ProjectStatus
{
    Draft,
    PendingAcceptance,
    InProgress,
    UnderReview,
    Completed,
    Disputed,
    Cancelled
}

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ClientProfileId { get; set; }
    public ClientProfile ClientProfile { get; set; } = null!;
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public Guid? RequirementId { get; set; }
    public Requirement? Requirement { get; set; }
    public Guid? ProposalId { get; set; }
    public Proposal? Proposal { get; set; }

    public string Title { get; set; } = string.Empty;
    public decimal AgreedPrice { get; set; }
    public string Currency { get; set; } = "INR";
    public DateTime? DeadlineUtc { get; set; }
    public ProjectStatus Status { get; set; } = ProjectStatus.InProgress;
    
    // Shipping tracking for physical goods (e.g. UGC Creator products)
    public bool RequiresShipment { get; set; }
    public string? CourierName { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ProductShippedAtUtc { get; set; }
    public DateTime? ProductReceivedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAtUtc { get; set; }

    public ICollection<ProjectDelivery> Deliveries { get; set; } = new List<ProjectDelivery>();
    public Review? Review { get; set; }
}

public enum DeliveryStatus
{
    Submitted,
    RevisionRequested,
    Approved
}

public class ProjectDelivery
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public int VersionNumber { get; set; } = 1;
    public string Notes { get; set; } = string.Empty;
    public string DeliveryUrlsJson { get; set; } = "[]"; // List of uploaded links/previews
    public DeliveryStatus Status { get; set; } = DeliveryStatus.Submitted;
    public string? RevisionFeedback { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAtUtc { get; set; }
}

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
    public Guid ClientProfileId { get; set; }
    public ClientProfile ClientProfile { get; set; } = null!;
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;

    public int OverallRating { get; set; } // 1 - 5
    public int CommunicationRating { get; set; } // 1 - 5
    public int QualityRating { get; set; } // 1 - 5
    public int TimelinessRating { get; set; } // 1 - 5
    public string Comment { get; set; } = string.Empty;
    public string? ProfessionalResponse { get; set; }
    public bool IsHidden { get; set; } = false;
    public string? ModerationReason { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
