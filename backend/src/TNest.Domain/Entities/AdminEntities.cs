namespace TNest.Domain.Entities;

public enum ReportStatus
{
    New,
    UnderReview,
    Resolved,
    Dismissed
}

public class Report
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? ReporterUserId { get; set; }
    public string ReporterName { get; set; } = string.Empty;
    public string ReporterEmail { get; set; } = string.Empty;
    
    // Target Type: User, Opportunity, Portfolio, Review, Message
    public string TargetType { get; set; } = string.Empty;
    public string TargetId { get; set; } = string.Empty;
    public string TargetTitle { get; set; } = string.Empty;
    public string TargetOwnerName { get; set; } = string.Empty;
    
    public string ReasonCategory { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string Priority { get; set; } = "Medium"; // Low, Medium, High, Urgent
    public ReportStatus Status { get; set; } = ReportStatus.New;
    
    public string? AdminNotes { get; set; }
    public string? ResolutionAction { get; set; }
    public Guid? AssignedAdminId { get; set; }
    public string? AssignedAdminName { get; set; }
    public string? AssignedAdminEmail { get; set; }
    
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAtUtc { get; set; }
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid? AdminUserId { get; set; }
    public string AdminEmail { get; set; } = string.Empty;
    public string AdminName { get; set; } = string.Empty;
    
    public string Action { get; set; } = string.Empty; // e.g. User.Suspend, Opportunity.Hide, Report.Resolved
    public string TargetType { get; set; } = string.Empty; // User, Opportunity, Portfolio, Review, Category, Role, Skill, System
    public string TargetId { get; set; } = string.Empty;
    public string? TargetName { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string? Details { get; set; }
    public string? IpAddress { get; set; }
    
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class SystemSetting
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Key { get; set; } = string.Empty;
    public string Value { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Group { get; set; } = "General"; // General, Moderation, Security, Platform, Billing, Limits
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
