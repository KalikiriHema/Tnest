using TNest.Application.Common.Interfaces;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Controllers;

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
            .AsNoTracking()
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
            city = pro.City,
            state = pro.State,
            experienceLevel = pro.ExperienceLevel,
            yearsOfExperience = pro.YearsOfExperience,
            availabilityStatus = pro.AvailabilityStatus.ToString(),
            hourlyRate = pro.HourlyRate,
            currency = pro.Currency,
            turnaroundDays = pro.TurnaroundDays,
            languages = pro.Languages,
            appearsOnCamera = pro.AppearsOnCamera,
            acceptsProductShipments = pro.AcceptsProductShipments,
            preferredRoles = pro.PreferredRoles,
            opportunityTypes = pro.OpportunityTypes,
            preferredLocationType = pro.PreferredLocationType,
            expectedCompensationMin = pro.ExpectedCompensationMin,
            expectedCompensationMax = pro.ExpectedCompensationMax,
            resumeUrl = pro.ResumeUrl,
            resumeFileName = pro.ResumeFileName,
            websiteUrl = pro.WebsiteUrl,
            githubUrl = pro.GithubUrl,
            linkedinUrl = pro.LinkedinUrl,
            instagramUrl = pro.InstagramUrl,
            youtubeUrl = pro.YoutubeUrl,
            behanceUrl = pro.BehanceUrl,
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
        string? AvatarUrl,
        string? BannerUrl,
        string? City,
        string? State,
        string? Gender,
        string? DateOfBirth,
        string? Email,
        string? PhoneNumber,
        decimal HourlyRate,
        string Currency,
        int TurnaroundDays,
        string AvailabilityStatus,
        List<string> Languages,
        bool AppearsOnCamera,
        bool AcceptsProductShipments,
        string ExperienceLevel,
        int YearsOfExperience,
        List<string>? PreferredRoles,
        List<string>? OpportunityTypes,
        string? PreferredLocationType,
        decimal? ExpectedCompensationMin,
        decimal? ExpectedCompensationMax,
        string? ResumeUrl,
        string? ResumeFileName,
        string? WebsiteUrl,
        string? GithubUrl,
        string? LinkedinUrl,
        string? InstagramUrl,
        string? YoutubeUrl,
        string? BehanceUrl
    );

    [HttpPut("professionals/{id}")]
    public async Task<IActionResult> UpdateProfessional(Guid id, [FromBody] UpdateProProfileRequest req)
    {
        var pro = await _context.ProfessionalProfiles.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id);
        if (pro == null) return NotFound();

        pro.DisplayName = req.DisplayName;
        pro.Headline = req.Headline;
        pro.Bio = req.Bio;
        if (!string.IsNullOrWhiteSpace(req.AvatarUrl)) pro.AvatarUrl = req.AvatarUrl;
        if (!string.IsNullOrWhiteSpace(req.BannerUrl)) pro.BannerUrl = req.BannerUrl;
        pro.City = req.City;
        pro.State = req.State;
        pro.Gender = req.Gender;
        pro.DateOfBirth = req.DateOfBirth;

        if (pro.User != null)
        {
            if (!string.IsNullOrWhiteSpace(req.DisplayName)) pro.User.FullName = req.DisplayName;
            if (!string.IsNullOrWhiteSpace(req.PhoneNumber)) pro.User.PhoneNumber = req.PhoneNumber;
        }

        pro.HourlyRate = req.HourlyRate;
        if (!string.IsNullOrWhiteSpace(req.Currency)) pro.Currency = req.Currency;
        pro.TurnaroundDays = req.TurnaroundDays;
        
        if (Enum.TryParse<AvailabilityStatus>(req.AvailabilityStatus, true, out var avail))
        {
            pro.AvailabilityStatus = avail;
        }

        pro.Languages = req.Languages ?? new List<string>();
        pro.AppearsOnCamera = req.AppearsOnCamera;
        pro.AcceptsProductShipments = req.AcceptsProductShipments;
        pro.ExperienceLevel = req.ExperienceLevel;
        pro.YearsOfExperience = req.YearsOfExperience;

        pro.PreferredRoles = req.PreferredRoles ?? new List<string>();
        pro.OpportunityTypes = req.OpportunityTypes ?? new List<string>();
        if (!string.IsNullOrWhiteSpace(req.PreferredLocationType)) pro.PreferredLocationType = req.PreferredLocationType;
        if (req.ExpectedCompensationMin.HasValue) pro.ExpectedCompensationMin = req.ExpectedCompensationMin.Value;
        if (req.ExpectedCompensationMax.HasValue) pro.ExpectedCompensationMax = req.ExpectedCompensationMax.Value;

        pro.ResumeUrl = req.ResumeUrl;
        pro.ResumeFileName = req.ResumeFileName;
        pro.WebsiteUrl = req.WebsiteUrl;
        pro.GithubUrl = req.GithubUrl;
        pro.LinkedinUrl = req.LinkedinUrl;
        pro.InstagramUrl = req.InstagramUrl;
        pro.YoutubeUrl = req.YoutubeUrl;
        pro.BehanceUrl = req.BehanceUrl;

        await _context.SaveChangesAsync();
        return Ok(pro);
    }

    [HttpGet("clients/me")]
    public async Task<IActionResult> GetMyClientProfile()
    {
        var subClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var authUserId))
        {
            return Unauthorized(new { message = "Authentication required." });
        }

        var client = await _context.ClientProfiles
            .Include(c => c.User)
            .Include(c => c.Requirements)
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.UserId == authUserId);

        if (client == null)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == authUserId);
            if (user == null) return NotFound(new { message = "User not found." });

            client = new ClientProfile
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                ContactName = user.FullName,
                CompanyName = user.FullName + " Studio",
                AvatarUrl = null,
                City = null,
                State = null,
                Bio = null,
                ClientType = "Business"
            };
            _context.ClientProfiles.Add(client);
            await _context.SaveChangesAsync();
        }

        return Ok(new TNest.Application.DTOs.ClientProfileDto
        {
            Id = client.Id,
            UserId = client.UserId,
            ContactName = client.ContactName ?? client.User?.FullName,
            CompanyName = client.CompanyName,
            AvatarUrl = client.AvatarUrl,
            WebsiteUrl = client.WebsiteUrl,
            Industry = client.Industry,
            Bio = client.Bio,
            BusinessDescription = client.BusinessDescription,
            ClientType = client.ClientType ?? "Business",
            City = client.City,
            State = client.State,
            Gender = client.Gender,
            DateOfBirth = client.DateOfBirth,
            LinkedinUrl = client.LinkedinUrl,
            InstagramUrl = client.InstagramUrl,
            YoutubeUrl = client.YoutubeUrl,
            OtherUrl = client.OtherUrl,
            Email = client.User?.Email,
            PhoneNumber = client.User?.PhoneNumber,
            PostedRequirementsCount = client.Requirements.Count,
            ActiveProjectsCount = client.Projects.Count,
            CreatedAtUtc = client.CreatedAtUtc
        });
    }

    [HttpGet("clients/{id}")]
    public async Task<IActionResult> GetClientProfile(Guid id)
    {
        var client = await _context.ClientProfiles
            .Include(c => c.User)
            .Include(c => c.Requirements)
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (client == null) return NotFound(new { message = "Client profile not found." });

        var subClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        bool isOwnerOrAdmin = false;
        if (!string.IsNullOrWhiteSpace(subClaim) && Guid.TryParse(subClaim, out var authUserId))
        {
            isOwnerOrAdmin = (client.UserId == authUserId || User.IsInRole("Admin"));
        }

        return Ok(new TNest.Application.DTOs.ClientProfileDto
        {
            Id = client.Id,
            UserId = client.UserId,
            ContactName = client.ContactName ?? client.User?.FullName,
            CompanyName = client.CompanyName,
            AvatarUrl = client.AvatarUrl,
            WebsiteUrl = client.WebsiteUrl,
            Industry = client.Industry,
            Bio = client.Bio,
            BusinessDescription = client.BusinessDescription,
            ClientType = client.ClientType ?? "Business",
            City = client.City,
            State = client.State,
            Gender = isOwnerOrAdmin ? client.Gender : null,
            DateOfBirth = isOwnerOrAdmin ? client.DateOfBirth : null,
            LinkedinUrl = client.LinkedinUrl,
            InstagramUrl = client.InstagramUrl,
            YoutubeUrl = client.YoutubeUrl,
            OtherUrl = client.OtherUrl,
            Email = isOwnerOrAdmin ? client.User?.Email : null,
            PhoneNumber = isOwnerOrAdmin ? client.User?.PhoneNumber : null,
            PostedRequirementsCount = client.Requirements.Count,
            ActiveProjectsCount = client.Projects.Count,
            CreatedAtUtc = client.CreatedAtUtc
        });
    }

    [HttpGet("clients/by-user/{userId}")]
    public async Task<IActionResult> GetClientProfileByUserId(Guid userId)
    {
        var client = await _context.ClientProfiles
            .Include(c => c.User)
            .Include(c => c.Requirements)
            .Include(c => c.Projects)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (client == null) return NotFound(new { message = "Client profile not found." });

        var subClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        bool isOwnerOrAdmin = false;
        if (!string.IsNullOrWhiteSpace(subClaim) && Guid.TryParse(subClaim, out var authUserId))
        {
            isOwnerOrAdmin = (client.UserId == authUserId || User.IsInRole("Admin"));
        }

        return Ok(new TNest.Application.DTOs.ClientProfileDto
        {
            Id = client.Id,
            UserId = client.UserId,
            ContactName = client.ContactName ?? client.User?.FullName,
            CompanyName = client.CompanyName,
            AvatarUrl = client.AvatarUrl,
            WebsiteUrl = client.WebsiteUrl,
            Industry = client.Industry,
            Bio = client.Bio,
            BusinessDescription = client.BusinessDescription,
            ClientType = client.ClientType ?? "Business",
            City = client.City,
            State = client.State,
            Gender = isOwnerOrAdmin ? client.Gender : null,
            DateOfBirth = isOwnerOrAdmin ? client.DateOfBirth : null,
            LinkedinUrl = client.LinkedinUrl,
            InstagramUrl = client.InstagramUrl,
            YoutubeUrl = client.YoutubeUrl,
            OtherUrl = client.OtherUrl,
            Email = isOwnerOrAdmin ? client.User?.Email : null,
            PhoneNumber = isOwnerOrAdmin ? client.User?.PhoneNumber : null,
            PostedRequirementsCount = client.Requirements.Count,
            ActiveProjectsCount = client.Projects.Count,
            CreatedAtUtc = client.CreatedAtUtc
        });
    }

    [HttpGet("clients/{id}/public")]
    public async Task<IActionResult> GetClientPublicProfile(Guid id)
    {
        var client = await _context.ClientProfiles
            .Include(c => c.Requirements.Where(r => r.Status == RequirementStatus.Open))
            .Include(c => c.Projects).ThenInclude(p => p.Review)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (client == null) return NotFound(new { message = "Public client profile not found." });

        var completedProjects = await _context.Projects
            .Include(p => p.ProfessionalProfile)
            .Include(p => p.Review)
            .Where(p => p.ClientProfileId == id && p.Status == ProjectStatus.Completed)
            .ToListAsync();

        var reviews = completedProjects
            .Where(p => p.Review != null)
            .Select(p => new TNest.Application.DTOs.ClientReviewDto
            {
                Id = p.Review!.Id,
                ProjectId = p.Id,
                ProjectTitle = p.Title,
                DoerName = p.ProfessionalProfile?.DisplayName ?? "Verified Specialist",
                DoerAvatar = p.ProfessionalProfile?.AvatarUrl,
                OverallRating = p.Review.OverallRating,
                Comment = p.Review.Comment,
                CreatedAtUtc = p.Review.CreatedAtUtc
            }).ToList();

        decimal? averageRating = reviews.Count > 0 ? Math.Round(reviews.Average(r => (decimal)r.OverallRating), 1) : null;

        var publicProfile = new TNest.Application.DTOs.PublicClientProfileDto
        {
            Id = client.Id,
            ContactName = client.ContactName,
            CompanyName = client.CompanyName,
            AvatarUrl = client.AvatarUrl,
            WebsiteUrl = client.WebsiteUrl,
            Industry = client.Industry,
            Bio = client.Bio,
            BusinessDescription = client.BusinessDescription,
            ClientType = client.ClientType ?? "Business",
            City = client.City,
            State = client.State,
            LinkedinUrl = client.LinkedinUrl,
            InstagramUrl = client.InstagramUrl,
            YoutubeUrl = client.YoutubeUrl,
            OtherUrl = client.OtherUrl,
            Rating = averageRating,
            ReviewsCount = reviews.Count,
            CompletedProjectsCount = completedProjects.Count,
            PostedRequirementsCount = client.Requirements.Count,
            CreatedAtUtc = client.CreatedAtUtc,
            ActiveOpportunities = client.Requirements.Select(r => new TNest.Application.DTOs.ClientPublicOpportunityDto
            {
                Id = r.Id,
                Title = r.Title,
                Description = r.Description,
                BudgetMin = r.BudgetMin,
                BudgetMax = r.BudgetMax,
                Currency = r.Currency,
                ExpectedDeliveryDays = r.ExpectedDeliveryDays,
                Status = r.Status.ToString(),
                CreatedAtUtc = r.CreatedAtUtc
            }).ToList(),
            Reviews = reviews
        };

        return Ok(publicProfile);
    }

    [HttpPut("clients/me")]
    public async Task<IActionResult> UpdateMyClientProfile([FromBody] TNest.Application.DTOs.UpdateClientProfileDto req)
    {
        var subClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(subClaim) || !Guid.TryParse(subClaim, out var authUserId))
        {
            return Unauthorized(new { message = "Authentication required." });
        }

        var client = await _context.ClientProfiles.Include(c => c.User).FirstOrDefaultAsync(c => c.UserId == authUserId);
        if (client == null)
        {
            client = new ClientProfile { Id = Guid.NewGuid(), UserId = authUserId };
            _context.ClientProfiles.Add(client);
        }

        return await ApplyClientProfileUpdates(client, req);
    }

    [HttpPut("clients/{id}")]
    public async Task<IActionResult> UpdateClientProfile(Guid id, [FromBody] TNest.Application.DTOs.UpdateClientProfileDto req)
    {
        var client = await _context.ClientProfiles.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
        if (client == null) return NotFound(new { message = "Client profile not found." });

        // Security / IDOR Protection: Verify caller is owner or admin
        var subClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
        if (!string.IsNullOrWhiteSpace(subClaim) && Guid.TryParse(subClaim, out var authUserId))
        {
            if (client.UserId != authUserId && !User.IsInRole("Admin"))
            {
                return StatusCode(StatusCodes.Status403Forbidden, new { message = "You can only update your own client profile." });
            }
        }

        return await ApplyClientProfileUpdates(client, req);
    }

    private async Task<IActionResult> ApplyClientProfileUpdates(ClientProfile client, TNest.Application.DTOs.UpdateClientProfileDto req)
    {
        // Validate URL formats if supplied
        if (!string.IsNullOrWhiteSpace(req.WebsiteUrl) && !Uri.IsWellFormedUriString(req.WebsiteUrl, UriKind.Absolute) && !req.WebsiteUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            req.WebsiteUrl = "https://" + req.WebsiteUrl.TrimStart('/');
        }
        if (!string.IsNullOrWhiteSpace(req.LinkedinUrl) && !Uri.IsWellFormedUriString(req.LinkedinUrl, UriKind.Absolute) && !req.LinkedinUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
        {
            req.LinkedinUrl = "https://" + req.LinkedinUrl.TrimStart('/');
        }

        if (!string.IsNullOrWhiteSpace(req.ContactName)) client.ContactName = req.ContactName;
        client.CompanyName = req.CompanyName;
        if (!string.IsNullOrWhiteSpace(req.AvatarUrl)) client.AvatarUrl = req.AvatarUrl;
        client.WebsiteUrl = req.WebsiteUrl;
        client.Industry = req.Industry;
        client.Bio = req.Bio;
        client.BusinessDescription = req.BusinessDescription;
        
        var validClientTypes = new[] { "Individual", "Business", "Startup", "Agency", "Creator", "Other" };
        if (!string.IsNullOrWhiteSpace(req.ClientType) && validClientTypes.Contains(req.ClientType, StringComparer.OrdinalIgnoreCase))
        {
            client.ClientType = req.ClientType;
        }

        client.City = req.City;
        client.State = req.State;
        client.Gender = req.Gender;
        client.DateOfBirth = req.DateOfBirth;
        client.LinkedinUrl = req.LinkedinUrl;
        client.InstagramUrl = req.InstagramUrl;
        client.YoutubeUrl = req.YoutubeUrl;
        client.OtherUrl = req.OtherUrl;

        if (client.User != null)
        {
            if (!string.IsNullOrWhiteSpace(req.ContactName)) client.User.FullName = req.ContactName;
            if (!string.IsNullOrWhiteSpace(req.PhoneNumber)) client.User.PhoneNumber = req.PhoneNumber;
            client.User.UpdatedAtUtc = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return Ok(client);
    }
}

