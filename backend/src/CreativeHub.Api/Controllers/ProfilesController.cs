using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProfilesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfilesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("professionals")]
    public async Task<IActionResult> BrowseProfessionals(
        [FromQuery] string? category = null,
        [FromQuery] string? language = null,
        [FromQuery] bool? onCamera = null,
        [FromQuery] bool? productShipment = null,
        [FromQuery] decimal? maxRate = null,
        [FromQuery] string? search = null)
    {
        var query = _context.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.ProfessionalRoles).ThenInclude(pr => pr.RoleTaxonomy).ThenInclude(rt => rt.Category)
            .Include(p => p.ProfessionalSkills).ThenInclude(ps => ps.SkillTaxonomy)
            .Include(p => p.PortfolioItems)
            .Include(p => p.Reviews)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.ProfessionalRoles.Any(pr => pr.RoleTaxonomy.Category.Slug == category));
        }

        if (onCamera.HasValue && onCamera.Value)
        {
            query = query.Where(p => p.AppearsOnCamera);
        }

        if (productShipment.HasValue && productShipment.Value)
        {
            query = query.Where(p => p.AcceptsProductShipments);
        }

        if (maxRate.HasValue && maxRate.Value > 0)
        {
            query = query.Where(p => p.HourlyRate <= maxRate.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            query = query.Where(p => p.DisplayName.ToLower().Contains(s) || p.Headline.ToLower().Contains(s) || p.Bio.ToLower().Contains(s));
        }

        var list = await query.ToListAsync();

        if (!string.IsNullOrWhiteSpace(language))
        {
            list = list.Where(p => p.Languages.Any(l => l.Equals(language, StringComparison.OrdinalIgnoreCase))).ToList();
        }

        return Ok(list.Select(p => new
        {
            id = p.Id,
            userId = p.UserId,
            displayName = p.DisplayName,
            slug = p.Slug,
            headline = p.Headline,
            bio = p.Bio,
            avatarUrl = p.AvatarUrl,
            bannerUrl = p.BannerUrl,
            experienceLevel = p.ExperienceLevel,
            yearsOfExperience = p.YearsOfExperience,
            availabilityStatus = p.AvailabilityStatus.ToString(),
            hourlyRate = p.HourlyRate,
            currency = p.Currency,
            turnaroundDays = p.TurnaroundDays,
            languages = p.Languages,
            appearsOnCamera = p.AppearsOnCamera,
            acceptsProductShipments = p.AcceptsProductShipments,
            averageRating = p.AverageRating,
            completedProjectsCount = p.CompletedProjectsCount,
            isVerified = p.IsVerified,
            roles = p.ProfessionalRoles.Select(r => new { id = r.RoleTaxonomy.Id, name = r.RoleTaxonomy.Name, categorySlug = r.RoleTaxonomy.Category.Slug }),
            skills = p.ProfessionalSkills.Select(s => new { id = s.SkillTaxonomy.Id, name = s.SkillTaxonomy.Name }),
            portfolio = p.PortfolioItems.Select(pi => new
            {
                id = pi.Id,
                title = pi.Title,
                description = pi.Description,
                categorySlug = pi.CategorySlug,
                rolePerformed = pi.RolePerformed,
                toolsUsed = pi.ToolsUsed,
                thumbnailUrl = pi.ThumbnailUrl,
                mediaUrl = pi.MediaUrl,
                mediaType = pi.MediaType
            }),
            reviewCount = p.Reviews.Count
        }));
    }

    [HttpGet("professionals/{slug}")]
    public async Task<IActionResult> GetProfessionalBySlug(string slug)
    {
        var pro = await _context.ProfessionalProfiles
            .Include(p => p.User)
            .Include(p => p.ProfessionalRoles).ThenInclude(pr => pr.RoleTaxonomy).ThenInclude(rt => rt.Category)
            .Include(p => p.ProfessionalSkills).ThenInclude(ps => ps.SkillTaxonomy)
            .Include(p => p.PortfolioItems)
            .Include(p => p.Reviews).ThenInclude(r => r.ClientProfile)
            .FirstOrDefaultAsync(p => p.Slug == slug);

        if (pro == null) return NotFound();

        return Ok(new
        {
            id = pro.Id,
            userId = pro.UserId,
            displayName = pro.DisplayName,
            slug = pro.Slug,
            headline = pro.Headline,
            bio = pro.Bio,
            avatarUrl = pro.AvatarUrl,
            bannerUrl = pro.BannerUrl,
            experienceLevel = pro.ExperienceLevel,
            yearsOfExperience = pro.YearsOfExperience,
            availabilityStatus = pro.AvailabilityStatus.ToString(),
            hourlyRate = pro.HourlyRate,
            currency = pro.Currency,
            turnaroundDays = pro.TurnaroundDays,
            languages = pro.Languages,
            appearsOnCamera = pro.AppearsOnCamera,
            acceptsProductShipments = pro.AcceptsProductShipments,
            averageRating = pro.AverageRating,
            completedProjectsCount = pro.CompletedProjectsCount,
            isVerified = pro.IsVerified,
            roles = pro.ProfessionalRoles.Select(r => new { id = r.RoleTaxonomy.Id, name = r.RoleTaxonomy.Name, categorySlug = r.RoleTaxonomy.Category.Slug }),
            skills = pro.ProfessionalSkills.Select(s => new { id = s.SkillTaxonomy.Id, name = s.SkillTaxonomy.Name }),
            portfolio = pro.PortfolioItems.Select(pi => new
            {
                id = pi.Id,
                title = pi.Title,
                description = pi.Description,
                categorySlug = pi.CategorySlug,
                rolePerformed = pi.RolePerformed,
                toolsUsed = pi.ToolsUsed,
                thumbnailUrl = pi.ThumbnailUrl,
                mediaUrl = pi.MediaUrl,
                mediaType = pi.MediaType,
                liveUrl = pi.LiveUrl
            }),
            reviews = pro.Reviews.Select(r => new
            {
                id = r.Id,
                clientName = r.ClientProfile.ContactName ?? r.ClientProfile.CompanyName ?? "Verified Brand",
                clientCompany = r.ClientProfile.CompanyName,
                overallRating = r.OverallRating,
                communicationRating = r.CommunicationRating,
                qualityRating = r.QualityRating,
                timelinessRating = r.TimelinessRating,
                comment = r.Comment,
                professionalResponse = r.ProfessionalResponse,
                createdAtUtc = r.CreatedAtUtc
            })
        });
    }

    public record UpdateProProfileRequest(
        string DisplayName,
        string Headline,
        string Bio,
        decimal HourlyRate,
        int TurnaroundDays,
        List<string> Languages,
        bool AppearsOnCamera,
        bool AcceptsProductShipments,
        string ExperienceLevel,
        int YearsOfExperience
    );

    [HttpPut("professionals/{id}")]
    public async Task<IActionResult> UpdateProfessional(Guid id, [FromBody] UpdateProProfileRequest req)
    {
        var pro = await _context.ProfessionalProfiles.FindAsync(id);
        if (pro == null) return NotFound();

        pro.DisplayName = req.DisplayName;
        pro.Headline = req.Headline;
        pro.Bio = req.Bio;
        pro.HourlyRate = req.HourlyRate;
        pro.TurnaroundDays = req.TurnaroundDays;
        pro.Languages = req.Languages ?? new List<string>();
        pro.AppearsOnCamera = req.AppearsOnCamera;
        pro.AcceptsProductShipments = req.AcceptsProductShipments;
        pro.ExperienceLevel = req.ExperienceLevel;
        pro.YearsOfExperience = req.YearsOfExperience;

        await _context.SaveChangesAsync();
        return Ok(pro);
    }
}
