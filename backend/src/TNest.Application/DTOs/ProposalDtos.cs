using TNest.Domain.Entities;

namespace TNest.Application.DTOs;

public class CreateProposalDto
{
    public Guid RequirementId { get; set; }
    public string CoverLetter { get; set; } = string.Empty;
    public decimal ProposedPrice { get; set; }
    public int EstimatedDays { get; set; }
}

public class ProposalResponseDto
{
    public Guid Id { get; set; }
    public Guid RequirementId { get; set; }
    public string RequirementTitle { get; set; } = string.Empty;
    public Guid ProfessionalProfileId { get; set; }
    public string ProfessionalDisplayName { get; set; } = string.Empty;
    public string? ProfessionalAvatarUrl { get; set; }
    public decimal ProfessionalRating { get; set; }
    
    public string CoverLetter { get; set; } = string.Empty;
    public decimal ProposedPrice { get; set; }
    public int EstimatedDays { get; set; }
    public ProposalStatus Status { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class InquiryDto
{
    public Guid Id { get; set; }
    public Guid ClientProfileId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public Guid ProfessionalProfileId { get; set; }
    public string ProfessionalName { get; set; } = string.Empty;
    public Guid? RequirementId { get; set; }
    public string? RequirementTitle { get; set; }
    public string InitialMessage { get; set; } = string.Empty;
    public InquiryStatus Status { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class CreateInquiryDto
{
    public Guid ProfessionalProfileId { get; set; }
    public Guid? RequirementId { get; set; }
    public string InitialMessage { get; set; } = string.Empty;
}
