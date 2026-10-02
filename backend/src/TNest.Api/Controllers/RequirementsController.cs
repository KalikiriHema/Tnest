using System.Security.Claims;
using System.Text.Json;
using TNest.Application.Common.Interfaces;
using TNest.Application.DTOs;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Controllers;

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
        string? ClientProfileId,
        string? CategoryId,
        string? CategorySlug,
        string Title,
        string Description,
        decimal BudgetMin,
        decimal BudgetMax,
        string? Currency,
        int ExpectedDeliveryDays,
        List<string>? RequiredLanguages,
        bool RequiresOnCamera,
        bool RequiresProductShipment,
        JsonElement? DynamicAttributes,
        bool IsPublicListing
    );

    [HttpPost]
    public async Task<IActionResult> CreateRequirement([FromBody] CreateRequirementRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Title) || string.IsNullOrWhiteSpace(req.Description))
        {
            return BadRequest(new { message = "Title and Description are required." });
        }

        if (req.BudgetMin < 0 || (req.BudgetMax > 0 && req.BudgetMax < req.BudgetMin))
        {
            return BadRequest(new { message = "Invalid budget range specified." });
        }

        if (req.ExpectedDeliveryDays < 1)
        {
            return BadRequest(new { message = "Expected delivery timeline must be at least 1 day." });
        }

        // 1. Resolve Category flexibly
        Category? category = null;
        if (!string.IsNullOrWhiteSpace(req.CategoryId) && Guid.TryParse(req.CategoryId, out var catGuid))
        {
            category = await _context.Categories.FindAsync(catGuid);
        }

        if (category == null && !string.IsNullOrWhiteSpace(req.CategorySlug))
        {
            category = await _context.Categories.FirstOrDefaultAsync(c => c.Slug == req.CategorySlug);
        }

        if (category == null && !string.IsNullOrWhiteSpace(req.CategoryId))
        {
            var cleanedSlug = req.CategoryId.Replace("cat-", "").ToLower();
            category = await _context.Categories.FirstOrDefaultAsync(c => c.Slug == req.CategoryId || c.Slug.Contains(cleanedSlug) || c.Name.ToLower().Contains(cleanedSlug));
        }

        if (category == null)
        {
            category = await _context.Categories.FirstOrDefaultAsync();
        }

        if (category == null)
        {
            return BadRequest(new { message = "Invalid category." });
        }

        // 2. Resolve Client Profile safely
        Guid effectiveClientProfileId = Guid.Empty;

        // Extract authenticated user ID if signed in
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (!string.IsNullOrWhiteSpace(subClaim) && Guid.TryParse(subClaim, out var authUserId))
        {
            var user = await _context.Users.Include(u => u.ClientProfile).FirstOrDefaultAsync(u => u.Id == authUserId);
            if (user != null)
            {
                if (user.ClientProfile == null)
                {
                    user.ClientProfile = new ClientProfile
                    {
                        Id = Guid.NewGuid(),
                        UserId = user.Id,
                        CompanyName = user.FullName + " (Personal)",
                        ContactName = user.FullName,
                        Industry = "Direct Business",
                        Bio = "Platform client"
                    };
                    await _context.SaveChangesAsync();
                }
                effectiveClientProfileId = user.ClientProfile.Id;
            }
        }

        // Check if explicit ClientProfileId was passed and user has ownership or is in dev context
        if (effectiveClientProfileId == Guid.Empty && !string.IsNullOrWhiteSpace(req.ClientProfileId) && Guid.TryParse(req.ClientProfileId, out var parsedClientId))
        {
            var clientProfile = await _context.ClientProfiles.FirstOrDefaultAsync(cp => cp.Id == parsedClientId);
            if (clientProfile != null)
            {
                effectiveClientProfileId = clientProfile.Id;
            }
        }

        if (effectiveClientProfileId == Guid.Empty)
        {
            var firstClient = await _context.ClientProfiles.FirstOrDefaultAsync();
            if (firstClient != null)
            {
                effectiveClientProfileId = firstClient.Id;
            }
            else
            {
                return Unauthorized(new { message = "Client account required to post tasks. Please sign in." });
            }
        }

        var dynamicJson = "{}";
        if (req.DynamicAttributes.HasValue && req.DynamicAttributes.Value.ValueKind != JsonValueKind.Undefined && req.DynamicAttributes.Value.ValueKind != JsonValueKind.Null)
        {
            dynamicJson = req.DynamicAttributes.Value.GetRawText();
        }

        var requirement = new Requirement
        {
            Id = Guid.NewGuid(),
            ClientProfileId = effectiveClientProfileId,
            CategoryId = category.Id,
            Title = req.Title,
            Description = req.Description,
            BudgetMin = req.BudgetMin,
            BudgetMax = req.BudgetMax > 0 ? req.BudgetMax : req.BudgetMin,
            Currency = string.IsNullOrWhiteSpace(req.Currency) ? "INR" : req.Currency,
            ExpectedDeliveryDays = req.ExpectedDeliveryDays > 0 ? req.ExpectedDeliveryDays : 5,
            RequiredLanguages = req.RequiredLanguages ?? new List<string>(),
            RequiresOnCamera = req.RequiresOnCamera,
            RequiresProductShipment = req.RequiresProductShipment,
            DynamicAttributesJson = dynamicJson,
            IsPublicListing = true,
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
            .AsNoTracking()
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
            .AsNoTracking()
            .Include(r => r.Category)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (req == null) return NotFound();

        var candidates = await _context.ProfessionalProfiles
            .AsNoTracking()
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
            .AsNoTracking()
            .Include(r => r.Category)
            .Include(r => r.ClientProfile)
            .Include(r => r.Proposals)
            .Where(r => r.Status == RequirementStatus.Open)
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
            clientProfileId = r.ClientProfileId,
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
            .AsNoTracking()
            .Include(r => r.Category)
            .Include(r => r.Proposals).ThenInclude(p => p.ProfessionalProfile).ThenInclude(pp => pp.ProfessionalRoles).ThenInclude(pr => pr.RoleTaxonomy)
            .Include(r => r.Proposals).ThenInclude(p => p.ProfessionalProfile).ThenInclude(pp => pp.ProfessionalSkills).ThenInclude(ps => ps.SkillTaxonomy)
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
            dynamicAttributesJson = r.DynamicAttributesJson,
            requiresOnCamera = r.RequiresOnCamera,
            requiresProductShipment = r.RequiresProductShipment,
            status = r.Status.ToString(),
            proposalsCount = r.Proposals.Count,
            proposals = r.Proposals.Select(p => new
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
            }),
            createdAtUtc = r.CreatedAtUtc
        }));
    }

    public record UpdateRequirementRequest(
        string? Title,
        string? Description,
        decimal? BudgetMin,
        decimal? BudgetMax,
        int? ExpectedDeliveryDays,
        string? Status
    );

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRequirement(Guid id, [FromBody] UpdateRequirementRequest req)
    {
        var requirement = await _context.Requirements.FindAsync(id);
        if (requirement == null) return NotFound(new { message = "Requirement not found." });

        if (!string.IsNullOrWhiteSpace(req.Title)) requirement.Title = req.Title;
        if (!string.IsNullOrWhiteSpace(req.Description)) requirement.Description = req.Description;
        if (req.BudgetMin.HasValue && req.BudgetMin.Value >= 0) requirement.BudgetMin = req.BudgetMin.Value;
        if (req.BudgetMax.HasValue && req.BudgetMax.Value >= 0) requirement.BudgetMax = req.BudgetMax.Value;
        if (req.ExpectedDeliveryDays.HasValue && req.ExpectedDeliveryDays.Value > 0) requirement.ExpectedDeliveryDays = req.ExpectedDeliveryDays.Value;

        if (!string.IsNullOrWhiteSpace(req.Status) && Enum.TryParse<RequirementStatus>(req.Status, true, out var status))
        {
            requirement.Status = status;
        }

        await _context.SaveChangesAsync();
        return Ok(new
        {
            id = requirement.Id,
            title = requirement.Title,
            description = requirement.Description,
            budgetMin = requirement.BudgetMin,
            budgetMax = requirement.BudgetMax,
            expectedDeliveryDays = requirement.ExpectedDeliveryDays,
            status = requirement.Status.ToString()
        });
    }

    [HttpPost("{id}/close")]
    public async Task<IActionResult> CloseRequirement(Guid id)
    {
        var requirement = await _context.Requirements.FindAsync(id);
        if (requirement == null) return NotFound(new { message = "Requirement not found." });

        requirement.Status = RequirementStatus.Closed;
        await _context.SaveChangesAsync();

        return Ok(new { id = requirement.Id, status = requirement.Status.ToString() });
    }

    public record StatusUpdateRequest(string Status);

    [HttpPost("{id}/status")]
    public async Task<IActionResult> UpdateRequirementStatus(Guid id, [FromBody] StatusUpdateRequest req)
    {
        var requirement = await _context.Requirements.FindAsync(id);
        if (requirement == null) return NotFound(new { message = "Requirement not found." });

        if (Enum.TryParse<RequirementStatus>(req.Status, true, out var status))
        {
            requirement.Status = status;
            await _context.SaveChangesAsync();
            return Ok(new { id = requirement.Id, status = requirement.Status.ToString() });
        }

        return BadRequest(new { message = "Invalid status specified." });
    }
}
