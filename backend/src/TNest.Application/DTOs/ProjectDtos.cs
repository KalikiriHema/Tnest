using TNest.Domain.Entities;

namespace TNest.Application.DTOs;

public class ProjectDto
{
    public Guid Id { get; set; }
    public Guid ClientProfileId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientAvatarUrl { get; set; }

    public Guid ProfessionalProfileId { get; set; }
    public string ProfessionalName { get; set; } = string.Empty;
    public string? ProfessionalAvatarUrl { get; set; }

    public Guid? RequirementId { get; set; }
    public Guid? ProposalId { get; set; }

    public string Title { get; set; } = string.Empty;
    public decimal AgreedPrice { get; set; }
    public string Currency { get; set; } = "INR";
    public DateTime? DeadlineUtc { get; set; }
    public ProjectStatus Status { get; set; }

    // Shipment
    public bool RequiresShipment { get; set; }
    public string? CourierName { get; set; }
    public string? TrackingNumber { get; set; }
    public DateTime? ProductShippedAtUtc { get; set; }
    public DateTime? ProductReceivedAtUtc { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? CompletedAtUtc { get; set; }

    public List<ProjectDeliveryDto> Deliveries { get; set; } = new();
    public ReviewDto? Review { get; set; }
}

public class CreateProjectDto
{
    public Guid ClientProfileId { get; set; }
    public Guid ProfessionalProfileId { get; set; }
    public Guid? RequirementId { get; set; }
    public Guid? ProposalId { get; set; }
    public string Title { get; set; } = string.Empty;
    public decimal AgreedPrice { get; set; }
    public string Currency { get; set; } = "INR";
    public DateTime? DeadlineUtc { get; set; }
    public bool RequiresShipment { get; set; }
}

public class UpdateShipmentDto
{
    public string CourierName { get; set; } = string.Empty;
    public string TrackingNumber { get; set; } = string.Empty;
    public bool MarkAsReceived { get; set; }
}

public class ProjectDeliveryDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public int VersionNumber { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string DeliveryUrlsJson { get; set; } = "[]";
    public DeliveryStatus Status { get; set; }
    public string? RevisionFeedback { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? ReviewedAtUtc { get; set; }
}

public class SubmitDeliveryDto
{
    public string Notes { get; set; } = string.Empty;
    public List<string> DeliveryUrls { get; set; } = new();
}

public class ReviewDeliveryDto
{
    public bool Approved { get; set; }
    public string? RevisionFeedback { get; set; }
}

public class ReviewDto
{
    public Guid Id { get; set; }
    public Guid ProjectId { get; set; }
    public Guid ClientProfileId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public Guid ProfessionalProfileId { get; set; }
    public int OverallRating { get; set; }
    public int CommunicationRating { get; set; }
    public int QualityRating { get; set; }
    public int TimelinessRating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public string? ProfessionalResponse { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateReviewDto
{
    public int OverallRating { get; set; }
    public int CommunicationRating { get; set; }
    public int QualityRating { get; set; }
    public int TimelinessRating { get; set; }
    public string Comment { get; set; } = string.Empty;
}
