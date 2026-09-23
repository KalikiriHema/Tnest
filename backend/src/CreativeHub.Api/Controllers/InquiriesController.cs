using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Api.Controllers;

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
        var client = await _context.ClientProfiles.FindAsync(req.ClientProfileId);
        if (client == null) return NotFound(new { message = "Client not found." });

        var pro = await _context.ProfessionalProfiles.FindAsync(req.ProfessionalProfileId);
        if (pro == null) return NotFound(new { message = "Professional not found." });

        var inquiry = new Inquiry
        {
            Id = Guid.NewGuid(),
            ClientProfileId = req.ClientProfileId,
            ProfessionalProfileId = req.ProfessionalProfileId,
            RequirementId = req.RequirementId,
            InitialMessage = req.InitialMessage,
            Status = InquiryStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Inquiries.Add(inquiry);

        // Ensure Conversation exists
        var conv = await _context.Conversations.FirstOrDefaultAsync(c =>
            c.ClientProfileId == req.ClientProfileId &&
            c.ProfessionalProfileId == req.ProfessionalProfileId &&
            c.RequirementId == req.RequirementId);

        if (conv == null)
        {
            conv = new Conversation
            {
                Id = Guid.NewGuid(),
                ClientProfileId = req.ClientProfileId,
                ProfessionalProfileId = req.ProfessionalProfileId,
                RequirementId = req.RequirementId,
                CreatedAtUtc = DateTime.UtcNow,
                LastMessageAtUtc = DateTime.UtcNow
            };
            _context.Conversations.Add(conv);
        }

        conv.Messages.Add(new ChatMessage
        {
            Id = Guid.NewGuid(),
            ConversationId = conv.Id,
            SenderUserId = client.UserId,
            SenderRole = UserRole.Client,
            Content = $"👋 Direct Inquiry: {req.InitialMessage}",
            CreatedAtUtc = DateTime.UtcNow
        });

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
