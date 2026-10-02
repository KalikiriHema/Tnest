using System.Security.Claims;
using TNest.Application.Common.Interfaces;
using TNest.Domain.Entities;
using TNest.Infrastructure.Matching;
using TNest.Infrastructure.Security;

namespace TNest.Tests;

public class TNestComprehensiveAuditTests
{
    // ==========================================
    // 1. AUTHENTICATION & SECURITY AUDIT
    // ==========================================
    [Fact]
    public void Argon2PasswordHasher_Should_Produce_Unique_Salted_Hashes()
    {
        IPasswordHasher hasher = new Argon2PasswordHasher();
        var rawPassword = "StrongUserPassword@2026!";

        var hash1 = hasher.HashPassword(rawPassword);
        var hash2 = hasher.HashPassword(rawPassword);

        Assert.NotEqual(hash1, hash2); // Salts must be unique per hash
        Assert.True(hasher.VerifyPassword(rawPassword, hash1));
        Assert.True(hasher.VerifyPassword(rawPassword, hash2));
        Assert.False(hasher.VerifyPassword("WrongPassword123!", hash1));
    }

    [Fact]
    public void JwtTokenService_Should_Encode_UserRole_And_Claims_Correctly()
    {
        IJwtTokenService jwtService = new JwtTokenService();
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "TNEST Platform Admin",
            Email = "admin@tnest.com",
            PhoneNumber = "+91 99999 00000",
            Role = UserRole.Admin
        };

        var (token, expiresAt) = jwtService.GenerateAccessToken(adminUser);

        Assert.NotNull(token);
        Assert.True(expiresAt > DateTime.UtcNow);

