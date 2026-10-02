using System.Security.Claims;
using TNest.Domain.Entities;
using TNest.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace TNest.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportsController(AppDbContext context)
    {
        _context = context;
    }

    public record CreateReportRequest(
        string TargetType, // User, Opportunity, Portfolio, Review, Message
        string TargetId,
        string? TargetTitle,
        string ReasonCategory,
        string Details,
        string? Priority = "Medium",
        string? ReporterEmail = null,
        string? ReporterName = null
    );

    [HttpPost]
    public async Task<IActionResult> CreateReport([FromBody] CreateReportRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.TargetType) || string.IsNullOrWhiteSpace(request.TargetId) || string.IsNullOrWhiteSpace(request.ReasonCategory))
        {
            return BadRequest(new { message = "TargetType, TargetId, and ReasonCategory are required." });
        }

        Guid? reporterUserId = null;
        string? reporterEmail = request.ReporterEmail;
        string? reporterName = request.ReporterName;

        if (User.Identity?.IsAuthenticated == true)
        {
            var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (Guid.TryParse(idClaim, out var uid))
            {
                reporterUserId = uid;
                var user = await _context.Users.FindAsync(uid);
                if (user != null)
                {
                    reporterEmail = user.Email;
                    reporterName = user.FullName;
                }
            }
        }

        var report = new Report
        {
            Id = Guid.NewGuid(),
            ReporterUserId = reporterUserId,
            ReporterEmail = reporterEmail ?? "anonymous@tnest.com",
            ReporterName = reporterName ?? "Anonymous Reporter",
            TargetType = request.TargetType,
            TargetId = request.TargetId,
            TargetTitle = request.TargetTitle ?? $"{request.TargetType} #{request.TargetId.Substring(0, Math.Min(8, request.TargetId.Length))}",
            ReasonCategory = request.ReasonCategory,
            Details = request.Details ?? string.Empty,
            Priority = request.Priority ?? "Medium",
            Status = ReportStatus.New,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Reports.Add(report);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Report submitted successfully. Our Trust & Safety team will review it.", reportId = report.Id });
    }
}
