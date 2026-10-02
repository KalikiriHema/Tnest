using TNest.Application.Common.Interfaces;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Hubs;

public class ChatHub : Hub
{
    private readonly AppDbContext _context;

    public ChatHub(AppDbContext context)
    {
        _context = context;
    }

    public async Task JoinConversation(string conversationId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task JoinUserGroup(string userId)
    {
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
    }

    public async Task LeaveUserGroup(string userId)
    {
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
        }
    }

    public async Task SendMessage(string conversationId, string senderUserId, string senderRole, string content, string? attachmentUrl = null, string? attachmentName = null, string? attachmentType = null)
    {
        if (!Guid.TryParse(conversationId, out var convGuid) || !Guid.TryParse(senderUserId, out var senderGuid))
        {
            return;
        }

        var conversation = await _context.Conversations
            .Include(c => c.ClientProfile).ThenInclude(cp => cp.User)
            .Include(c => c.ProfessionalProfile).ThenInclude(pp => pp.User)
            .Include(c => c.Requirement)
            .FirstOrDefaultAsync(c => c.Id == convGuid);

        if (conversation == null) return;

        Enum.TryParse<UserRole>(senderRole, true, out var parsedRole);

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = convGuid,
            SenderUserId = senderGuid,
            SenderRole = parsedRole,
            Content = content,
            AttachmentUrl = attachmentUrl,
            AttachmentName = attachmentName,
            AttachmentType = attachmentType,
            IsRead = false,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);
        conversation.LastMessageAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var messageDto = new
        {
            id = message.Id,
            conversationId = message.ConversationId,
            senderUserId = message.SenderUserId,
            senderRole = message.SenderRole.ToString(),
            content = message.Content,
            attachmentUrl = message.AttachmentUrl,
            attachmentName = message.AttachmentName,
            attachmentType = message.AttachmentType,
            createdAtUtc = message.CreatedAtUtc
        };

        var senderName = senderRole.Equals("Professional", StringComparison.OrdinalIgnoreCase)
            ? (conversation.ProfessionalProfile?.DisplayName ?? conversation.ProfessionalProfile?.User?.FullName ?? "Specialist")
            : (conversation.ClientProfile?.ContactName ?? conversation.ClientProfile?.CompanyName ?? conversation.ClientProfile?.User?.FullName ?? "Client");

        var recipientUserId = (conversation.ClientProfile?.UserId == senderGuid || conversation.ClientProfileId == senderGuid)
            ? (conversation.ProfessionalProfile?.UserId ?? conversation.ProfessionalProfileId)
            : (conversation.ClientProfile?.UserId ?? conversation.ClientProfileId);

        var notifDto = new
        {
            id = message.Id,
            conversationId = message.ConversationId,
            senderUserId = message.SenderUserId,
            senderName = senderName,
            senderRole = message.SenderRole.ToString(),
            content = message.Content,
            attachmentUrl = message.AttachmentUrl,
            attachmentName = message.AttachmentName,
            createdAtUtc = message.CreatedAtUtc,
            requirementTitle = conversation.Requirement?.Title
        };

        await Clients.Group(conversationId).SendAsync("ReceiveMessage", messageDto);

        if (recipientUserId != Guid.Empty)
        {
            await Clients.Group($"user_{recipientUserId}").SendAsync("NewMessageNotification", notifDto);
        }
        if (conversation.ClientProfile != null)
        {
            await Clients.Group($"user_{conversation.ClientProfile.UserId}").SendAsync("NewMessageNotification", notifDto);
            await Clients.Group($"user_{conversation.ClientProfileId}").SendAsync("NewMessageNotification", notifDto);
        }
        if (conversation.ProfessionalProfile != null)
        {
            await Clients.Group($"user_{conversation.ProfessionalProfile.UserId}").SendAsync("NewMessageNotification", notifDto);
            await Clients.Group($"user_{conversation.ProfessionalProfileId}").SendAsync("NewMessageNotification", notifDto);
        }

        await Clients.All.SendAsync("MessagesUpdated");
    }
}