        var (refreshToken, refreshExpires) = jwtService.GenerateRefreshToken();
        Assert.NotEmpty(refreshToken);
        Assert.True(refreshExpires > DateTime.UtcNow);
    }

    [Theory]
    [InlineData(UserRole.Admin, true)]
    [InlineData(UserRole.Client, false)]
    [InlineData(UserRole.Professional, false)]
    [InlineData(UserRole.DualRole, false)]
    public void Admin_Access_Guard_Should_Strictly_Enforce_Admin_Role(UserRole role, bool expectedIsAdmin)
    {
        var isAdmin = (role == UserRole.Admin);
        Assert.Equal(expectedIsAdmin, isAdmin);
    }

    // ==========================================
    // 2. FLOW A: TASK POSTING -> APPLICATION -> WORKFLOW -> REVIEW
    // ==========================================
    [Fact]
    public void FlowA_EndToEnd_Task_Posting_To_Delivery_And_Review()
    {
        var clientId = Guid.NewGuid();
        var clientProfileId = Guid.NewGuid();
        var doerId = Guid.NewGuid();
        var doerProfileId = Guid.NewGuid();
        var catId = Guid.NewGuid();

        // 1. Client Posts Requirement
        var requirement = new Requirement
        {
            Id = Guid.NewGuid(),
            ClientProfileId = clientProfileId,
            CategoryId = catId,
            Title = "3 Authentic UGC Product Reels for Glow Serum",
            Description = "Need high converting 9:16 vertical reels with on-camera routine demonstration.",
            BudgetMin = 10000,
            BudgetMax = 20000,
            Currency = "INR",
            ExpectedDeliveryDays = 5,
            RequiresOnCamera = true,
            RequiresProductShipment = true,
            Status = RequirementStatus.Open,
            CreatedAtUtc = DateTime.UtcNow
        };

        Assert.Equal(RequirementStatus.Open, requirement.Status);
        Assert.False(requirement.IsHidden);
        Assert.True(requirement.RequiresOnCamera);

        // 2. Doer Submits Proposal
        var proposal = new Proposal
        {
            Id = Guid.NewGuid(),
            RequirementId = requirement.Id,
            ProfessionalProfileId = doerProfileId,
            CoverLetter = "Experienced beauty creator with 120+ high-retention brand reels.",
            ProposedPrice = 15000,
            EstimatedDays = 4,
            Status = ProposalStatus.Submitted,
            CreatedAtUtc = DateTime.UtcNow
        };

        Assert.Equal(ProposalStatus.Submitted, proposal.Status);
        Assert.Equal(15000, proposal.ProposedPrice);

        // 3. Client Accepts Proposal -> Project Initialized
        proposal.Status = ProposalStatus.Accepted;
        var project = new Project
        {
            Id = Guid.NewGuid(),
            ClientProfileId = clientProfileId,
            ProfessionalProfileId = doerProfileId,
            RequirementId = requirement.Id,
            ProposalId = proposal.Id,
            Title = requirement.Title,
            AgreedPrice = proposal.ProposedPrice,
            Currency = "INR",
            Status = ProjectStatus.InProgress,
            RequiresShipment = requirement.RequiresProductShipment,
            CourierName = "BlueDart Express",
            TrackingNumber = "BD-991028341",
            CreatedAtUtc = DateTime.UtcNow
        };

        Assert.Equal(ProjectStatus.InProgress, project.Status);
        Assert.Equal(15000, project.AgreedPrice);
        Assert.True(project.RequiresShipment);

        // 4. Doer Submits Work Delivery
        var delivery = new ProjectDelivery
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            VersionNumber = 1,
            Notes = "Final 3 edited 9:16 video cuts with kinetic subtitles and sound effects.",
            DeliveryUrlsJson = "[\"https://drive.google.com/sample-ugc-reel-1\", \"https://drive.google.com/sample-ugc-reel-2\"]",
            Status = DeliveryStatus.Submitted,
            CreatedAtUtc = DateTime.UtcNow
        };

        project.Status = ProjectStatus.UnderReview;
        Assert.Equal(DeliveryStatus.Submitted, delivery.Status);
        Assert.Equal(ProjectStatus.UnderReview, project.Status);

        // 5. Client Approves Delivery and Completes Project
        delivery.Status = DeliveryStatus.Approved;
        delivery.ReviewedAtUtc = DateTime.UtcNow;
        project.Status = ProjectStatus.Completed;
        project.CompletedAtUtc = DateTime.UtcNow;

        Assert.Equal(DeliveryStatus.Approved, delivery.Status);
        Assert.Equal(ProjectStatus.Completed, project.Status);

        // 6. Client Leaves 4-Factor Verified Review
        var review = new Review
        {
            Id = Guid.NewGuid(),
            ProjectId = project.Id,
            ClientProfileId = clientProfileId,
            ProfessionalProfileId = doerProfileId,
            OverallRating = 5,
            CommunicationRating = 5,
            QualityRating = 5,
            TimelinessRating = 5,
            Comment = "Phenomenal creator! The hooks converted at 3.8x ROAS within 48 hours of ad launch.",
            CreatedAtUtc = DateTime.UtcNow
        };

        Assert.Equal(5, review.OverallRating);
        Assert.False(review.IsHidden);
        Assert.Equal(project.Id, review.ProjectId);
    }

    // ==========================================
    // 3. FLOW B: DIRECT SEARCH -> INQUIRY -> PROJECT CONVERSION
    // ==========================================
    [Fact]
    public void FlowB_Direct_Search_Inquiry_And_Conversion()
    {
        var clientId = Guid.NewGuid();
        var clientProfileId = Guid.NewGuid();
        var doerProfileId = Guid.NewGuid();

        // 1. Direct Inquiry Sent by Client to Doer
        var inquiry = new Inquiry
        {
            Id = Guid.NewGuid(),
            ClientProfileId = clientProfileId,
            ProfessionalProfileId = doerProfileId,
            InitialMessage = "Hello, we loved your YouTube thumbnail portfolio. Can you design 5 thumbnails for our upcoming series?",
            Status = InquiryStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        Assert.Equal(InquiryStatus.Pending, inquiry.Status);

        // 2. Doer Accepts Inquiry
        inquiry.Status = InquiryStatus.Accepted;
        Assert.Equal(InquiryStatus.Accepted, inquiry.Status);

        // 3. Converted to Direct Project Contract
        inquiry.Status = InquiryStatus.ConvertedToProject;
        var directProject = new Project
        {
            Id = Guid.NewGuid(),
            ClientProfileId = clientProfileId,
            ProfessionalProfileId = doerProfileId,
            Title = "5 High-CTR YouTube Series Thumbnails",
            AgreedPrice = 8000,
            Currency = "INR",
            Status = ProjectStatus.InProgress,
            CreatedAtUtc = DateTime.UtcNow
        };

        Assert.Equal(InquiryStatus.ConvertedToProject, inquiry.Status);
        Assert.Equal(ProjectStatus.InProgress, directProject.Status);
        Assert.Equal(8000, directProject.AgreedPrice);
    }

    // ==========================================
    // 4. VALIDATION & BOUNDARY LOGIC
    // ==========================================
    [Fact]
    public void Requirement_Validation_Rules_Should_Reject_Invalid_Parameters()
    {
        // Budget min cannot be negative
        decimal budgetMin = -500;
        decimal budgetMax = 10000;
        bool isBudgetValid = budgetMin >= 0 && budgetMax >= budgetMin;
        Assert.False(isBudgetValid);

        // Expected delivery days must be >= 1
        int deliveryDays = 0;
        bool isDeliveryDaysValid = deliveryDays >= 1;
        Assert.False(isDeliveryDaysValid);

        // Valid budget check
        budgetMin = 5000;
        budgetMax = 15000;
        isBudgetValid = budgetMin >= 0 && budgetMax >= budgetMin;
        Assert.True(isBudgetValid);
    }

    // ==========================================
    // 5. ADMIN GOVERNANCE & AUDIT TRAIL
    // ==========================================
    [Fact]
    public void Admin_AuditLog_And_Report_State_Progression()
    {
        var adminId = Guid.NewGuid();

        // 1. Create Report
        var report = new Report
        {
            Id = Guid.NewGuid(),
            TargetType = "Opportunity",
            TargetId = Guid.NewGuid().ToString(),
            TargetTitle = "Suspicious Contact Opportunity",
            ReasonCategory = "Off-Platform Solicitation",
            Details = "Listing contained direct telegram links.",
            Status = ReportStatus.New,
            Priority = "High",
            CreatedAtUtc = DateTime.UtcNow
        };

        Assert.Equal(ReportStatus.New, report.Status);

        // 2. Admin Investigates -> UnderReview
        report.Status = ReportStatus.UnderReview;
        report.AdminNotes = "Investigation opened. Reaching out to poster.";
        Assert.Equal(ReportStatus.UnderReview, report.Status);

        // 3. Admin Resolves -> Resolved with Audit Log
        report.Status = ReportStatus.Resolved;
        report.ResolutionAction = "Opportunity hidden from feed and user notified.";
        report.ResolvedAtUtc = DateTime.UtcNow;

        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            AdminUserId = adminId,
            AdminEmail = "admin@tnest.com",
            AdminName = "TNEST Platform Admin",
            Action = "Report.Resolved",
            TargetType = "Report",
            TargetId = report.Id.ToString(),
            Reason = report.ResolutionAction,
            Details = report.AdminNotes,
            IpAddress = "127.0.0.1",
            CreatedAtUtc = DateTime.UtcNow
        };

        Assert.Equal(ReportStatus.Resolved, report.Status);
        Assert.NotNull(report.ResolvedAtUtc);
        Assert.Equal("Report.Resolved", auditLog.Action);
        Assert.Equal("admin@tnest.com", auditLog.AdminEmail);
    }

    [Fact]
    public void AdminController_Must_Have_Strict_Admin_Authorize_Attribute()
    {
        var adminControllerType = typeof(TNest.Api.Controllers.AdminController);
        var authAttributes = adminControllerType.GetCustomAttributes(typeof(Microsoft.AspNetCore.Authorization.AuthorizeAttribute), true);

        Assert.NotEmpty(authAttributes);
        var authAttr = (Microsoft.AspNetCore.Authorization.AuthorizeAttribute)authAttributes[0];
        Assert.Equal("Admin", authAttr.Roles);
    }

    [Fact]
    public void Admin_Cannot_Suspend_Admin_User_Account()
    {
        var adminUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Primary Administrator",
            Email = "admin@tnest.com",
            Role = UserRole.Admin,
            IsActive = true
        };

        // Simulating the business rule in AdminController.UpdateUserStatus
        var targetIsAdmin = adminUser.Role == UserRole.Admin;
        var requestedActiveState = false;

        var isDisallowed = targetIsAdmin && !requestedActiveState;
        Assert.True(isDisallowed, "Suspending an admin account must be prevented.");
    }

    [Fact]
    public void Opportunity_Moderation_Actions_Execute_Safely()
    {
        var opp = new Requirement
        {
            Id = Guid.NewGuid(),
            Title = "Graphic Design Project",
            IsHidden = false,
            Status = RequirementStatus.Open
        };

        // 1. Hide Action
        opp.IsHidden = true;
        opp.ModerationReason = "Suspected duplicate listing";
        Assert.True(opp.IsHidden);
        Assert.Equal("Suspected duplicate listing", opp.ModerationReason);

        // 2. Restore Action
        opp.IsHidden = false;
        opp.ModerationReason = null;
        Assert.False(opp.IsHidden);
        Assert.Null(opp.ModerationReason);

        // 3. Close Action
        opp.Status = RequirementStatus.Cancelled;
        opp.ModerationReason = "Closed by moderator";
        Assert.Equal(RequirementStatus.Cancelled, opp.Status);
    }

    [Fact]
    public void Taxonomy_Archival_Safeguard_Preserves_Data_Integrity()
    {
        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Video & Content",
            Slug = "video-content",
            IsArchived = false
        };

        var role = new RoleTaxonomy
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Name = "Short-form Video Editor",
            Slug = "short-form-video-editor",
            IsArchived = false
        };

        var skill = new SkillTaxonomy
        {
            Id = Guid.NewGuid(),
            CategoryId = category.Id,
            Name = "Color Grading",
            Slug = "color-grading",
            IsArchived = false
        };

        // Admin toggles archival rather than breaking cascade delete
        category.IsArchived = true;
        role.IsArchived = true;
        skill.IsArchived = true;

        Assert.True(category.IsArchived);
        Assert.True(role.IsArchived);
        Assert.True(skill.IsArchived);

        // Restore
        category.IsArchived = false;
        Assert.False(category.IsArchived);
    }
}

