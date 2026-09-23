using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChatController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("conversations/user/{userId}")]
    public async Task<IActionResult> GetUserConversations(Guid userId)
    {
        var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.UserId == userId);
        var proProfile = await _context.ProfessionalProfiles.FirstOrDefaultAsync(pp => pp.UserId == userId);

        var query = _context.Conversations
            .Include(c => c.ClientProfile).ThenInclude(cp => cp.User)
            .Include(c => c.ProfessionalProfile).ThenInclude(pp => pp.User)
            .Include(c => c.Requirement)
            .Include(c => c.Messages.OrderByDescending(m => m.CreatedAtUtc).Take(1))
            .AsQueryable();

        if (clientProfile != null && proProfile != null)
        {
            query = query.Where(c => c.ClientProfileId == clientProfile.Id || c.ProfessionalProfileId == proProfile.Id);
        }
        else if (clientProfile != null)
        {
            query = query.Where(c => c.ClientProfileId == clientProfile.Id);
        }
        else if (proProfile != null)
        {
            query = query.Where(c => c.ProfessionalProfileId == proProfile.Id);
        }
        else
        {
            return Ok(new List<object>());
        }

        var list = await query.OrderByDescending(c => c.LastMessageAtUtc).ToListAsync();

        return Ok(list.Select(c => new
        {
            id = c.Id,
            clientProfileId = c.ClientProfileId,
            clientName = c.ClientProfile.ContactName ?? c.ClientProfile.CompanyName ?? "Client",
            clientAvatar = c.ClientProfile.AvatarUrl,
            professionalProfileId = c.ProfessionalProfileId,
            professionalName = c.ProfessionalProfile.DisplayName,
            professionalAvatar = c.ProfessionalProfile.AvatarUrl,
            requirementId = c.RequirementId,
            requirementTitle = c.Requirement?.Title,
            projectId = c.ProjectId,
            lastMessageAtUtc = c.LastMessageAtUtc,
            lastMessage = c.Messages.FirstOrDefault()?.Content
        }));
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

        return Ok(new
        {
            conversation = new
            {
                id = conversation.Id,
                clientProfileId = conversation.ClientProfileId,
                clientName = conversation.ClientProfile.ContactName ?? conversation.ClientProfile.CompanyName,
                professionalProfileId = conversation.ProfessionalProfileId,
                professionalName = conversation.ProfessionalProfile.DisplayName,
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
}
