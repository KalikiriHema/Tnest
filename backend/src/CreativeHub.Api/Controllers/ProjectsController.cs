using System.Text.Json;
using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProjectsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProjectById(Guid id)
    {
        var project = await _context.Projects
            .Include(p => p.ClientProfile).ThenInclude(cp => cp.User)
            .Include(p => p.ProfessionalProfile).ThenInclude(pp => pp.User)
            .Include(p => p.Deliveries.OrderBy(d => d.VersionNumber))
            .Include(p => p.Review)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound();

        return Ok(new
        {
            id = project.Id,
            title = project.Title,
            clientProfileId = project.ClientProfileId,
            clientName = project.ClientProfile.ContactName ?? project.ClientProfile.CompanyName,
            clientCompany = project.ClientProfile.CompanyName,
            professionalProfileId = project.ProfessionalProfileId,
            professionalName = project.ProfessionalProfile.DisplayName,
            agreedPrice = project.AgreedPrice,
            currency = project.Currency,
            deadlineUtc = project.DeadlineUtc,
            status = project.Status.ToString(),
            requiresShipment = project.RequiresShipment,
            courierName = project.CourierName,
            trackingNumber = project.TrackingNumber,
            productShippedAtUtc = project.ProductShippedAtUtc,
            productReceivedAtUtc = project.ProductReceivedAtUtc,
            createdAtUtc = project.CreatedAtUtc,
            completedAtUtc = project.CompletedAtUtc,
            deliveries = project.Deliveries.Select(d => new
            {
                id = d.Id,
                versionNumber = d.VersionNumber,
                notes = d.Notes,
                deliveryUrlsJson = d.DeliveryUrlsJson,
                status = d.Status.ToString(),
                revisionFeedback = d.RevisionFeedback,
                createdAtUtc = d.CreatedAtUtc,
                reviewedAtUtc = d.ReviewedAtUtc
            }),
            review = project.Review != null ? new
            {
                id = project.Review.Id,
                overallRating = project.Review.OverallRating,
                communicationRating = project.Review.CommunicationRating,
                qualityRating = project.Review.QualityRating,
                timelinessRating = project.Review.TimelinessRating,
                comment = project.Review.Comment,
                professionalResponse = project.Review.ProfessionalResponse,
                createdAtUtc = project.Review.CreatedAtUtc
            } : null
        });
    }

    public record ShipmentUpdateRequest(string CourierName, string TrackingNumber);

    [HttpPost("{id}/shipment")]
    public async Task<IActionResult> UpdateShipment(Guid id, [FromBody] ShipmentUpdateRequest req)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        project.CourierName = req.CourierName;
        project.TrackingNumber = req.TrackingNumber;
        project.ProductShippedAtUtc = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return Ok(new
        {
            id = project.Id,
            courierName = project.CourierName,
            trackingNumber = project.TrackingNumber,
            productShippedAtUtc = project.ProductShippedAtUtc
        });
    }

    [HttpPost("{id}/product-received")]
    public async Task<IActionResult> ConfirmProductReceived(Guid id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound();

        project.ProductReceivedAtUtc = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        return Ok(new
        {
            id = project.Id,
            productReceivedAtUtc = project.ProductReceivedAtUtc
        });
    }

    public record SubmitDeliveryRequest(string Notes, List<string> DeliveryUrls);

    [HttpPost("{id}/deliveries")]
    public async Task<IActionResult> SubmitDelivery(Guid id, [FromBody] SubmitDeliveryRequest req)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project == null) return NotFound(new { message = "Project not found." });

        var count = await _context.ProjectDeliveries.CountAsync(d => d.ProjectId == id);
        var versionNumber = count + 1;

        var delivery = new ProjectDelivery
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            VersionNumber = versionNumber,
            Notes = req.Notes,
            DeliveryUrlsJson = JsonSerializer.Serialize(req.DeliveryUrls ?? new List<string>()),
            Status = DeliveryStatus.Submitted,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.ProjectDeliveries.Add(delivery);
        project.Status = ProjectStatus.UnderReview;

        await _context.SaveChangesAsync();
        return Ok(new
        {
            id = delivery.Id,
            projectId = delivery.ProjectId,
            versionNumber = delivery.VersionNumber,
            notes = delivery.Notes,
            deliveryUrlsJson = delivery.DeliveryUrlsJson,
            status = delivery.Status.ToString(),
            createdAtUtc = delivery.CreatedAtUtc
        });
    }

    public record RevisionRequest(string Feedback);

    [HttpPost("{id}/deliveries/{deliveryId}/revision")]
    public async Task<IActionResult> RequestRevision(Guid id, Guid deliveryId, [FromBody] RevisionRequest req)
    {
        var delivery = await _context.ProjectDeliveries.FindAsync(deliveryId);
        if (delivery == null || delivery.ProjectId != id) return NotFound();

        delivery.Status = DeliveryStatus.RevisionRequested;
        delivery.RevisionFeedback = req.Feedback;
        delivery.ReviewedAtUtc = DateTime.UtcNow;

        var project = await _context.Projects.FindAsync(id);
        if (project != null) project.Status = ProjectStatus.InProgress;

        await _context.SaveChangesAsync();
        return Ok(new
        {
            id = delivery.Id,
            versionNumber = delivery.VersionNumber,
            status = delivery.Status.ToString(),
            revisionFeedback = delivery.RevisionFeedback,
            reviewedAtUtc = delivery.ReviewedAtUtc
        });
    }

    [HttpPost("{id}/deliveries/{deliveryId}/approve")]
    public async Task<IActionResult> ApproveDelivery(Guid id, Guid deliveryId)
    {
        var delivery = await _context.ProjectDeliveries.FindAsync(deliveryId);
        if (delivery == null || delivery.ProjectId != id) return NotFound();

        delivery.Status = DeliveryStatus.Approved;
        delivery.ReviewedAtUtc = DateTime.UtcNow;

        var project = await _context.Projects.FindAsync(id);
        if (project != null)
        {
            project.Status = ProjectStatus.Completed;
            project.CompletedAtUtc = DateTime.UtcNow;

            // Increment pro completed count
            var pro = await _context.ProfessionalProfiles.FindAsync(project.ProfessionalProfileId);
            if (pro != null)
            {
                pro.CompletedProjectsCount++;
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new
        {
            project = new
            {
                id = project?.Id,
                status = project?.Status.ToString(),
                completedAtUtc = project?.CompletedAtUtc
            },
            delivery = new
            {
                id = delivery.Id,
                versionNumber = delivery.VersionNumber,
                status = delivery.Status.ToString(),
                reviewedAtUtc = delivery.ReviewedAtUtc
            }
        });
    }

    public record SubmitReviewRequest(
        int OverallRating,
        int CommunicationRating,
        int QualityRating,
        int TimelinessRating,
        string Comment
    );

    [HttpPost("{id}/review")]
    public async Task<IActionResult> SubmitReview(Guid id, [FromBody] SubmitReviewRequest req)
    {
        var project = await _context.Projects
            .Include(p => p.ProfessionalProfile)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (project == null) return NotFound(new { message = "Project not found." });

        if (project.Status != ProjectStatus.Completed)
        {
            return BadRequest(new { message = "Reviews are strictly gated to completed projects." });
        }

        var existingReview = await _context.Reviews.AnyAsync(r => r.ProjectId == id);
        if (existingReview)
        {
            return BadRequest(new { message = "A review has already been submitted for this project." });
        }

        var review = new Review
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            ClientProfileId = project.ClientProfileId,
            ProfessionalProfileId = project.ProfessionalProfileId,
            OverallRating = Math.Clamp(req.OverallRating, 1, 5),
            CommunicationRating = Math.Clamp(req.CommunicationRating, 1, 5),
            QualityRating = Math.Clamp(req.QualityRating, 1, 5),
            TimelinessRating = Math.Clamp(req.TimelinessRating, 1, 5),
            Comment = req.Comment,
            CreatedAtUtc = DateTime.UtcNow
        };

        _context.Reviews.Add(review);

        // Recalculate average rating for pro
        var allReviews = await _context.Reviews
            .Where(r => r.ProfessionalProfileId == project.ProfessionalProfileId)
            .ToListAsync();

        var totalRating = allReviews.Sum(r => r.OverallRating) + review.OverallRating;
        project.ProfessionalProfile.AverageRating = Math.Round((decimal)totalRating / (allReviews.Count + 1), 2);

        await _context.SaveChangesAsync();
        return Ok(new
        {
            id = review.Id,
            projectId = review.ProjectId,
            overallRating = review.OverallRating,
            communicationRating = review.CommunicationRating,
            qualityRating = review.QualityRating,
            timelinessRating = review.TimelinessRating,
            comment = review.Comment,
            createdAtUtc = review.CreatedAtUtc,
            proAverageRating = project.ProfessionalProfile.AverageRating
        });
    }
}
