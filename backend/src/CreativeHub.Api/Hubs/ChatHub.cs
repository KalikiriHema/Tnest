using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Api.Hubs;

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

    public async Task SendMessage(string conversationId, string senderUserId, string senderRole, string content, string? attachmentUrl = null, string? attachmentName = null, string? attachmentType = null)
    {
        if (!Guid.TryParse(conversationId, out var convGuid) || !Guid.TryParse(senderUserId, out var senderGuid))
        {
            return;
        }

        var conversation = await _context.Conversations.FindAsync(convGuid);
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

        await Clients.Group(conversationId).SendAsync("ReceiveMessage", messageDto);
    }
}
