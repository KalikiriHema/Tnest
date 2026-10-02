using System.Text.Json;
using TNest.Application.Common.Interfaces;
using TNest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace TNest.Infrastructure.Data;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<ClientProfile> ClientProfiles => Set<ClientProfile>();
    public DbSet<ProfessionalProfile> ProfessionalProfiles => Set<ProfessionalProfile>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<RoleTaxonomy> RoleTaxonomies => Set<RoleTaxonomy>();
    public DbSet<SkillTaxonomy> SkillTaxonomies => Set<SkillTaxonomy>();
    public DbSet<ProfessionalRole> ProfessionalRoles => Set<ProfessionalRole>();
    public DbSet<ProfessionalSkill> ProfessionalSkills => Set<ProfessionalSkill>();
    public DbSet<PortfolioItem> PortfolioItems => Set<PortfolioItem>();
    public DbSet<Requirement> Requirements => Set<Requirement>();
    public DbSet<Proposal> Proposals => Set<Proposal>();
    public DbSet<Inquiry> Inquiries => Set<Inquiry>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<ChatMessage> ChatMessages => Set<ChatMessage>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectDelivery> ProjectDeliveries => Set<ProjectDelivery>();
    public DbSet<Review> Reviews => Set<Review>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    public DbSet<SystemSetting> SystemSettings => Set<SystemSetting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure string list value converter for SQLite and Postgres compatibility
        var stringListComparer = new ValueComparer<List<string>>(
            (c1, c2) => c1 != null && c2 != null ? c1.SequenceEqual(c2) : c1 == c2,
            c => c.Aggregate(0, (a, v) => HashCode.Combine(a, v.GetHashCode())),
            c => c.ToList());

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.PhoneNumber);
            entity.Property(u => u.Role).HasConversion<string>();
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(r => r.UserId);
            entity.HasIndex(r => r.Token).IsUnique();
        });

        modelBuilder.Entity<ClientProfile>(entity =>
        {
            entity.HasIndex(c => c.UserId).IsUnique();
        });

        modelBuilder.Entity<ProfessionalProfile>(entity =>
        {
            entity.HasIndex(p => p.UserId).IsUnique();
            entity.HasIndex(p => p.Slug).IsUnique();
            entity.HasIndex(p => p.HourlyRate);
            entity.HasIndex(p => p.AvailabilityStatus);
            entity.HasIndex(p => p.AppearsOnCamera);
            entity.HasIndex(p => p.AcceptsProductShipments);

            entity.Property(p => p.Languages)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .Metadata.SetValueComparer(stringListComparer);

            entity.Property(p => p.PreferredRoles)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .Metadata.SetValueComparer(stringListComparer);

            entity.Property(p => p.OpportunityTypes)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .Metadata.SetValueComparer(stringListComparer);

            entity.Property(p => p.AvailabilityStatus).HasConversion<string>();
        });

        modelBuilder.Entity<ProfessionalRole>(entity =>
        {
            entity.HasIndex(pr => pr.ProfessionalProfileId);
            entity.HasIndex(pr => pr.RoleTaxonomyId);
        });

        modelBuilder.Entity<ProfessionalSkill>(entity =>
        {
            entity.HasIndex(ps => ps.ProfessionalProfileId);
            entity.HasIndex(ps => ps.SkillTaxonomyId);
        });

        modelBuilder.Entity<PortfolioItem>(entity =>
        {
            entity.HasIndex(pi => pi.ProfessionalProfileId);
            entity.Property(p => p.ToolsUsed)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .Metadata.SetValueComparer(stringListComparer);
        });

        modelBuilder.Entity<Requirement>(entity =>
        {
            entity.HasIndex(r => r.ClientProfileId);
            entity.HasIndex(r => r.CategoryId);
            entity.HasIndex(r => r.Status);
            entity.HasIndex(r => r.CreatedAtUtc);

            entity.Property(r => r.RequiredLanguages)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
                    v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions?)null) ?? new List<string>())
                .Metadata.SetValueComparer(stringListComparer);

            entity.Property(r => r.Status).HasConversion<string>();
        });

        modelBuilder.Entity<Proposal>(entity =>
        {
            entity.HasIndex(p => new { p.RequirementId, p.ProfessionalProfileId }).IsUnique();
            entity.HasIndex(p => p.RequirementId);
            entity.HasIndex(p => p.ProfessionalProfileId);
            entity.HasIndex(p => p.Status);
            entity.HasIndex(p => p.CreatedAtUtc);
            entity.Property(p => p.Status).HasConversion<string>();
        });

        modelBuilder.Entity<Inquiry>(entity =>
        {
            entity.HasIndex(i => i.ClientProfileId);
            entity.HasIndex(i => i.ProfessionalProfileId);
            entity.Property(i => i.Status).HasConversion<string>();
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasIndex(c => c.ClientProfileId);
            entity.HasIndex(c => c.ProfessionalProfileId);
            entity.HasIndex(c => c.RequirementId);
            entity.HasIndex(c => c.ProjectId);
            entity.HasIndex(c => c.LastMessageAtUtc);
        });

        modelBuilder.Entity<ChatMessage>(entity =>
        {
            entity.HasIndex(m => m.ConversationId);
            entity.HasIndex(m => m.SenderUserId);
            entity.HasIndex(m => m.CreatedAtUtc);
            entity.Property(m => m.SenderRole).HasConversion<string>();
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasIndex(p => p.ClientProfileId);
            entity.HasIndex(p => p.ProfessionalProfileId);
            entity.HasIndex(p => p.RequirementId);
            entity.HasIndex(p => p.ProposalId);
            entity.HasIndex(p => p.Status);
            entity.HasIndex(p => p.CreatedAtUtc);
            entity.Property(p => p.Status).HasConversion<string>();
        });

        modelBuilder.Entity<ProjectDelivery>(entity =>
        {
            entity.HasIndex(d => d.ProjectId);
            entity.HasIndex(d => d.Status);
            entity.Property(d => d.Status).HasConversion<string>();
        });

        modelBuilder.Entity<Review>(entity =>
        {
            entity.HasIndex(r => r.ProjectId).IsUnique();
            entity.HasIndex(r => r.ProfessionalProfileId);
            entity.HasIndex(r => r.ClientProfileId);
        });

        modelBuilder.Entity<Report>(entity =>
        {
            entity.Property(r => r.Status).HasConversion<string>();
            entity.HasIndex(r => r.Status);
            entity.HasIndex(r => new { r.TargetType, r.TargetId });
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasIndex(a => a.CreatedAtUtc);
            entity.HasIndex(a => a.Action);
            entity.HasIndex(a => a.AdminUserId);
        });

        modelBuilder.Entity<SystemSetting>(entity =>
        {
            entity.HasIndex(s => s.Key).IsUnique();
        });

        // Seed initial categories & dynamic schemas
        SeedTaxonomy(modelBuilder);
    }

    private static void SeedTaxonomy(ModelBuilder modelBuilder)
    {
        var ugcCatId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var videoEditCatId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var thumbnailCatId = Guid.Parse("33333333-3333-3333-3333-333333333333");
        var scriptCatId = Guid.Parse("44444444-4444-4444-4444-444444444444");

        modelBuilder.Entity<Category>().HasData(
            new Category
            {
                Id = ugcCatId,
                Name = "UGC Video Creation",
                Slug = "ugc-creators",
                Description = "High-converting authentic user-generated content, unboxings, hooks, and product demos.",
                Icon = "Sparkles",
                DynamicSchemaJson = @"[
                    {""fieldId"": ""product_type"", ""label"": ""Product Type / Niche"", ""type"": ""select"", ""options"": [""Skincare & Beauty"", ""Tech & Gadgets"", ""App/SaaS Demo"", ""Fitness & Nutrition"", ""Fashion & Apparel""], ""required"": true},
                    {""fieldId"": ""video_format"", ""label"": ""Content Format"", ""type"": ""select"", ""options"": [""Direct-to-Camera Testimonial"", ""Unboxing & First Impression"", ""Aesthetic Routine / Vlog"", ""Problem-Agitate-Solve Hook Reel""], ""required"": true},
                    {""fieldId"": ""aspect_ratio"", ""label"": ""Aspect Ratio"", ""type"": ""select"", ""options"": [""9:16 (Reels/TikTok/Shorts)"", ""16:9 (Landscape)"", ""1:1 (Square)""], ""required"": true},
                    {""fieldId"": ""shipping_needed"", ""label"": ""Requires Physical Product Shipment?"", ""type"": ""boolean"", ""required"": true},
                    {""fieldId"": ""raw_footage"", ""label"": ""Include Raw B-Roll / Uncut Takes?"", ""type"": ""boolean"", ""required"": false}
                ]"
            },
            new Category
            {
                Id = videoEditCatId,
                Name = "Video Editing & Post-Production",
                Slug = "video-editors",
                Description = "Engaging YouTube long-form, fast-paced Shorts, color grading, sound design, and motion graphics.",
                Icon = "Film",
                DynamicSchemaJson = @"[
                    {""fieldId"": ""editing_style"", ""label"": ""Editing Style / Pacing"", ""type"": ""select"", ""options"": [""Ali Abdaal / Clean Documentary"", ""MrBeast / High-Retention Fast Pace"", ""Iman Gadzhi / Dark Cinematic"", ""Alex Hormozi / Kinetic Captions""], ""required"": true},
                    {""fieldId"": ""preferred_tool"", ""label"": ""Preferred Editing Software"", ""type"": ""select"", ""options"": [""Adobe Premiere Pro"", ""DaVinci Resolve"", ""Final Cut Pro"", ""CapCut Pro""], ""required"": false},
                    {""fieldId"": ""raw_duration_minutes"", ""label"": ""Raw Footage Duration (Approx. Minutes)"", ""type"": ""number"", ""required"": true},
                    {""fieldId"": ""subtitles_needed"", ""label"": ""Animated Dynamic Captions Included?"", ""type"": ""boolean"", ""required"": true}
                ]"
            },
            new Category
            {
                Id = thumbnailCatId,
                Name = "Thumbnails & Cover Art",
                Slug = "thumbnail-designers",
                Description = "High-CTR YouTube thumbnails, podcast covers, and social hero banners designed to maximize clicks.",
                Icon = "Image",
                DynamicSchemaJson = @"[
                    {""fieldId"": ""primary_subject"", ""label"": ""Primary Focal Element"", ""type"": ""select"", ""options"": [""Face with Expression + Graphic"", ""Product Showcase"", ""Minimalist Typography"", ""Illustrated/3D Composition""], ""required"": true},
                    {""fieldId"": ""source_files_needed"", ""label"": ""Include Layered PSD / Figma Files?"", ""type"": ""boolean"", ""required"": true}
                ]"
            },
            new Category
            {
                Id = scriptCatId,
                Name = "Creative Scriptwriting & Hooks",
                Slug = "scriptwriters",
                Description = "Viral hook formulas, YouTube video outlines, ad copy, and storytelling scripts.",
                Icon = "Feather",
                DynamicSchemaJson = @"[
                    {""fieldId"": ""target_word_count"", ""label"": ""Target Word Count / Duration"", ""type"": ""select"", ""options"": [""60s Hook Script (150 words)"", ""3-5 Min Explainer (600 words)"", ""8-12 Min YouTube Deep Dive (1500+ words)""], ""required"": true},
                    {""fieldId"": ""tone_of_voice"", ""label"": ""Tone of Voice"", ""type"": ""select"", ""options"": [""Energetic & Punchy"", ""Authoritative & Educative"", ""Humorous & Satirical"", ""Emotional Storytelling""], ""required"": true}
                ]"
            }
        );
    }
}
