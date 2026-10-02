using System.Security.Claims;
using System.Text.Json;
using TNest.Application.Common.Interfaces;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    private (Guid? UserId, string Email, string Name) GetCurrentAdmin()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = User.FindFirstValue(ClaimTypes.Email) ?? "admin@tnest.com";
        var name = User.FindFirstValue(ClaimTypes.Name) ?? "System Admin";
        Guid.TryParse(idClaim, out var userId);
        return (userId != Guid.Empty ? userId : null, email, name);
    }

    private async Task LogAuditAsync(string action, string targetType, string targetId, string reason, string? details = null)
    {
        var (adminId, adminEmail, adminName) = GetCurrentAdmin();
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";

        var log = new AuditLog
        {
            Id = Guid.NewGuid(),
            AdminUserId = adminId,
            AdminEmail = adminEmail,
            AdminName = adminName,
            Action = action,
            TargetType = targetType,
            TargetId = targetId,
            Reason = reason,
            Details = details,
            IpAddress = ip,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.AuditLogs.Add(log);
        await _context.SaveChangesAsync();
    }

    // ==========================================
    // 1. DASHBOARD METRICS
    // ==========================================
    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboardMetrics()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalClients = await _context.Users.CountAsync(u => u.Role == UserRole.Client || u.Role == UserRole.DualRole);
        var totalDoers = await _context.Users.CountAsync(u => u.Role == UserRole.Professional || u.Role == UserRole.DualRole);
        var suspendedUsers = await _context.Users.CountAsync(u => !u.IsActive);

        var totalOpportunities = await _context.Requirements.CountAsync();
        var openOpportunities = await _context.Requirements.CountAsync(r => r.Status == RequirementStatus.Open && !r.IsHidden);
        var hiddenOpportunities = await _context.Requirements.CountAsync(r => r.IsHidden);

        var totalProjects = await _context.Projects.CountAsync();
        var activeProjects = await _context.Projects.CountAsync(p => p.Status == ProjectStatus.InProgress || p.Status == ProjectStatus.UnderReview);
        var completedProjects = await _context.Projects.CountAsync(p => p.Status == ProjectStatus.Completed);

        var pendingApplications = await _context.Proposals.CountAsync(p => p.Status == ProposalStatus.Submitted || p.Status == ProposalStatus.Shortlisted);
        var totalApplications = await _context.Proposals.CountAsync();

        var totalReports = await _context.Reports.CountAsync();
        var pendingReports = await _context.Reports.CountAsync(r => r.Status == ReportStatus.New || r.Status == ReportStatus.UnderReview);
        var resolvedReports = await _context.Reports.CountAsync(r => r.Status == ReportStatus.Resolved);

        var hiddenPortfolios = await _context.PortfolioItems.CountAsync(p => p.IsHidden);
        var hiddenReviews = await _context.Reviews.CountAsync(r => r.IsHidden);
        var pendingModeration = pendingReports + hiddenOpportunities + hiddenPortfolios + hiddenReviews;

        var recentAuditLogs = await _context.AuditLogs
            .OrderByDescending(a => a.CreatedAtUtc)
            .Take(6)
            .Select(a => new
            {
                a.Id,
                a.AdminName,
                a.AdminEmail,
                a.Action,
                a.TargetType,
                a.TargetId,
                a.Reason,
                a.CreatedAtUtc
            })
            .ToListAsync();

        var recentReports = await _context.Reports
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(5)
            .Select(r => new
            {
                r.Id,
                r.TargetType,
                r.TargetTitle,
                r.ReasonCategory,
                Status = r.Status.ToString(),
                r.Priority,
                r.ReporterName,
                r.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(new
        {
            summary = new
            {
                totalUsers,
                totalClients,
                totalDoers,
                suspendedUsers,
                totalOpportunities,
                openOpportunities,
                hiddenOpportunities,
                totalProjects,
                activeProjects,
                completedProjects,
                pendingApplications,
                totalApplications,
                pendingReports,
                resolvedReports,
                totalReports,
                pendingModeration
            },
            recentActivity = recentAuditLogs,
            recentReports
        });
    }

    // ==========================================
    // 2. USERS MANAGEMENT
    // ==========================================
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Users
            .Include(u => u.ClientProfile)
            .Include(u => u.ProfessionalProfile)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower().Trim();
            query = query.Where(u => u.FullName.ToLower().Contains(s) || u.Email.ToLower().Contains(s) || u.PhoneNumber.Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(role) && role != "all")
        {
            if (Enum.TryParse<UserRole>(role, true, out var r))
            {
                query = query.Where(u => u.Role == r);
            }
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            if (status.Equals("active", StringComparison.OrdinalIgnoreCase))
                query = query.Where(u => u.IsActive);
            else if (status.Equals("suspended", StringComparison.OrdinalIgnoreCase))
                query = query.Where(u => !u.IsActive);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                u.PhoneNumber,
                Role = u.Role.ToString(),
                u.IsActive,
                u.SuspensionReason,
                u.IsEmailVerified,
                u.IsPhoneVerified,
                u.CreatedAtUtc,
                AvatarUrl = u.ProfessionalProfile != null ? u.ProfessionalProfile.AvatarUrl : (u.ClientProfile != null ? u.ClientProfile.AvatarUrl : null),
                CompanyName = u.ClientProfile != null ? u.ClientProfile.CompanyName : null,
                Headline = u.ProfessionalProfile != null ? u.ProfessionalProfile.Headline : null,
                Rating = u.ProfessionalProfile != null ? u.ProfessionalProfile.AverageRating : 0,
                CompletedProjects = u.ProfessionalProfile != null ? u.ProfessionalProfile.CompletedProjectsCount : 0
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("users/{id:guid}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _context.Users
            .Include(u => u.ClientProfile)
            .Include(u => u.ProfessionalProfile)
                .ThenInclude(p => p!.ProfessionalRoles)
                    .ThenInclude(r => r.RoleTaxonomy)
            .Include(u => u.ProfessionalProfile)
                .ThenInclude(p => p!.ProfessionalSkills)
                    .ThenInclude(s => s.SkillTaxonomy)
            .Include(u => u.ProfessionalProfile)
                .ThenInclude(p => p!.PortfolioItems)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound(new { message = "User not found." });

        var requirementsCount = user.ClientProfile != null
            ? await _context.Requirements.CountAsync(r => r.ClientProfileId == user.ClientProfile.Id)
            : 0;

        var proposalsCount = user.ProfessionalProfile != null
            ? await _context.Proposals.CountAsync(p => p.ProfessionalProfileId == user.ProfessionalProfile.Id)
            : 0;

        var projectsCount = user.ProfessionalProfile != null
            ? await _context.Projects.CountAsync(p => p.ProfessionalProfileId == user.ProfessionalProfile.Id)
            : (user.ClientProfile != null ? await _context.Projects.CountAsync(p => p.ClientProfileId == user.ClientProfile.Id) : 0);

        var reportsCount = await _context.Reports.CountAsync(r => r.TargetType == "User" && r.TargetId == user.Id.ToString());

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            Role = user.Role.ToString(),
            user.IsActive,
            user.SuspensionReason,
            user.IsEmailVerified,
            user.IsPhoneVerified,
            user.CreatedAtUtc,
            clientProfile = user.ClientProfile,
            professionalProfile = user.ProfessionalProfile != null ? new
            {
                user.ProfessionalProfile.Id,
                user.ProfessionalProfile.DisplayName,
                user.ProfessionalProfile.Headline,
                user.ProfessionalProfile.Bio,
                user.ProfessionalProfile.AvatarUrl,
                user.ProfessionalProfile.BannerUrl,
                user.ProfessionalProfile.ExperienceLevel,
                user.ProfessionalProfile.YearsOfExperience,
                AvailabilityStatus = user.ProfessionalProfile.AvailabilityStatus.ToString(),
                user.ProfessionalProfile.HourlyRate,
                user.ProfessionalProfile.Currency,
                user.ProfessionalProfile.TurnaroundDays,
                user.ProfessionalProfile.Languages,
                user.ProfessionalProfile.AppearsOnCamera,
                user.ProfessionalProfile.AverageRating,
                user.ProfessionalProfile.CompletedProjectsCount,
                user.ProfessionalProfile.IsVerified,
                Roles = user.ProfessionalProfile.ProfessionalRoles.Select(r => r.RoleTaxonomy.Name),
                Skills = user.ProfessionalProfile.ProfessionalSkills.Select(s => s.SkillTaxonomy.Name),
                Portfolio = user.ProfessionalProfile.PortfolioItems
            } : null,
            stats = new
            {
                requirementsCount,
                proposalsCount,
                projectsCount,
                reportsCount
            }
        });
    }

    public record UserStatusRequest(bool IsActive, string Reason);

    [HttpPost("users/{id:guid}/status")]
    public async Task<IActionResult> UpdateUserStatus(Guid id, [FromBody] UserStatusRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        if (user == null) return NotFound(new { message = "User not found." });

        if (user.Role == UserRole.Admin && !request.IsActive)
        {
            return BadRequest(new { message = "Cannot suspend an Admin user account." });
        }

        user.IsActive = request.IsActive;
        user.SuspensionReason = request.IsActive ? null : (request.Reason ?? "Suspended by Administrator");

        await _context.SaveChangesAsync();

        var action = request.IsActive ? "User.Reactivate" : "User.Suspend";
        await LogAuditAsync(action, "User", user.Id.ToString(), request.Reason ?? "Account status toggle", $"User {user.Email} is now {(user.IsActive ? "Active" : "Suspended")}.");

        return Ok(new { message = $"User successfully {(user.IsActive ? "reactivated" : "suspended")}.", user.IsActive, user.SuspensionReason });
    }

    // ==========================================
    // 3. OPPORTUNITIES MANAGEMENT
    // ==========================================
    [HttpGet("opportunities")]
    public async Task<IActionResult> GetOpportunities(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? status,
        [FromQuery] bool? isHidden,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Requirements
            .Include(r => r.Category)
            .Include(r => r.ClientProfile)
                .ThenInclude(cp => cp.User)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower().Trim();
            query = query.Where(r => r.Title.ToLower().Contains(s) || r.Description.ToLower().Contains(s));
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            query = query.Where(r => r.Category.Slug == category || r.Category.Name == category);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            if (Enum.TryParse<RequirementStatus>(status, true, out var st))
            {
                query = query.Where(r => r.Status == st);
            }
        }

        if (isHidden.HasValue)
        {
            query = query.Where(r => r.IsHidden == isHidden.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                r.Title,
                r.Description,
                Category = r.Category.Name,
                CategorySlug = r.Category.Slug,
                ClientName = r.ClientProfile.CompanyName ?? r.ClientProfile.ContactName,
                ClientEmail = r.ClientProfile.User.Email,
                r.BudgetMin,
                r.BudgetMax,
                r.Currency,
                r.ExpectedDeliveryDays,
                r.RequiresOnCamera,
                r.RequiresProductShipment,
                r.IsHidden,
                r.ModerationReason,
                Status = r.Status.ToString(),
                r.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("opportunities/{id:guid}")]
    public async Task<IActionResult> GetOpportunityById(Guid id)
    {
        var opp = await _context.Requirements
            .Include(r => r.Category)
            .Include(r => r.ClientProfile)
                .ThenInclude(cp => cp.User)
            .Include(r => r.Proposals)
                .ThenInclude(p => p.ProfessionalProfile)
                    .ThenInclude(pp => pp.User)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (opp == null) return NotFound(new { message = "Opportunity not found." });

        var reports = await _context.Reports
            .Where(r => r.TargetType == "Opportunity" && r.TargetId == id.ToString())
            .OrderByDescending(r => r.CreatedAtUtc)
            .ToListAsync();

        var auditHistory = await _context.AuditLogs
            .Where(a => a.TargetType == "Opportunity" && a.TargetId == id.ToString())
            .OrderByDescending(a => a.CreatedAtUtc)
            .ToListAsync();

        return Ok(new
        {
            opp.Id,
            opp.Title,
            opp.Description,
            Category = opp.Category.Name,
            CategorySlug = opp.Category.Slug,
            Client = new
            {
                opp.ClientProfile.Id,
                Name = opp.ClientProfile.CompanyName ?? opp.ClientProfile.ContactName,
                Email = opp.ClientProfile.User.Email,
                Phone = opp.ClientProfile.User.PhoneNumber,
                opp.ClientProfile.AvatarUrl
            },
            opp.BudgetMin,
            opp.BudgetMax,
            opp.Currency,
            opp.ExpectedDeliveryDays,
            opp.RequiredLanguages,
            opp.RequiresOnCamera,
            opp.RequiresProductShipment,
            opp.DynamicAttributesJson,
            opp.IsPublicListing,
            opp.IsHidden,
            opp.ModerationReason,
            Status = opp.Status.ToString(),
            opp.CreatedAtUtc,
            opp.UpdatedAtUtc,
            ApplicationsCount = opp.Proposals.Count,
            Applications = opp.Proposals.Select(p => new
            {
                p.Id,
                ApplicantName = p.ProfessionalProfile.DisplayName,
                ApplicantEmail = p.ProfessionalProfile.User.Email,
                p.ProposedPrice,
                p.EstimatedDays,
                p.CoverLetter,
                Status = p.Status.ToString(),
                p.CreatedAtUtc
            }),
            Reports = reports,
            AuditHistory = auditHistory
        });
    }

    public record OpportunityModerateRequest(string Action, string Reason);

    [HttpPost("opportunities/{id:guid}/moderate")]
    public async Task<IActionResult> ModerateOpportunity(Guid id, [FromBody] OpportunityModerateRequest request)
    {
        var req = await _context.Requirements
            .Include(r => r.Category)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (req == null) return NotFound(new { message = "Opportunity not found." });

        var action = request.Action.ToLower().Trim();
        if (action == "hide")
        {
            req.IsHidden = true;
            req.ModerationReason = request.Reason ?? "Hidden by moderator review.";
        }
        else if (action == "restore")
        {
            req.IsHidden = false;
            req.ModerationReason = null;
        }
        else if (action == "close")
        {
            req.Status = RequirementStatus.Cancelled;
            req.ModerationReason = request.Reason ?? "Closed by moderation.";
        }
        else if (action == "remove")
        {
            _context.Requirements.Remove(req);
            await _context.SaveChangesAsync();
            await LogAuditAsync("Opportunity.Remove", "Opportunity", id.ToString(), request.Reason ?? "Deleted violating listing", $"Title: {req.Title}");
            return Ok(new { message = "Opportunity permanently removed." });
        }
        else
        {
            return BadRequest(new { message = "Invalid moderation action. Valid actions: hide, restore, close, remove." });
        }

        await _context.SaveChangesAsync();
        await LogAuditAsync($"Opportunity.{char.ToUpper(action[0]) + action.Substring(1)}", "Opportunity", id.ToString(), request.Reason ?? "Moderation action", $"Title: {req.Title}");

        return Ok(new { message = $"Opportunity successfully updated with action: {action}.", isHidden = req.IsHidden, status = req.Status.ToString() });
    }

    // ==========================================
    // 4. APPLICATIONS & PROJECTS OVERVIEW
    // ==========================================
    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.Proposals
            .Include(p => p.Requirement)
            .Include(p => p.ProfessionalProfile)
                .ThenInclude(pp => pp.User)
            .AsNoTracking();

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                RequirementTitle = p.Requirement.Title,
                RequirementId = p.RequirementId,
                ApplicantName = p.ProfessionalProfile.DisplayName,
                ApplicantEmail = p.ProfessionalProfile.User.Email,
                p.ProposedPrice,
                Currency = "INR",
                p.EstimatedDays,
                p.CoverLetter,
                Status = p.Status.ToString(),
                p.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpGet("projects")]
    public async Task<IActionResult> GetProjects([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.Projects
            .Include(p => p.ClientProfile)
                .ThenInclude(cp => cp.User)
            .Include(p => p.ProfessionalProfile)
                .ThenInclude(pp => pp.User)
            .Include(p => p.Requirement)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            if (Enum.TryParse<ProjectStatus>(status, true, out var st))
            {
                query = query.Where(p => p.Status == st);
            }
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                Title = p.Requirement != null ? p.Requirement.Title : "Custom Contract Project",
                ClientName = p.ClientProfile.CompanyName ?? p.ClientProfile.ContactName,
                ClientEmail = p.ClientProfile.User.Email,
                DoerName = p.ProfessionalProfile.DisplayName,
                DoerEmail = p.ProfessionalProfile.User.Email,
                p.AgreedPrice,
                p.Currency,
                Status = p.Status.ToString(),
                p.CreatedAtUtc,
                p.CompletedAtUtc
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // ==========================================
    // 5. REPORTS & MODERATION
    // ==========================================
    [HttpGet("reports")]
    public async Task<IActionResult> GetReports(
        [FromQuery] string? status,
        [FromQuery] string? targetType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _context.Reports.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            if (Enum.TryParse<ReportStatus>(status, true, out var st))
            {
                query = query.Where(r => r.Status == st);
            }
        }

        if (!string.IsNullOrWhiteSpace(targetType) && targetType != "all")
        {
            query = query.Where(r => r.TargetType.ToLower() == targetType.ToLower());
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    public record ReportStatusUpdateRequest(
        string Status,
        string? AdminNotes = null,
        string? ResolutionAction = null
    );

    [HttpPost("reports/{id:guid}/status")]
    public async Task<IActionResult> UpdateReportStatus(Guid id, [FromBody] ReportStatusUpdateRequest request)
    {
        var report = await _context.Reports.FirstOrDefaultAsync(r => r.Id == id);
        if (report == null) return NotFound(new { message = "Report not found." });

        if (!Enum.TryParse<ReportStatus>(request.Status, true, out var newStatus))
        {
            return BadRequest(new { message = "Invalid report status. Valid statuses: New, UnderReview, Resolved, Dismissed." });
        }

        var (_, adminEmail, adminName) = GetCurrentAdmin();

        report.Status = newStatus;
        report.AdminNotes = request.AdminNotes ?? report.AdminNotes;
        report.ResolutionAction = request.ResolutionAction ?? report.ResolutionAction;
        report.AssignedAdminEmail = adminEmail;

        if (newStatus == ReportStatus.Resolved || newStatus == ReportStatus.Dismissed)
        {
            report.ResolvedAtUtc = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();

        await LogAuditAsync(
            $"Report.{newStatus}",
            "Report",
            report.Id.ToString(),
            request.ResolutionAction ?? $"Report marked as {newStatus}",
            $"Target: {report.TargetType} ({report.TargetId}). Notes: {report.AdminNotes}"
        );

        return Ok(new { message = $"Report status updated to {newStatus}.", report });
    }

    // ==========================================
    // 6. PORTFOLIOS & REVIEWS MODERATION
    // ==========================================
    [HttpGet("portfolios")]
    public async Task<IActionResult> GetPortfolios([FromQuery] bool? isHidden, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.PortfolioItems
            .Include(p => p.ProfessionalProfile)
                .ThenInclude(pp => pp.User)
            .AsNoTracking()
            .AsQueryable();

        if (isHidden.HasValue)
        {
            query = query.Where(p => p.IsHidden == isHidden.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(p => p.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new
            {
                p.Id,
                p.Title,
                p.Description,
                p.CategorySlug,
                p.RolePerformed,
                p.ToolsUsed,
                p.ThumbnailUrl,
                p.MediaUrl,
                p.MediaType,
                p.LiveUrl,
                p.IsHidden,
                p.ModerationReason,
                CreatorName = p.ProfessionalProfile.DisplayName,
                CreatorEmail = p.ProfessionalProfile.User.Email,
                p.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    public record ContentModerateRequest(string Action, string Reason);

    [HttpPost("portfolios/{id:guid}/moderate")]
    public async Task<IActionResult> ModeratePortfolio(Guid id, [FromBody] ContentModerateRequest request)
    {
        var item = await _context.PortfolioItems.FirstOrDefaultAsync(p => p.Id == id);
        if (item == null) return NotFound(new { message = "Portfolio item not found." });

        var action = request.Action.ToLower().Trim();
        if (action == "hide")
        {
            item.IsHidden = true;
            item.ModerationReason = request.Reason ?? "Content hidden by moderation review.";
        }
        else if (action == "restore")
        {
            item.IsHidden = false;
            item.ModerationReason = null;
        }
        else if (action == "remove")
        {
            _context.PortfolioItems.Remove(item);
            await _context.SaveChangesAsync();
            await LogAuditAsync("Portfolio.Remove", "Portfolio", id.ToString(), request.Reason ?? "Removed violating portfolio piece", item.Title);
            return Ok(new { message = "Portfolio item permanently removed." });
        }

        await _context.SaveChangesAsync();
        await LogAuditAsync($"Portfolio.{char.ToUpper(action[0]) + action.Substring(1)}", "Portfolio", id.ToString(), request.Reason ?? "Moderation action", item.Title);

        return Ok(new { message = $"Portfolio item {action}d successfully.", isHidden = item.IsHidden });
    }

    [HttpGet("reviews")]
    public async Task<IActionResult> GetReviews([FromQuery] bool? isHidden, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var query = _context.Reviews
            .Include(r => r.ClientProfile)
                .ThenInclude(cp => cp.User)
            .Include(r => r.ProfessionalProfile)
                .ThenInclude(pp => pp.User)
            .Include(r => r.Project)
            .AsNoTracking()
            .AsQueryable();

        if (isHidden.HasValue)
        {
            query = query.Where(r => r.IsHidden == isHidden.Value);
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(r => r.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(r => new
            {
                r.Id,
                r.ProjectId,
                r.OverallRating,
                r.CommunicationRating,
                r.QualityRating,
                r.TimelinessRating,
                r.Comment,
                r.ProfessionalResponse,
                r.IsHidden,
                r.ModerationReason,
                ClientName = r.ClientProfile.CompanyName ?? r.ClientProfile.ContactName,
                ClientEmail = r.ClientProfile.User.Email,
                DoerName = r.ProfessionalProfile.DisplayName,
                DoerEmail = r.ProfessionalProfile.User.Email,
                r.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    [HttpPost("reviews/{id:guid}/moderate")]
    public async Task<IActionResult> ModerateReview(Guid id, [FromBody] ContentModerateRequest request)
    {
        var review = await _context.Reviews.FirstOrDefaultAsync(r => r.Id == id);
        if (review == null) return NotFound(new { message = "Review not found." });

        var action = request.Action.ToLower().Trim();
        if (action == "hide")
        {
            review.IsHidden = true;
            review.ModerationReason = request.Reason ?? "Review hidden for violating community guidelines.";
        }
        else if (action == "restore")
        {
            review.IsHidden = false;
            review.ModerationReason = null;
        }
        else if (action == "remove")
        {
            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();
            await LogAuditAsync("Review.Remove", "Review", id.ToString(), request.Reason ?? "Review deleted by admin");
            return Ok(new { message = "Review permanently removed." });
        }

        await _context.SaveChangesAsync();
        await LogAuditAsync($"Review.{char.ToUpper(action[0]) + action.Substring(1)}", "Review", id.ToString(), request.Reason ?? "Moderation action");

        return Ok(new { message = $"Review {action}d successfully.", isHidden = review.IsHidden });
    }

    // ==========================================
    // 7. TAXONOMY: CATEGORIES / ROLES / SKILLS
    // ==========================================
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories([FromQuery] bool includeArchived = true)
    {
        var query = _context.Categories
            .Include(c => c.Roles)
            .Include(c => c.Skills)
            .AsNoTracking();

        if (!includeArchived)
        {
            query = query.Where(c => !c.IsArchived);
        }

        var categories = await query
            .OrderBy(c => c.Name)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.Slug,
                c.Description,
                c.Icon,
                c.IsArchived,
                c.DynamicSchemaJson,
                RolesCount = c.Roles.Count(r => !r.IsArchived),
                SkillsCount = c.Skills.Count(s => !s.IsArchived),
                Roles = c.Roles.Select(r => new { r.Id, r.Name, r.Slug, r.Description, r.IsArchived }),
                Skills = c.Skills.Select(s => new { s.Id, s.Name, s.Slug, s.IsArchived })
            })
            .ToListAsync();

        return Ok(categories);
    }

    public record CategorySaveRequest(string Name, string Slug, string Description, string Icon, string? DynamicSchemaJson = "[]");

    [HttpPost("categories")]
    public async Task<IActionResult> CreateCategory([FromBody] CategorySaveRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Name) || string.IsNullOrWhiteSpace(req.Slug))
        {
            return BadRequest(new { message = "Category name and slug are required." });
        }

        var exists = await _context.Categories.AnyAsync(c => c.Slug == req.Slug.ToLower());
        if (exists) return Conflict(new { message = "Category with this slug already exists." });

        var cat = new Category
        {
            Id = Guid.NewGuid(),
            Name = req.Name.Trim(),
            Slug = req.Slug.Trim().ToLower(),
            Description = req.Description ?? string.Empty,
            Icon = req.Icon ?? "Folder",
            DynamicSchemaJson = req.DynamicSchemaJson ?? "[]",
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Categories.Add(cat);
        await _context.SaveChangesAsync();
        await LogAuditAsync("Category.Create", "Category", cat.Id.ToString(), "New marketplace taxonomy category", cat.Name);

        return Ok(cat);
    }

    [HttpPut("categories/{id:guid}")]
    public async Task<IActionResult> UpdateCategory(Guid id, [FromBody] CategorySaveRequest req)
    {
        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return NotFound(new { message = "Category not found." });

        cat.Name = req.Name.Trim();
        cat.Description = req.Description ?? string.Empty;
        cat.Icon = req.Icon ?? cat.Icon;
        if (!string.IsNullOrWhiteSpace(req.DynamicSchemaJson))
            cat.DynamicSchemaJson = req.DynamicSchemaJson;

        await _context.SaveChangesAsync();
        await LogAuditAsync("Category.Update", "Category", cat.Id.ToString(), "Updated category metadata", cat.Name);

        return Ok(cat);
    }

    [HttpDelete("categories/{id:guid}")]
    public async Task<IActionResult> ToggleArchiveCategory(Guid id)
    {
        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (cat == null) return NotFound(new { message = "Category not found." });

        cat.IsArchived = !cat.IsArchived;
        await _context.SaveChangesAsync();
        await LogAuditAsync(cat.IsArchived ? "Category.Archive" : "Category.Unarchive", "Category", cat.Id.ToString(), "Archive status toggle", cat.Name);

        return Ok(new { message = $"Category is now {(cat.IsArchived ? "Archived" : "Active")}.", isArchived = cat.IsArchived });
    }

    // Role Taxonomy CRUD
    [HttpGet("roles")]
    public async Task<IActionResult> GetRoles([FromQuery] Guid? categoryId)
    {
        var query = _context.RoleTaxonomies.Include(r => r.Category).AsNoTracking().AsQueryable();
        if (categoryId.HasValue) query = query.Where(r => r.CategoryId == categoryId.Value);

        var roles = await query.OrderBy(r => r.Name).ToListAsync();
        return Ok(roles);
    }

    public record RoleSaveRequest(Guid CategoryId, string Name, string Slug, string? Description = null);

    [HttpPost("roles")]
    public async Task<IActionResult> CreateRole([FromBody] RoleSaveRequest req)
    {
        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == req.CategoryId);
        if (cat == null) return BadRequest(new { message = "Invalid category ID." });

        var role = new RoleTaxonomy
        {
            Id = Guid.NewGuid(),
            CategoryId = req.CategoryId,
            Name = req.Name.Trim(),
            Slug = req.Slug.Trim().ToLower(),
            Description = req.Description ?? string.Empty
        };

        _context.RoleTaxonomies.Add(role);
        await _context.SaveChangesAsync();
        await LogAuditAsync("Role.Create", "RoleTaxonomy", role.Id.ToString(), "Created taxonomy role", $"{role.Name} in {cat.Name}");

        return Ok(role);
    }

    [HttpPut("roles/{id:guid}")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] RoleSaveRequest req)
    {
        var role = await _context.RoleTaxonomies.FirstOrDefaultAsync(r => r.Id == id);
        if (role == null) return NotFound(new { message = "Role not found." });

        role.Name = req.Name.Trim();
        role.Description = req.Description ?? string.Empty;
        if (req.CategoryId != Guid.Empty) role.CategoryId = req.CategoryId;

        await _context.SaveChangesAsync();
        await LogAuditAsync("Role.Update", "RoleTaxonomy", role.Id.ToString(), "Updated taxonomy role", role.Name);

        return Ok(role);
    }

    [HttpDelete("roles/{id:guid}")]
    public async Task<IActionResult> ToggleArchiveRole(Guid id)
    {
        var role = await _context.RoleTaxonomies.FirstOrDefaultAsync(r => r.Id == id);
        if (role == null) return NotFound(new { message = "Role not found." });

        role.IsArchived = !role.IsArchived;
        await _context.SaveChangesAsync();
        await LogAuditAsync(role.IsArchived ? "Role.Archive" : "Role.Unarchive", "RoleTaxonomy", role.Id.ToString(), "Archive status toggle", role.Name);

        return Ok(new { message = $"Role is now {(role.IsArchived ? "Archived" : "Active")}.", isArchived = role.IsArchived });
    }

    // Skill Taxonomy CRUD
    [HttpGet("skills")]
    public async Task<IActionResult> GetSkills([FromQuery] Guid? categoryId)
    {
        var query = _context.SkillTaxonomies.Include(s => s.Category).AsNoTracking().AsQueryable();
        if (categoryId.HasValue) query = query.Where(s => s.CategoryId == categoryId.Value);

        var skills = await query.OrderBy(s => s.Name).ToListAsync();
        return Ok(skills);
    }

    public record SkillSaveRequest(Guid CategoryId, string Name, string Slug);

    [HttpPost("skills")]
    public async Task<IActionResult> CreateSkill([FromBody] SkillSaveRequest req)
    {
        var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == req.CategoryId);
        if (cat == null) return BadRequest(new { message = "Invalid category ID." });

        var skill = new SkillTaxonomy
        {
            Id = Guid.NewGuid(),
            CategoryId = req.CategoryId,
            Name = req.Name.Trim(),
            Slug = req.Slug.Trim().ToLower()
        };

        _context.SkillTaxonomies.Add(skill);
        await _context.SaveChangesAsync();
        await LogAuditAsync("Skill.Create", "SkillTaxonomy", skill.Id.ToString(), "Created taxonomy skill", $"{skill.Name} in {cat.Name}");

        return Ok(skill);
    }

    [HttpPut("skills/{id:guid}")]
    public async Task<IActionResult> UpdateSkill(Guid id, [FromBody] SkillSaveRequest req)
    {
        var skill = await _context.SkillTaxonomies.FirstOrDefaultAsync(s => s.Id == id);
        if (skill == null) return NotFound(new { message = "Skill not found." });

        skill.Name = req.Name.Trim();
        if (req.CategoryId != Guid.Empty) skill.CategoryId = req.CategoryId;

        await _context.SaveChangesAsync();
        await LogAuditAsync("Skill.Update", "SkillTaxonomy", skill.Id.ToString(), "Updated taxonomy skill", skill.Name);

        return Ok(skill);
    }

    [HttpDelete("skills/{id:guid}")]
    public async Task<IActionResult> ToggleArchiveSkill(Guid id)
    {
        var skill = await _context.SkillTaxonomies.FirstOrDefaultAsync(s => s.Id == id);
        if (skill == null) return NotFound(new { message = "Skill not found." });

        skill.IsArchived = !skill.IsArchived;
        await _context.SaveChangesAsync();
        await LogAuditAsync(skill.IsArchived ? "Skill.Archive" : "Skill.Unarchive", "SkillTaxonomy", skill.Id.ToString(), "Archive status toggle", skill.Name);

        return Ok(new { message = $"Skill is now {(skill.IsArchived ? "Archived" : "Active")}.", isArchived = skill.IsArchived });
    }

    // ==========================================
    // 8. AUDIT LOGS
    // ==========================================
    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs(
        [FromQuery] string? search,
        [FromQuery] string? action,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30)
    {
        var query = _context.AuditLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower().Trim();
            query = query.Where(a => a.AdminEmail.ToLower().Contains(s) || 
                                     a.AdminName.ToLower().Contains(s) || 
                                     a.Action.ToLower().Contains(s) || 
                                     a.Reason.ToLower().Contains(s) || 
                                     (a.Details != null && a.Details.ToLower().Contains(s)));
        }

        if (!string.IsNullOrWhiteSpace(action) && action != "all")
        {
            query = query.Where(a => a.Action.StartsWith(action));
        }

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // ==========================================
    // 9. SYSTEM SETTINGS
    // ==========================================
    [HttpGet("settings")]
    public async Task<IActionResult> GetSettings()
    {
        var settings = await _context.SystemSettings.AsNoTracking().OrderBy(s => s.Group).ThenBy(s => s.Key).ToListAsync();
        return Ok(settings);
    }

    public record SettingUpdateRequest(string Key, string Value, string? Reason = null);

    [HttpPost("settings")]
    public async Task<IActionResult> UpdateSetting([FromBody] SettingUpdateRequest req)
    {
        var setting = await _context.SystemSettings.FirstOrDefaultAsync(s => s.Key == req.Key);
        if (setting == null)
        {
            setting = new SystemSetting
            {
                Id = Guid.NewGuid(),
                Key = req.Key,
                Value = req.Value,
                Description = "Custom Setting",
                Group = "Custom",
                UpdatedAtUtc = DateTime.UtcNow
            };
            _context.SystemSettings.Add(setting);
        }
        else
        {
            var oldValue = setting.Value;
            setting.Value = req.Value;
            setting.UpdatedAtUtc = DateTime.UtcNow;
            await LogAuditAsync("Settings.Update", "SystemSetting", req.Key, req.Reason ?? "Updated platform configuration", $"Changed from '{oldValue}' to '{req.Value}'");
        }

        await _context.SaveChangesAsync();
        return Ok(setting);
    }

    // ==========================================
    // 10. ADMINISTRATIVE NOTIFICATIONS & ALERTS
    // ==========================================
    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        var newReports = await _context.Reports
            .Where(r => r.Status == ReportStatus.New)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(10)
            .Select(r => new
            {
                Id = r.Id.ToString(),
                Type = "Report",
                Title = $"New Report: {r.ReasonCategory} ({r.TargetType})",
                Description = r.Details,
                Priority = r.Priority,
                Timestamp = r.CreatedAtUtc,
                TargetType = r.TargetType,
                TargetId = r.TargetId
            })
            .ToListAsync();

        var hiddenItems = await _context.Requirements
            .Where(r => r.IsHidden)
            .OrderByDescending(r => r.CreatedAtUtc)
            .Take(5)
            .Select(r => new
            {
                Id = r.Id.ToString(),
                Type = "OpportunityHidden",
                Title = $"Hidden Opportunity: {r.Title}",
                Description = r.ModerationReason ?? "Listing hidden by moderator review.",
                Priority = "Medium",
                Timestamp = r.CreatedAtUtc,
                TargetType = "Opportunity",
                TargetId = r.Id.ToString()
            })
            .ToListAsync();

        var suspendedUsers = await _context.Users
            .Where(u => !u.IsActive && u.Role != UserRole.Admin)
            .OrderByDescending(u => u.CreatedAtUtc)
            .Take(5)
            .Select(u => new
            {
                Id = u.Id.ToString(),
                Type = "UserSuspended",
                Title = $"Suspended User: {u.FullName} ({u.Email})",
                Description = u.SuspensionReason ?? "User account suspended.",
                Priority = "Medium",
                Timestamp = u.CreatedAtUtc,
                TargetType = "User",
                TargetId = u.Id.ToString()
            })
            .ToListAsync();

        var allAlerts = newReports.Concat(hiddenItems).Concat(suspendedUsers)
            .OrderByDescending(a => a.Timestamp)
            .ToList();

        return Ok(allAlerts);
    }
}

