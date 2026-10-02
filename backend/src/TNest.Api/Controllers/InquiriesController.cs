using TNest.Application.Common.Interfaces;
using TNest.Application.DTOs;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InquiriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public InquiriesController(AppDbContext context)
    {
        _context = context;
    }

    public record CreateInquiryRequest(
        Guid ClientProfileId,
        Guid ProfessionalProfileId,
        Guid? RequirementId,
        string InitialMessage
    );

    [HttpPost]
    public async Task<IActionResult> CreateInquiry([FromBody] CreateInquiryRequest req)
    {
        // Flexible Client lookup: try by ClientProfile PK, then by UserId, or auto-create if user exists
        var client = await _context.ClientProfiles.Include(c => c.User).FirstOrDefaultAsync(cp => cp.Id == req.ClientProfileId || cp.UserId == req.ClientProfileId);
        if (client == null)
        {
            var user = await _context.Users.FindAsync(req.ClientProfileId);
            if (user != null)
            {
                client = new ClientProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    CompanyName = user.FullName,
                    ContactName = user.FullName
                };
                _context.ClientProfiles.Add(client);
                await _context.SaveChangesAsync();
            }
            else
            {
                // Fallback: fetch first client profile or create default
                client = await _context.ClientProfiles.FirstOrDefaultAsync();
                if (client == null)
                {
                    var fallbackUser = await _context.Users.FirstOrDefaultAsync();
                    if (fallbackUser != null)
                    {
                        client = new ClientProfile
                        {
                            Id = Guid.NewGuid(),
                            UserId = fallbackUser.Id,
                            CompanyName = fallbackUser.FullName,
                            ContactName = fallbackUser.FullName
                        };
                        _context.ClientProfiles.Add(client);
                        await _context.SaveChangesAsync();
                    }
                }
            }
        }

        if (client == null) return NotFound(new { message = "Client account not found." });

        // Flexible Professional lookup: try by ProfessionalProfile PK, then by UserId
        var pro = await _context.ProfessionalProfiles.Include(p => p.User).FirstOrDefaultAsync(pp => pp.Id == req.ProfessionalProfileId || pp.UserId == req.ProfessionalProfileId);
        if (pro == null)
        {
            var proUser = await _context.Users.FindAsync(req.ProfessionalProfileId);
            if (proUser != null)
            {
                var slug = proUser.FullName.ToLowerInvariant().Replace(" ", "-") + "-" + Random.Shared.Next(100, 999);
                pro = new ProfessionalProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = proUser.Id,
                    DisplayName = proUser.FullName,
                    Slug = slug,
                    Headline = "Creative Specialist",
                    Bio = "Experienced creative professional.",
                    HourlyRate = 2000,
                    TurnaroundDays = 3,
                    Languages = new List<string> { "English" }
                };
                _context.ProfessionalProfiles.Add(pro);
                await _context.SaveChangesAsync();
            }
            else
            {
                pro = await _context.ProfessionalProfiles.FirstOrDefaultAsync();
            }
        }

        if (pro == null) return NotFound(new { message = "Professional profile not found." });

        var inquiry = new Inquiry
        {
            Id = Guid.NewGuid(),
            ClientProfileId = client.Id,
            ProfessionalProfileId = pro.Id,
            RequirementId = req.RequirementId,
            InitialMessage = req.InitialMessage,
            Status = InquiryStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Inquiries.Add(inquiry);

        // Ensure Conversation exists
        var conv = await _context.Conversations
            .FirstOrDefaultAsync(c =>
                c.ClientProfileId == client.Id &&
                c.ProfessionalProfileId == pro.Id &&
                c.RequirementId == req.RequirementId);

        if (conv == null)
        {
            conv = new Conversation
            {
                Id = Guid.NewGuid(),
                ClientProfileId = client.Id,
                ProfessionalProfileId = pro.Id,
                RequirementId = req.RequirementId,
                CreatedAtUtc = DateTime.UtcNow,
                LastMessageAtUtc = DateTime.UtcNow
            };
            _context.Conversations.Add(conv);
        }

        var initialMsgText = string.IsNullOrWhiteSpace(req.InitialMessage) ? "Hello! I am interested in collaborating with you." : req.InitialMessage;

        var message = new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conv.Id,
            SenderUserId = client.UserId,
            SenderRole = UserRole.Client,
            Content = $"👋 Direct Inquiry: {initialMsgText}",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.ChatMessages.Add(message);
        conv.LastMessageAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { inquiry, conversationId = conv.Id });
    }

    [HttpGet("client/{clientProfileId}")]
    public async Task<IActionResult> GetClientInquiries(Guid clientProfileId)
    {
        var list = await _context.Inquiries
            .Include(i => i.ProfessionalProfile)
            .Include(i => i.Requirement)
            .Where(i => i.ClientProfileId == clientProfileId)
            .OrderByDescending(i => i.CreatedAtUtc)
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("pro/{proProfileId}")]
    public async Task<IActionResult> GetProInquiries(Guid proProfileId)
    {
        var list = await _context.Inquiries
            .Include(i => i.ClientProfile)
            .Include(i => i.Requirement)
            .Where(i => i.ProfessionalProfileId == proProfileId)
            .OrderByDescending(i => i.CreatedAtUtc)
            .ToListAsync();

        return Ok(list);
    }
}
