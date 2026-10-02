using System.ComponentModel.DataAnnotations;
using TNest.Domain.Entities;

namespace TNest.Application.DTOs;

public class CreateRequirementDto
{
    [Required(ErrorMessage = "Category ID is required")]
    public Guid CategoryId { get; set; }

    [Required(ErrorMessage = "Task title is required")]
    [StringLength(200, MinimumLength = 5, ErrorMessage = "Title must be between 5 and 200 characters")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Description is required")]
    [StringLength(5000, MinimumLength = 20, ErrorMessage = "Description must be between 20 and 5000 characters")]
    public string Description { get; set; } = string.Empty;

    [Range(0, 10000000, ErrorMessage = "Budget Min must be positive")]
    public decimal BudgetMin { get; set; }

    [Range(0, 10000000, ErrorMessage = "Budget Max must be positive")]
    public decimal BudgetMax { get; set; }

    [StringLength(10)]
    public string Currency { get; set; } = "INR";

    [Range(1, 365, ErrorMessage = "Expected delivery must be between 1 and 365 days")]
    public int ExpectedDeliveryDays { get; set; } = 5;

    public List<string> RequiredLanguages { get; set; } = new();
    public bool RequiresOnCamera { get; set; }
    public bool RequiresProductShipment { get; set; }
    public string DynamicAttributesJson { get; set; } = "{}";
    public bool IsPublicListing { get; set; } = true;
}

public class UpdateRequirementDto
{
    [Required]
    [StringLength(200, MinimumLength = 5)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [StringLength(5000, MinimumLength = 20)]
    public string Description { get; set; } = string.Empty;

    [Range(0, 10000000)]
    public decimal BudgetMin { get; set; }

    [Range(0, 10000000)]
    public decimal BudgetMax { get; set; }

    [Range(1, 365)]
    public int ExpectedDeliveryDays { get; set; }

    public List<string> RequiredLanguages { get; set; } = new();
    public bool RequiresOnCamera { get; set; }
    public bool RequiresProductShipment { get; set; }
    public string DynamicAttributesJson { get; set; } = "{}";
    public bool IsPublicListing { get; set; }
    public RequirementStatus Status { get; set; }
}

public class RequirementResponseDto
{
    public Guid Id { get; set; }
    public Guid ClientProfileId { get; set; }
    public string ClientCompanyName { get; set; } = string.Empty;
    public string ClientContactName { get; set; } = string.Empty;
    public string? ClientAvatarUrl { get; set; }
    
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal BudgetMin { get; set; }
    public decimal BudgetMax { get; set; }
    public string Currency { get; set; } = "INR";
    public int ExpectedDeliveryDays { get; set; }
    public List<string> RequiredLanguages { get; set; } = new();
    public bool RequiresOnCamera { get; set; }
    public bool RequiresProductShipment { get; set; }
    public string DynamicAttributesJson { get; set; } = "{}";
    public bool IsPublicListing { get; set; }
    public RequirementStatus Status { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public int ProposalCount { get; set; }
}
