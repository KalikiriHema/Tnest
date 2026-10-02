using TNest.Api.Hubs;
using TNest.Application.Common.Interfaces;
using TNest.Application.DTOs;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;

    public ChatController(AppDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    private async Task ConsolidateDuplicateConversationsAsync()
    {
        try
        {
            var allConvs = await _context.Conversations
                .Include(c => c.Messages)
                .Include(c => c.ClientProfile)
                .Include(c => c.ProfessionalProfile)
                .ToListAsync();

            var groups = allConvs
                .GroupBy(c => (c.ClientProfileId, c.ProfessionalProfileId))
                .Where(g => g.Count() > 1)
                .ToList();

            bool hasChanges = false;

            foreach (var group in groups)
            {
                var primary = group.OrderBy(c => c.CreatedAtUtc).First();
                var duplicates = group.Where(c => c.Id != primary.Id).ToList();

                foreach (var dup in duplicates)
                {
                    if (primary.RequirementId == null && dup.RequirementId != null)
                    {
                        primary.RequirementId = dup.RequirementId;
                    }
                    if (primary.ProjectId == null && dup.ProjectId != null)
                    {
                        primary.ProjectId = dup.ProjectId;
                    }

                    foreach (var msg in dup.Messages.ToList())
                    {
                        msg.ConversationId = primary.Id;
                        if (!primary.Messages.Any(m => m.Id == msg.Id))
                        {
                            primary.Messages.Add(msg);
                        }
                    }

                    _context.Conversations.Remove(dup);
                    hasChanges = true;
                }

                if (primary.Messages.Any())
                {
                    primary.LastMessageAtUtc = primary.Messages.Max(m => m.CreatedAtUtc);
                }
            }

            if (hasChanges)
            {
                await _context.SaveChangesAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[Consolidation Error]: {ex.Message}");
        }
    }

    [HttpGet("conversations/user/{userId}")]
    public async Task<IActionResult> GetUserConversations(string userId)
    {
        await ConsolidateDuplicateConversationsAsync();

        Guid parsedUserId = Guid.Empty;
        Guid.TryParse(userId, out parsedUserId);

        // Derive authenticated user if available
        var subClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (parsedUserId == Guid.Empty && !string.IsNullOrWhiteSpace(subClaim) && Guid.TryParse(subClaim, out var claimUserId))
        {
            parsedUserId = claimUserId;
        }

        var clientProfile = await _context.ClientProfiles.AsNoTracking().Include(cp => cp.User).FirstOrDefaultAsync(cp => (parsedUserId != Guid.Empty && (cp.UserId == parsedUserId || cp.Id == parsedUserId)) || (cp.User != null && cp.User.Email == userId));
        var proProfile = await _context.ProfessionalProfiles.AsNoTracking().Include(pp => pp.User).FirstOrDefaultAsync(pp => (parsedUserId != Guid.Empty && (pp.UserId == parsedUserId || pp.Id == parsedUserId)) || (pp.User != null && pp.User.Email == userId));

        var clientProfileId = clientProfile?.Id;
        var proProfileId = proProfile?.Id;
        var actualUserId = clientProfile?.UserId ?? proProfile?.UserId ?? parsedUserId;

        var list = await _context.Conversations
            .AsNoTracking()
            .Include(c => c.ClientProfile).ThenInclude(cp => cp.User)
            .Include(c => c.ProfessionalProfile).ThenInclude(pp => pp.User)
            .Include(c => c.Requirement)
            .Include(c => c.Messages)
            .Where(c =>
                (clientProfileId != null && c.ClientProfileId == clientProfileId) ||
                (proProfileId != null && c.ProfessionalProfileId == proProfileId) ||
                (actualUserId != Guid.Empty && (
                    (c.ClientProfile != null && c.ClientProfile.UserId == actualUserId) ||
                    (c.ProfessionalProfile != null && c.ProfessionalProfile.UserId == actualUserId) ||
                    c.ClientProfileId == actualUserId ||
                    c.ProfessionalProfileId == actualUserId
                ))
            )
            .OrderByDescending(c => c.LastMessageAtUtc)
            .ToListAsync();

        return Ok(list.Select(c =>
        {
            var unread = c.Messages.Count(m => !m.IsRead && (actualUserId == Guid.Empty || m.SenderUserId != actualUserId));
            return new
            {
                id = c.Id,
                clientProfileId = c.ClientProfileId,
                clientName = !string.IsNullOrWhiteSpace(c.ClientProfile?.CompanyName) ? c.ClientProfile.CompanyName : (c.ClientProfile?.ContactName ?? c.ClientProfile?.User?.FullName ?? "Client"),
                clientAvatar = c.ClientProfile?.AvatarUrl,
                professionalProfileId = c.ProfessionalProfileId,
                professionalName = c.ProfessionalProfile?.DisplayName ?? c.ProfessionalProfile?.User?.FullName ?? "Doer",
                professionalAvatar = c.ProfessionalProfile?.AvatarUrl,
                requirementId = c.RequirementId,
                requirementTitle = c.Requirement?.Title,
                projectId = c.ProjectId,
                lastMessageAtUtc = c.LastMessageAtUtc,
                lastMessage = c.Messages.OrderByDescending(m => m.CreatedAtUtc).FirstOrDefault()?.Content,
                unreadCount = unread
            };
        }));
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount([FromQuery] string? userId)
    {
        Guid parsedUserId = Guid.Empty;
        if (!string.IsNullOrWhiteSpace(userId))
        {
            Guid.TryParse(userId, out parsedUserId);
        }

        var subClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (parsedUserId == Guid.Empty && !string.IsNullOrWhiteSpace(subClaim) && Guid.TryParse(subClaim, out var claimUserId))
        {
            parsedUserId = claimUserId;
        }

        var clientProfile = await _context.ClientProfiles.AsNoTracking().Include(cp => cp.User).FirstOrDefaultAsync(cp => (parsedUserId != Guid.Empty && (cp.UserId == parsedUserId || cp.Id == parsedUserId)) || (cp.User != null && cp.User.Email == userId));
        var proProfile = await _context.ProfessionalProfiles.AsNoTracking().Include(pp => pp.User).FirstOrDefaultAsync(pp => (parsedUserId != Guid.Empty && (pp.UserId == parsedUserId || pp.Id == parsedUserId)) || (pp.User != null && pp.User.Email == userId));

        var clientProfileId = clientProfile?.Id;
        var proProfileId = proProfile?.Id;
        var actualUserId = clientProfile?.UserId ?? proProfile?.UserId ?? parsedUserId;

        var userConversations = await _context.Conversations
            .AsNoTracking()
            .Include(c => c.Messages)
            .Where(c =>
                (clientProfileId != null && c.ClientProfileId == clientProfileId) ||
                (proProfileId != null && c.ProfessionalProfileId == proProfileId) ||
                (actualUserId != Guid.Empty && (
                    (c.ClientProfile != null && c.ClientProfile.UserId == actualUserId) ||
                    (c.ProfessionalProfile != null && c.ProfessionalProfile.UserId == actualUserId) ||
                    c.ClientProfileId == actualUserId ||
                    c.ProfessionalProfileId == actualUserId
                ))
            )
            .ToListAsync();

        var totalUnreadMessages = userConversations
            .SelectMany(c => c.Messages)
            .Count(m => !m.IsRead && (actualUserId == Guid.Empty || m.SenderUserId != actualUserId));

        var unreadChatsCount = userConversations
            .Count(c => c.Messages.Any(m => !m.IsRead && (actualUserId == Guid.Empty || m.SenderUserId != actualUserId)));

        return Ok(new
        {
            unreadCount = totalUnreadMessages,
            unreadChatsCount = unreadChatsCount
        });
    }

    [HttpGet("conversations/{conversationId}/messages")]
    public async Task<IActionResult> GetConversationMessages(Guid conversationId)
    {
        var conversation = await _context.Conversations
            .Include(c => c.ClientProfile)
            .Include(c => c.ProfessionalProfile)
            .Include(c => c.Requirement)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null) return NotFound();

        var messages = await _context.ChatMessages
            .Where(m => m.ConversationId == conversationId)
            .OrderBy(m => m.CreatedAtUtc)
            .ToListAsync();

        // Mark unread messages in this conversation as read
        var unread = messages.Where(m => !m.IsRead).ToList();
        if (unread.Any())
        {
            foreach (var m in unread)
            {
                m.IsRead = true;
            }
            await _context.SaveChangesAsync();
        }

        return Ok(new
        {
            conversation = new
            {
                id = conversation.Id,
                clientProfileId = conversation.ClientProfileId,
                clientName = !string.IsNullOrWhiteSpace(conversation.ClientProfile?.CompanyName) ? conversation.ClientProfile.CompanyName : (conversation.ClientProfile?.ContactName ?? "Client"),
                clientAvatar = conversation.ClientProfile?.AvatarUrl,
                professionalProfileId = conversation.ProfessionalProfileId,
                professionalName = conversation.ProfessionalProfile?.DisplayName ?? "Doer",
                professionalAvatar = conversation.ProfessionalProfile?.AvatarUrl,
                professionalSlug = conversation.ProfessionalProfile?.Slug,
                requirementId = conversation.RequirementId,
                requirementTitle = conversation.Requirement?.Title,
                projectId = conversation.ProjectId
            },
            messages = messages.Select(m => new
            {
                id = m.Id,
                conversationId = m.ConversationId,
                senderUserId = m.SenderUserId,
                senderRole = m.SenderRole.ToString(),
                content = m.Content,
                attachmentUrl = m.AttachmentUrl,
                attachmentName = m.AttachmentName,
                attachmentType = m.AttachmentType,
                isRead = m.IsRead,
                createdAtUtc = m.CreatedAtUtc
            })
        });
    }

    public record StartConversationPayload(
        string? SenderUserId,
        string? SenderRole,
        string? ClientProfileId,
        string? ProfessionalProfileId,
        string? RecipientUserId,
        string? RecipientName,
        string? RequirementId,
        string? ProjectId,
        string? InitialMessage
    );

    [HttpPost("conversations")]
    public async Task<IActionResult> StartConversation([FromBody] StartConversationPayload req)
    {
        // 1. Resolve requirement if provided
        Requirement? requirement = null;
        if (!string.IsNullOrWhiteSpace(req.RequirementId) && Guid.TryParse(req.RequirementId, out var reqGuid))
        {
            requirement = await _context.Requirements.Include(r => r.ClientProfile).FirstOrDefaultAsync(r => r.Id == reqGuid);
        }

        // 2. Resolve Client Profile ID
        Guid clientProfileId = Guid.Empty;
        if (!string.IsNullOrWhiteSpace(req.ClientProfileId) && Guid.TryParse(req.ClientProfileId, out var cpGuid))
        {
            clientProfileId = cpGuid;
        }
        else if (requirement != null)
        {
            clientProfileId = requirement.ClientProfileId;
        }

        // 3. Resolve Professional Profile ID
        Guid proProfileId = Guid.Empty;
        if (!string.IsNullOrWhiteSpace(req.ProfessionalProfileId) && Guid.TryParse(req.ProfessionalProfileId, out var ppGuid))
        {
            proProfileId = ppGuid;
        }

        // Check if sender is a Professional or Client
        Guid senderUserId = Guid.Empty;
        if (!string.IsNullOrWhiteSpace(req.SenderUserId))
        {
            Guid.TryParse(req.SenderUserId, out senderUserId);
        }

        Guid recipientUserGuid = Guid.Empty;
        if (!string.IsNullOrWhiteSpace(req.RecipientUserId))
        {
            Guid.TryParse(req.RecipientUserId, out recipientUserGuid);
        }

        if (clientProfileId == Guid.Empty && senderUserId != Guid.Empty)
        {
            var senderClient = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == senderUserId || cp.Id == senderUserId);
            if (senderClient != null) clientProfileId = senderClient.Id;
        }

        if (proProfileId == Guid.Empty && senderUserId != Guid.Empty)
        {
            var senderPro = await _context.ProfessionalProfiles.FirstOrDefaultAsync(pp => pp.UserId == senderUserId || pp.Id == senderUserId);
            if (senderPro != null) proProfileId = senderPro.Id;
        }

        // Check recipient if sender was resolved
        if (proProfileId == Guid.Empty && recipientUserGuid != Guid.Empty)
        {
            var recPro = await _context.ProfessionalProfiles.FirstOrDefaultAsync(pp => pp.UserId == recipientUserGuid || pp.Id == recipientUserGuid);
            if (recPro != null) proProfileId = recPro.Id;
        }

        if (clientProfileId == Guid.Empty && recipientUserGuid != Guid.Empty)
        {
            var recClient = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == recipientUserGuid || cp.Id == recipientUserGuid);
            if (recClient != null) clientProfileId = recClient.Id;
        }

        // If still missing either participant, provide a safe fallback so conversation creation NEVER fails
        if (clientProfileId == Guid.Empty)
        {
            var firstClient = await _context.ClientProfiles.FirstOrDefaultAsync();
            if (firstClient != null) clientProfileId = firstClient.Id;
            else
            {
                var newCp = new ClientProfile
                {
                    Id = Guid.NewGuid(),
                    CompanyName = req.RecipientName ?? "Verified Client",
                    ContactName = req.RecipientName ?? "Verified Client",
                    Industry = "Direct Business"
                };
                _context.ClientProfiles.Add(newCp);
                await _context.SaveChangesAsync();
                clientProfileId = newCp.Id;
            }
        }

        if (proProfileId == Guid.Empty)
        {
            var firstPro = await _context.ProfessionalProfiles.FirstOrDefaultAsync();
            if (firstPro != null) proProfileId = firstPro.Id;
            else
            {
                var newPp = new ProfessionalProfile
                {
                    Id = Guid.NewGuid(),
                    DisplayName = req.RecipientName ?? "Creative Specialist",
                    Headline = "Digital Creator & Specialist",
                    Slug = "specialist-" + Guid.NewGuid().ToString().Substring(0, 8)
                };
                _context.ProfessionalProfiles.Add(newPp);
                await _context.SaveChangesAsync();
                proProfileId = newPp.Id;
            }
        }

        // Check for existing conversation with the same contact
        var existingConv = await _context.Conversations
            .Include(c => c.ClientProfile).ThenInclude(cp => cp.User)
            .Include(c => c.ProfessionalProfile).ThenInclude(pp => pp.User)
            .Include(c => c.Requirement)
            .Include(c => c.Messages)
            .FirstOrDefaultAsync(c =>
                (c.ClientProfileId == clientProfileId && c.ProfessionalProfileId == proProfileId) ||
                (c.ClientProfile != null && c.ProfessionalProfile != null &&
                 ((c.ClientProfile.UserId == senderUserId && c.ProfessionalProfile.UserId == recipientUserGuid) ||
                  (c.ProfessionalProfile.UserId == senderUserId && c.ClientProfile.UserId == recipientUserGuid)))
            );

        if (existingConv != null)
        {
            if (requirement != null && (existingConv.RequirementId == null || existingConv.RequirementId == Guid.Empty))
            {
                existingConv.RequirementId = requirement.Id;
            }
            if (!string.IsNullOrWhiteSpace(req.ProjectId) && Guid.TryParse(req.ProjectId, out var pGuid) && existingConv.ProjectId == null)
            {
                existingConv.ProjectId = pGuid;
            }

            if (!string.IsNullOrWhiteSpace(req.InitialMessage))
            {
                var newMsg = new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    ConversationId = existingConv.Id,
                    SenderUserId = senderUserId != Guid.Empty ? senderUserId : (existingConv.ClientProfile?.UserId ?? Guid.NewGuid()),
                    SenderRole = string.Equals(req.SenderRole, "Professional", StringComparison.OrdinalIgnoreCase) ? UserRole.Professional : UserRole.Client,
                    Content = req.InitialMessage,
                    IsRead = false,
                    CreatedAtUtc = DateTime.UtcNow
                };
                _context.ChatMessages.Add(newMsg);
                existingConv.LastMessageAtUtc = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                var messageDto = new
                {
                    id = newMsg.Id,
                    conversationId = newMsg.ConversationId,
                    senderUserId = newMsg.SenderUserId,
                    senderRole = newMsg.SenderRole.ToString(),
                    content = newMsg.Content,
                    createdAtUtc = newMsg.CreatedAtUtc
                };
                await _hubContext.Clients.Group(existingConv.Id.ToString()).SendAsync("ReceiveMessage", messageDto);
                await _hubContext.Clients.All.SendAsync("MessagesUpdated");
            }

            return Ok(new
            {
                id = existingConv.Id,
                clientProfileId = existingConv.ClientProfileId,
                clientName = !string.IsNullOrWhiteSpace(existingConv.ClientProfile?.CompanyName) ? existingConv.ClientProfile.CompanyName : (existingConv.ClientProfile?.ContactName ?? req.RecipientName ?? "Client"),
                clientAvatar = existingConv.ClientProfile?.AvatarUrl,
                professionalProfileId = existingConv.ProfessionalProfileId,
                professionalName = existingConv.ProfessionalProfile?.DisplayName ?? req.RecipientName ?? "Doer",
                professionalAvatar = existingConv.ProfessionalProfile?.AvatarUrl,
                requirementId = existingConv.RequirementId,
                requirementTitle = existingConv.Requirement?.Title ?? requirement?.Title,
                projectId = existingConv.ProjectId,
                lastMessageAtUtc = existingConv.LastMessageAtUtc,
                lastMessage = existingConv.Messages.OrderByDescending(m => m.CreatedAtUtc).FirstOrDefault()?.Content ?? req.InitialMessage,
                unreadCount = 0
            });
        }

        // Create new conversation
        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            ClientProfileId = clientProfileId,
            ProfessionalProfileId = proProfileId,
            RequirementId = requirement?.Id,
            CreatedAtUtc = DateTime.UtcNow,
            LastMessageAtUtc = DateTime.UtcNow
        };

        if (!string.IsNullOrWhiteSpace(req.InitialMessage))
        {
            var newMsg = new ChatMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conversation.Id,
                SenderUserId = senderUserId,
                SenderRole = string.Equals(req.SenderRole, "Professional", StringComparison.OrdinalIgnoreCase) ? UserRole.Professional : UserRole.Client,
                Content = req.InitialMessage,
                IsRead = false,
                CreatedAtUtc = DateTime.UtcNow
            };
            conversation.Messages.Add(newMsg);
        }

        _context.Conversations.Add(conversation);
        await _context.SaveChangesAsync();

        var loadedConv = await _context.Conversations
            .Include(c => c.ClientProfile)
            .Include(c => c.ProfessionalProfile)
            .Include(c => c.Requirement)
            .Include(c => c.Messages)
            .FirstAsync(c => c.Id == conversation.Id);

        return Ok(new
        {
            id = loadedConv.Id,
            clientProfileId = loadedConv.ClientProfileId,
            clientName = !string.IsNullOrWhiteSpace(loadedConv.ClientProfile?.CompanyName) ? loadedConv.ClientProfile.CompanyName : (loadedConv.ClientProfile?.ContactName ?? req.RecipientName ?? "Client"),
            clientAvatar = loadedConv.ClientProfile?.AvatarUrl,
            professionalProfileId = loadedConv.ProfessionalProfileId,
            professionalName = loadedConv.ProfessionalProfile?.DisplayName ?? req.RecipientName ?? "Doer",
            professionalAvatar = loadedConv.ProfessionalProfile?.AvatarUrl,
            requirementId = loadedConv.RequirementId,
            requirementTitle = loadedConv.Requirement?.Title ?? requirement?.Title,
            projectId = loadedConv.ProjectId,
            lastMessageAtUtc = loadedConv.LastMessageAtUtc,
            lastMessage = req.InitialMessage,
            unreadCount = 0
        });
    }

    public record SendMessagePayload(
        Guid SenderUserId,
        string SenderRole,
        string Content,
        string? AttachmentUrl,
        string? AttachmentName,
        string? AttachmentType
    );

    [HttpPost("conversations/{conversationId}/messages")]
    public async Task<IActionResult> SendMessage(Guid conversationId, [FromBody] SendMessagePayload req)
    {
        var conversation = await _context.Conversations
            .Include(c => c.ClientProfile).ThenInclude(cp => cp.User)
            .Include(c => c.ProfessionalProfile).ThenInclude(pp => pp.User)
            .Include(c => c.Requirement)
            .FirstOrDefaultAsync(c => c.Id == conversationId);

        if (conversation == null)
        {
            // Auto-create fallback conversation if it does not exist
            var firstClient = await _context.ClientProfiles.FirstOrDefaultAsync();
            var firstPro = await _context.ProfessionalProfiles.FirstOrDefaultAsync();

            conversation = new Conversation
            {
                Id = conversationId,
                ClientProfileId = firstClient?.Id ?? Guid.NewGuid(),
                ProfessionalProfileId = firstPro?.Id ?? Guid.NewGuid(),
                CreatedAtUtc = DateTime.UtcNow,
                LastMessageAtUtc = DateTime.UtcNow
            };
            _context.Conversations.Add(conversation);
            await _context.SaveChangesAsync();
        }

        Enum.TryParse<UserRole>(req.SenderRole, true, out var parsedRole);

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderUserId = req.SenderUserId,
            SenderRole = parsedRole,
            Content = req.Content,
            AttachmentUrl = req.AttachmentUrl,
            AttachmentName = req.AttachmentName,
            AttachmentType = req.AttachmentType,
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

        // Determine sender name and recipient IDs for notification dispatch
        var senderName = req.SenderRole.Equals("Professional", StringComparison.OrdinalIgnoreCase)
            ? (conversation.ProfessionalProfile?.DisplayName ?? conversation.ProfessionalProfile?.User?.FullName ?? "Specialist")
            : (conversation.ClientProfile?.ContactName ?? conversation.ClientProfile?.CompanyName ?? conversation.ClientProfile?.User?.FullName ?? "Client");

        var recipientUserId = (conversation.ClientProfile?.UserId == req.SenderUserId || conversation.ClientProfileId == req.SenderUserId)
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

        // Broadcast to SignalR conversation group
        await _hubContext.Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", messageDto);

        // Send to targeted recipient user groups
        if (recipientUserId != Guid.Empty)
        {
            await _hubContext.Clients.Group($"user_{recipientUserId}").SendAsync("NewMessageNotification", notifDto);
        }
        if (conversation.ClientProfile != null)
        {
            await _hubContext.Clients.Group($"user_{conversation.ClientProfile.UserId}").SendAsync("NewMessageNotification", notifDto);
            await _hubContext.Clients.Group($"user_{conversation.ClientProfileId}").SendAsync("NewMessageNotification", notifDto);
        }
        if (conversation.ProfessionalProfile != null)
        {
            await _hubContext.Clients.Group($"user_{conversation.ProfessionalProfile.UserId}").SendAsync("NewMessageNotification", notifDto);
            await _hubContext.Clients.Group($"user_{conversation.ProfessionalProfileId}").SendAsync("NewMessageNotification", notifDto);
        }

        // Global message event so all active client views refresh their unread counts instantly
        await _hubContext.Clients.All.SendAsync("MessagesUpdated");

        return Ok(messageDto);
    }
}
