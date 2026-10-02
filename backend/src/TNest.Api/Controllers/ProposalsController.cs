using TNest.Application.Common.Interfaces;
using TNest.Application.DTOs;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProposalsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProposalsController(AppDbContext context)
    {
        _context = context;
    }

    public record SubmitProposalRequest(
        Guid RequirementId,
        Guid ProfessionalProfileId,
        string CoverLetter,
        decimal ProposedPrice,
        int EstimatedDays
    );

    [HttpPost]
    public async Task<IActionResult> SubmitProposal([FromBody] SubmitProposalRequest req)
    {
        var requirement = await _context.Requirements
            .Include(r => r.ClientProfile)
            .FirstOrDefaultAsync(r => r.Id == req.RequirementId);
        if (requirement == null) return NotFound(new { message = "Requirement not found." });

        if (requirement.Status != RequirementStatus.Open || requirement.IsHidden)
        {
            return BadRequest(new { message = "This opportunity is closed or no longer accepting proposals." });
        }

        var pro = await _context.ProfessionalProfiles.FindAsync(req.ProfessionalProfileId);
        if (pro == null) return NotFound(new { message = "Professional profile not found." });

        if (requirement.ClientProfile != null && requirement.ClientProfile.UserId == pro.UserId)
        {
            return BadRequest(new { message = "You cannot apply to your own posted requirement." });
        }

        var alreadyApplied = await _context.Proposals.AnyAsync(p => p.RequirementId == req.RequirementId && p.ProfessionalProfileId == req.ProfessionalProfileId);
        if (alreadyApplied)
        {
            return BadRequest(new { message = "You have already submitted a proposal for this opportunity." });
        }

        if (req.ProposedPrice <= 0 || req.EstimatedDays < 1)
        {
            return BadRequest(new { message = "Proposed price and timeline must be positive values." });
        }

        var proposal = new Proposal
        {
            Id = Guid.NewGuid(),
            RequirementId = req.RequirementId,
            ProfessionalProfileId = req.ProfessionalProfileId,
            CoverLetter = req.CoverLetter,
            ProposedPrice = req.ProposedPrice,
            EstimatedDays = req.EstimatedDays,
            Status = ProposalStatus.Submitted,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Proposals.Add(proposal);

        // Auto-create or ensure Conversation between Client and Pro for this requirement
        var existingConv = await _context.Conversations.FirstOrDefaultAsync(c =>
            c.ClientProfileId == requirement.ClientProfileId &&
            c.ProfessionalProfileId == req.ProfessionalProfileId &&
            c.RequirementId == req.RequirementId);

        if (existingConv == null)
        {
            var conv = new Conversation
            {
                Id = Guid.NewGuid(),
                ClientProfileId = requirement.ClientProfileId,
                ProfessionalProfileId = req.ProfessionalProfileId,
                RequirementId = req.RequirementId,
                CreatedAtUtc = DateTime.UtcNow,
                LastMessageAtUtc = DateTime.UtcNow
            };
            conv.Messages.Add(new ChatMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conv.Id,
                SenderUserId = pro.UserId,
                SenderRole = UserRole.Professional,
                Content = $"Submitted Proposal: ₹{req.ProposedPrice:N0} in {req.EstimatedDays} days.\n\n\"{req.CoverLetter}\"",
                CreatedAtUtc = DateTime.UtcNow
            });
            _context.Conversations.Add(conv);
        }

        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = proposal.Id,
            requirementId = proposal.RequirementId,
            professionalProfileId = proposal.ProfessionalProfileId,
            coverLetter = proposal.CoverLetter,
            proposedPrice = proposal.ProposedPrice,
            estimatedDays = proposal.EstimatedDays,
            status = proposal.Status.ToString(),
            createdAtUtc = proposal.CreatedAtUtc
        });
    }

    [HttpPost("{id}/accept")]
    public async Task<IActionResult> AcceptProposal(Guid id)
    {
        await using var tx = await _context.Database.BeginTransactionAsync();

        var proposal = await _context.Proposals
            .Include(p => p.Requirement).ThenInclude(r => r.ClientProfile)
            .Include(p => p.ProfessionalProfile)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (proposal == null) return NotFound(new { message = "Proposal not found." });

        proposal.Status = ProposalStatus.Accepted;

        // Create Active Project Milestone Agreement
        var project = new Project
        {
            Id = Guid.NewGuid(),
            ClientProfileId = proposal.Requirement.ClientProfileId,
            ProfessionalProfileId = proposal.ProfessionalProfileId,
            RequirementId = proposal.RequirementId,
            ProposalId = proposal.Id,
            Title = proposal.Requirement.Title,
            AgreedPrice = proposal.ProposedPrice,
            Currency = proposal.Requirement.Currency,
            DeadlineUtc = DateTime.UtcNow.AddDays(proposal.EstimatedDays),
            Status = ProjectStatus.InProgress,
            RequiresShipment = proposal.Requirement.RequiresProductShipment,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Projects.Add(project);

        // Update conversation with project link
        var conv = await _context.Conversations.FirstOrDefaultAsync(c =>
            c.ClientProfileId == proposal.Requirement.ClientProfileId &&
            c.ProfessionalProfileId == proposal.ProfessionalProfileId &&
            c.RequirementId == proposal.RequirementId);

        if (conv != null)
        {
            conv.ProjectId = project.Id;
            conv.LastMessageAtUtc = DateTime.UtcNow;

            var clientUserId = proposal.Requirement.ClientProfile?.UserId ?? proposal.Requirement.ClientProfileId;
            var systemMsg = new ChatMessage
            {
                Id = Guid.NewGuid(),
                ConversationId = conv.Id,
                SenderUserId = clientUserId,
                SenderRole = UserRole.Client,
                Content = $"🎉 Proposal Accepted! Project Agreement activated for ₹{project.AgreedPrice:N0}. Deadline: {project.DeadlineUtc:dd MMM yyyy}.",
                CreatedAtUtc = DateTime.UtcNow
            };
            _context.ChatMessages.Add(systemMsg);
        }

        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(new
        {
            project = new
            {
                id = project.Id,
                title = project.Title,
                clientProfileId = project.ClientProfileId,
                professionalProfileId = project.ProfessionalProfileId,
                agreedPrice = project.AgreedPrice,
                currency = project.Currency,
                deadlineUtc = project.DeadlineUtc,
                status = project.Status.ToString(),
                requiresShipment = project.RequiresShipment
            },
            proposal = new
            {
                id = proposal.Id,
                status = proposal.Status.ToString()
            }
        });
    }

    [HttpGet("pro/{proProfileId}")]
    public async Task<IActionResult> GetProProposals(Guid proProfileId)
    {
        var proposals = await _context.Proposals
            .AsNoTracking()
            .Include(p => p.Requirement).ThenInclude(r => r.Category)
            .Include(p => p.Requirement).ThenInclude(r => r.ClientProfile)
            .Where(p => p.ProfessionalProfileId == proProfileId)
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync();

        return Ok(proposals.Select(p => new
        {
            id = p.Id,
            requirementId = p.RequirementId,
            requirementTitle = p.Requirement.Title,
            categoryName = p.Requirement.Category.Name,
            clientCompany = p.Requirement.ClientProfile.CompanyName ?? "Brand",
            coverLetter = p.CoverLetter,
            proposedPrice = p.ProposedPrice,
            estimatedDays = p.EstimatedDays,
            status = p.Status.ToString(),
            createdAtUtc = p.CreatedAtUtc
        }));
    }

    [HttpGet("requirement/{requirementId}")]
    public async Task<IActionResult> GetRequirementProposals(Guid requirementId)
    {
        var proposals = await _context.Proposals
            .Include(p => p.ProfessionalProfile).ThenInclude(pp => pp.User)
            .Include(p => p.ProfessionalProfile).ThenInclude(pp => pp.ProfessionalRoles).ThenInclude(pr => pr.RoleTaxonomy)
            .Include(p => p.ProfessionalProfile).ThenInclude(pp => pp.ProfessionalSkills).ThenInclude(ps => ps.SkillTaxonomy)
            .Include(p => p.Requirement)
            .Where(p => p.RequirementId == requirementId)
            .OrderByDescending(p => p.CreatedAtUtc)
            .ToListAsync();

        return Ok(proposals.Select(p => new
        {
            id = p.Id,
            requirementId = p.RequirementId,
            professionalProfileId = p.ProfessionalProfileId,
            proDisplayName = p.ProfessionalProfile.DisplayName,
            proHeadline = p.ProfessionalProfile.Headline,
            proAvatarUrl = p.ProfessionalProfile.AvatarUrl,
            proSlug = p.ProfessionalProfile.Slug,
            proRating = p.ProfessionalProfile.AverageRating,
            proExperienceLevel = p.ProfessionalProfile.ExperienceLevel,
            proHourlyRate = p.ProfessionalProfile.HourlyRate,
            proSkills = p.ProfessionalProfile.ProfessionalSkills.Select(s => s.SkillTaxonomy.Name).ToList(),
            proRoles = p.ProfessionalProfile.ProfessionalRoles.Select(r => r.RoleTaxonomy.Name).ToList(),
            coverLetter = p.CoverLetter,
            proposedPrice = p.ProposedPrice,
            estimatedDays = p.EstimatedDays,
            status = p.Status.ToString(),
            createdAtUtc = p.CreatedAtUtc
        }));
    }

    [HttpPost("{id}/shortlist")]
    public async Task<IActionResult> ShortlistProposal(Guid id)
    {
        var proposal = await _context.Proposals.FindAsync(id);
        if (proposal == null) return NotFound(new { message = "Proposal not found." });

        proposal.Status = ProposalStatus.Shortlisted;
        await _context.SaveChangesAsync();

        return Ok(new { id = proposal.Id, status = proposal.Status.ToString() });
    }

    [HttpPost("{id}/reject")]
    public async Task<IActionResult> RejectProposal(Guid id)
    {
        var proposal = await _context.Proposals.FindAsync(id);
        if (proposal == null) return NotFound(new { message = "Proposal not found." });

        proposal.Status = ProposalStatus.Declined;
        await _context.SaveChangesAsync();

        return Ok(new { id = proposal.Id, status = proposal.Status.ToString() });
    }
}

