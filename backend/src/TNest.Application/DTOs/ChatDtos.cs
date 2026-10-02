using TNest.Domain.Entities;

namespace TNest.Application.DTOs;

public class ConversationDto
{
    public Guid Id { get; set; }
    public Guid ClientProfileId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string? ClientAvatarUrl { get; set; }
    
    public Guid ProfessionalProfileId { get; set; }
    public string ProfessionalName { get; set; } = string.Empty;
    public string? ProfessionalAvatarUrl { get; set; }

    public Guid? RequirementId { get; set; }
    public string? RequirementTitle { get; set; }
    public Guid? ProjectId { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime LastMessageAtUtc { get; set; }
    public ChatMessageDto? LastMessage { get; set; }
    public int UnreadCount { get; set; }
}

public class ChatMessageDto
{
    public Guid Id { get; set; }
    public Guid ConversationId { get; set; }
    public Guid SenderUserId { get; set; }
    public UserRole SenderRole { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    public string? AttachmentType { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

public class SendMessageDto
{
    public Guid ConversationId { get; set; }
    public string Content { get; set; } = string.Empty;
    public string? AttachmentUrl { get; set; }
    public string? AttachmentName { get; set; }
    public string? AttachmentType { get; set; }
}

public class StartConversationDto
{
    public Guid ProfessionalProfileId { get; set; }
    public Guid? RequirementId { get; set; }
    public Guid? ProjectId { get; set; }
    public string? InitialMessage { get; set; }
}
