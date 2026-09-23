using System.Text.Json;
using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Data;
using CreativeHub.Infrastructure.Matching;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequirementsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IRuleBasedMatcher _matcher;

    public RequirementsController(AppDbContext context, IRuleBasedMatcher matcher)
    {
        _context = context;
        _matcher = matcher;
    }

    public record CreateRequirementRequest(
        Guid ClientProfileId,
        Guid CategoryId,
        string Title,
        string Description,
        decimal BudgetMin,
        decimal BudgetMax,
        string Currency,
        int ExpectedDeliveryDays,
        List<string> RequiredLanguages,
        bool RequiresOnCamera,
        bool RequiresProductShipment,
        JsonElement DynamicAttributes,
        bool IsPublicListing
    );

    [HttpPost]
    public async Task<IActionResult> CreateRequirement([FromBody] CreateRequirementRequest req)
    {
        var category = await _context.Categories.FindAsync(req.CategoryId);
        if (category == null) return BadRequest(new { message = "Invalid category." });

        var requirement = new Requirement
        {
            Id = Guid.NewGuid(),
            ClientProfileId = req.ClientProfileId,
            CategoryId = req.CategoryId,
            Title = req.Title,
            Description = req.Description,
            BudgetMin = req.BudgetMin,
            BudgetMax = req.BudgetMax,
            Currency = string.IsNullOrWhiteSpace(req.Currency) ? "INR" : req.Currency,
            ExpectedDeliveryDays = req.ExpectedDeliveryDays > 0 ? req.ExpectedDeliveryDays : 5,
            RequiredLanguages = req.RequiredLanguages ?? new List<string>(),
            RequiresOnCamera = req.RequiresOnCamera,
            RequiresProductShipment = req.RequiresProductShipment,
            DynamicAttributesJson = req.DynamicAttributes.GetRawText(),
            IsPublicListing = req.IsPublicListing,
            Status = RequirementStatus.Open,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Requirements.Add(requirement);
        await _context.SaveChangesAsync();

        return Ok(new
        {
            id = requirement.Id,
            clientProfileId = requirement.ClientProfileId,
            categoryId = requirement.CategoryId,
            title = requirement.Title,
            description = requirement.Description,
            budgetMin = requirement.BudgetMin,
            budgetMax = requirement.BudgetMax,
            currency = requirement.Currency,
            expectedDeliveryDays = requirement.ExpectedDeliveryDays,
            requiredLanguages = requirement.RequiredLanguages,
            requiresOnCamera = requirement.RequiresOnCamera,
            requiresProductShipment = requirement.RequiresProductShipment,
            dynamicAttributesJson = requirement.DynamicAttributesJson,
            isPublicListing = requirement.IsPublicListing,
            status = requirement.Status.ToString(),
            createdAtUtc = requirement.CreatedAtUtc
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetRequirementById(Guid id)
    {
        var req = await _context.Requirements
            .Include(r => r.Category)
            .Include(r => r.ClientProfile).ThenInclude(cp => cp.User)
            .Include(r => r.Proposals).ThenInclude(p => p.ProfessionalProfile)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (req == null) return NotFound();

        return Ok(new
        {
            id = req.Id,
            clientProfileId = req.ClientProfileId,
            clientName = req.ClientProfile.ContactName ?? req.ClientProfile.CompanyName,
            clientCompany = req.ClientProfile.CompanyName,
            categoryId = req.CategoryId,
            categoryName = req.Category.Name,
            categorySlug = req.Category.Slug,
            title = req.Title,
            description = req.Description,
            budgetMin = req.BudgetMin,
            budgetMax = req.BudgetMax,
            currency = req.Currency,
            expectedDeliveryDays = req.ExpectedDeliveryDays,
            requiredLanguages = req.RequiredLanguages,
            requiresOnCamera = req.RequiresOnCamera,
            requiresProductShipment = req.RequiresProductShipment,
            dynamicAttributesJson = req.DynamicAttributesJson,
            isPublicListing = req.IsPublicListing,
            status = req.Status.ToString(),
            createdAtUtc = req.CreatedAtUtc,
            proposalsCount = req.Proposals.Count
        });
    }

    [HttpGet("{id}/matches")]
    public async Task<IActionResult> GetMatchesForRequirement(Guid id)
    {
        var req = await _context.Requirements
            .Include(r => r.Category)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (req == null) return NotFound();

        var candidates = await _context.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.ProfessionalRoles).ThenInclude(pr => pr.RoleTaxonomy).ThenInclude(rt => rt.Category)
            .Include(p => p.ProfessionalSkills).ThenInclude(ps => ps.SkillTaxonomy)
            .Include(p => p.PortfolioItems)
            .ToListAsync();

        var matches = _matcher.MatchProfessionalsForRequirement(req, candidates);

        return Ok(matches.Select(m => new
        {
            professionalProfileId = m.ProfessionalProfileId,
            displayName = m.ProfessionalProfile.DisplayName,
            slug = m.ProfessionalProfile.Slug,
            headline = m.ProfessionalProfile.Headline,
            avatarUrl = m.ProfessionalProfile.AvatarUrl,
            hourlyRate = m.ProfessionalProfile.HourlyRate,
            currency = m.ProfessionalProfile.Currency,
            turnaroundDays = m.ProfessionalProfile.TurnaroundDays,
            averageRating = m.ProfessionalProfile.AverageRating,
            completedProjectsCount = m.ProfessionalProfile.CompletedProjectsCount,
            languages = m.ProfessionalProfile.Languages,
            appearsOnCamera = m.ProfessionalProfile.AppearsOnCamera,
            acceptsProductShipments = m.ProfessionalProfile.AcceptsProductShipments,
            totalScore = m.TotalScore,
            roleScore = m.RoleScore,
            skillsScore = m.SkillsScore,
            languageScore = m.LanguageScore,
            budgetAndSlaScore = m.BudgetAndSlaScore,
            breakdownPills = m.BreakdownPills,
            isRecommended = m.IsRecommended,
            topPortfolio = m.ProfessionalProfile.PortfolioItems.Take(2).Select(pi => new
            {
                id = pi.Id,
                title = pi.Title,
                thumbnailUrl = pi.ThumbnailUrl,
                mediaUrl = pi.MediaUrl
            })
        }));
    }

    [HttpGet("opportunities")]
    public async Task<IActionResult> GetOpportunities([FromQuery] string? categorySlug = null, [FromQuery] string? language = null)
    {
        var query = _context.Requirements
            .Include(r => r.Category)
            .Include(r => r.ClientProfile)
            .Include(r => r.Proposals)
            .Where(r => r.IsPublicListing && r.Status == RequirementStatus.Open)
            .OrderByDescending(r => r.CreatedAtUtc)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(categorySlug))
        {
            query = query.Where(r => r.Category.Slug == categorySlug);
        }

        var list = await query.ToListAsync();

        if (!string.IsNullOrWhiteSpace(language))
        {
            list = list.Where(r => r.RequiredLanguages.Any(l => l.Equals(language, StringComparison.OrdinalIgnoreCase))).ToList();
        }

        return Ok(list.Select(r => new
        {
            id = r.Id,
            clientCompany = r.ClientProfile.CompanyName ?? "Verified Brand",
            categoryName = r.Category.Name,
            categorySlug = r.Category.Slug,
            title = r.Title,
            description = r.Description,
            budgetMin = r.BudgetMin,
            budgetMax = r.BudgetMax,
            currency = r.Currency,
            expectedDeliveryDays = r.ExpectedDeliveryDays,
            requiredLanguages = r.RequiredLanguages,
            requiresOnCamera = r.RequiresOnCamera,
            requiresProductShipment = r.RequiresProductShipment,
            dynamicAttributesJson = r.DynamicAttributesJson,
            proposalsCount = r.Proposals.Count,
            createdAtUtc = r.CreatedAtUtc
        }));
    }

    [HttpGet("client/{clientProfileId}")]
    public async Task<IActionResult> GetClientRequirements(Guid clientProfileId)
    {
        var list = await _context.Requirements
            .Include(r => r.Category)
            .Include(r => r.Proposals).ThenInclude(p => p.ProfessionalProfile)
            .Where(r => r.ClientProfileId == clientProfileId)
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync();

        return Ok(list.Select(r => new
        {
            id = r.Id,
            categoryName = r.Category.Name,
            categorySlug = r.Category.Slug,
            title = r.Title,
            description = r.Description,
            budgetMin = r.BudgetMin,
            budgetMax = r.BudgetMax,
            currency = r.Currency,
            expectedDeliveryDays = r.ExpectedDeliveryDays,
            status = r.Status.ToString(),
            proposalsCount = r.Proposals.Count,
            proposals = r.Proposals.Select(p => new
            {
                id = p.Id,
                professionalProfileId = p.ProfessionalProfileId,
                professionalName = p.ProfessionalProfile.DisplayName,
                professionalSlug = p.ProfessionalProfile.Slug,
                avatarUrl = p.ProfessionalProfile.AvatarUrl,
                coverLetter = p.CoverLetter,
                proposedPrice = p.ProposedPrice,
                estimatedDays = p.EstimatedDays,
                status = p.Status.ToString(),
                createdAtUtc = p.CreatedAtUtc
            }),
            createdAtUtc = r.CreatedAtUtc
        }));
    }
}
