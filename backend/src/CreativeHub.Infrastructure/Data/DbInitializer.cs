using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace CreativeHub.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context, IPasswordHasher hasher)
    {
        await context.Database.EnsureCreatedAsync();

        if (await context.Users.AnyAsync())
        {
            return; // Already initialized
        }

        // 1. Create Roles and Skills for Categories
        var ugcCat = await context.Categories.FirstAsync(c => c.Slug == "ugc-creators");
        var videoCat = await context.Categories.FirstAsync(c => c.Slug == "video-editors");
        var thumbCat = await context.Categories.FirstAsync(c => c.Slug == "thumbnail-designers");
        var scriptCat = await context.Categories.FirstAsync(c => c.Slug == "scriptwriters");

        var ugcRole1 = new RoleTaxonomy { Id = Guid.NewGuid(), CategoryId = ugcCat.Id, Name = "On-Camera UGC Creator", Slug = "on-camera-ugc", Description = "Creates direct-to-camera engaging reels and reviews" };
        var ugcRole2 = new RoleTaxonomy { Id = Guid.NewGuid(), CategoryId = ugcCat.Id, Name = "Product Unboxing Specialist", Slug = "product-unboxing", Description = "Aesthetic product demos and tactile reviews" };
        
        var vidRole1 = new RoleTaxonomy { Id = Guid.NewGuid(), CategoryId = videoCat.Id, Name = "Short-Form Reel/TikTok Editor", Slug = "short-form-editor", Description = "Fast-paced kinetic captions and sound design" };
        var vidRole2 = new RoleTaxonomy { Id = Guid.NewGuid(), CategoryId = videoCat.Id, Name = "YouTube Long-Form Editor", Slug = "youtube-editor", Description = "Documentary storytelling and high-retention cuts" };

        var thumbRole1 = new RoleTaxonomy { Id = Guid.NewGuid(), CategoryId = thumbCat.Id, Name = "YouTube Thumbnail Artist", Slug = "youtube-thumbnail-artist", Description = "CTR-optimized high visual punch designs" };
        var scriptRole1 = new RoleTaxonomy { Id = Guid.NewGuid(), CategoryId = scriptCat.Id, Name = "Hook & Ad Copywriter", Slug = "hook-copywriter", Description = "High-converting direct response video scripts" };

        context.RoleTaxonomies.AddRange(ugcRole1, ugcRole2, vidRole1, vidRole2, thumbRole1, scriptRole1);

        // Skills
        var skillTelugu = new SkillTaxonomy { Id = Guid.NewGuid(), CategoryId = ugcCat.Id, Name = "Telugu & English Fluency", Slug = "telugu-english" };
        var skillHindi = new SkillTaxonomy { Id = Guid.NewGuid(), CategoryId = ugcCat.Id, Name = "Hindi & English Fluency", Slug = "hindi-english" };
        var skillSkincare = new SkillTaxonomy { Id = Guid.NewGuid(), CategoryId = ugcCat.Id, Name = "Skincare & Beauty Aesthetics", Slug = "skincare-beauty" };
        var skillPremiere = new SkillTaxonomy { Id = Guid.NewGuid(), CategoryId = videoCat.Id, Name = "Adobe Premiere Pro", Slug = "premiere-pro" };
        var skillResolve = new SkillTaxonomy { Id = Guid.NewGuid(), CategoryId = videoCat.Id, Name = "DaVinci Resolve Color Grading", Slug = "davinci-resolve" };
        var skillSound = new SkillTaxonomy { Id = Guid.NewGuid(), CategoryId = videoCat.Id, Name = "High-Impact Sound Design", Slug = "sound-design" };
        var skillPhotoshop = new SkillTaxonomy { Id = Guid.NewGuid(), CategoryId = thumbCat.Id, Name = "Photoshop Manipulation", Slug = "photoshop" };
        var skillStory = new SkillTaxonomy { Id = Guid.NewGuid(), CategoryId = scriptCat.Id, Name = "Story Arcs & Pacing", Slug = "story-arcs" };

        context.SkillTaxonomies.AddRange(skillTelugu, skillHindi, skillSkincare, skillPremiere, skillResolve, skillSound, skillPhotoshop, skillStory);
        await context.SaveChangesAsync();

        // 2. Create Demo Client User
        var clientPass = hasher.HashPassword("ClientPass123!");
        var clientUser = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Ananya Sharma",
            Email = "client@glowskin.com",
            PhoneNumber = "+91 98765 43210",
            PasswordHash = clientPass,
            Role = UserRole.Client,
            IsEmailVerified = true,
            IsPhoneVerified = true
        };

        var clientProfile = new ClientProfile
        {
            Id = Guid.NewGuid(),
            UserId = clientUser.Id,
            CompanyName = "GlowSkin Organics",
            ContactName = "Ananya Sharma",
            AvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
            Industry = "Direct-to-Consumer Beauty & Wellness",
            Bio = "Premium ayurvedic skincare brand crafting natural glow serums."
        };
        clientUser.ClientProfile = clientProfile;
        context.Users.Add(clientUser);

        // 3. Create Demo UGC Creator Pro (Telugu + English, On-Camera, Skincare)
        var pro1Pass = hasher.HashPassword("CreatorPass123!");
        var pro1User = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Priya Reddy",
            Email = "priya.ugc@creator.com",
            PhoneNumber = "+91 91234 56789",
            PasswordHash = pro1Pass,
            Role = UserRole.Professional,
            IsEmailVerified = true,
            IsPhoneVerified = true
        };

        var pro1Profile = new ProfessionalProfile
        {
            Id = Guid.NewGuid(),
            UserId = pro1User.Id,
            DisplayName = "Priya Reddy (UGC & Reels)",
            Slug = "priya-reddy",
            Headline = "Telugu & English On-Camera UGC Creator • 120+ High-Converting Brand Reels",
            Bio = "Specializing in skincare, beauty routines, and wellness unboxings. I turn raw products into irresistible 9:16 viral hooks with authentic delivery.",
            AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            BannerUrl = "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
            ExperienceLevel = "Senior",
            YearsOfExperience = 4,
            AvailabilityStatus = AvailabilityStatus.AvailableNow,
            HourlyRate = 2500,
            Currency = "INR",
            TurnaroundDays = 3,
            Languages = new List<string> { "Telugu", "English", "Hindi" },
            AppearsOnCamera = true,
            AcceptsProductShipments = true,
            AverageRating = 4.95m,
            CompletedProjectsCount = 48,
            IsVerified = true
        };
        pro1User.ProfessionalProfile = pro1Profile;
        context.Users.Add(pro1User);

        // 4. Create Demo Video Editor Pro
        var pro2Pass = hasher.HashPassword("EditorPass123!");
        var pro2User = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Arjun Verma",
            Email = "arjun.edits@creator.com",
            PhoneNumber = "+91 99887 76655",
            PasswordHash = pro2Pass,
            Role = UserRole.Professional,
            IsEmailVerified = true,
            IsPhoneVerified = true
        };

        var pro2Profile = new ProfessionalProfile
        {
            Id = Guid.NewGuid(),
            UserId = pro2User.Id,
            DisplayName = "Arjun Verma (Motion & Edits)",
            Slug = "arjun-verma",
            Headline = "High-Retention YouTube & Shorts Video Editor • DaVinci & Premiere Pro",
            Bio = "Pacing, sound design, dynamic captions and visual storytelling that 3x average view duration for top creators.",
            AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            BannerUrl = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
            ExperienceLevel = "Senior",
            YearsOfExperience = 5,
            AvailabilityStatus = AvailabilityStatus.AvailableNow,
            HourlyRate = 3000,
            Currency = "INR",
            TurnaroundDays = 2,
            Languages = new List<string> { "English", "Hindi" },
            AppearsOnCamera = false,
            AcceptsProductShipments = false,
            AverageRating = 4.9m,
            CompletedProjectsCount = 64,
            IsVerified = true
        };
        pro2User.ProfessionalProfile = pro2Profile;
        context.Users.Add(pro2User);

        await context.SaveChangesAsync();

        // Attach Roles and Skills
        context.ProfessionalRoles.AddRange(
            new ProfessionalRole { Id = Guid.NewGuid(), ProfessionalProfileId = pro1Profile.Id, RoleTaxonomyId = ugcRole1.Id },
            new ProfessionalRole { Id = Guid.NewGuid(), ProfessionalProfileId = pro1Profile.Id, RoleTaxonomyId = ugcRole2.Id },
            new ProfessionalRole { Id = Guid.NewGuid(), ProfessionalProfileId = pro2Profile.Id, RoleTaxonomyId = vidRole1.Id },
            new ProfessionalRole { Id = Guid.NewGuid(), ProfessionalProfileId = pro2Profile.Id, RoleTaxonomyId = vidRole2.Id }
        );

        context.ProfessionalSkills.AddRange(
            new ProfessionalSkill { Id = Guid.NewGuid(), ProfessionalProfileId = pro1Profile.Id, SkillTaxonomyId = skillTelugu.Id },
            new ProfessionalSkill { Id = Guid.NewGuid(), ProfessionalProfileId = pro1Profile.Id, SkillTaxonomyId = skillSkincare.Id },
            new ProfessionalSkill { Id = Guid.NewGuid(), ProfessionalProfileId = pro2Profile.Id, SkillTaxonomyId = skillPremiere.Id },
            new ProfessionalSkill { Id = Guid.NewGuid(), ProfessionalProfileId = pro2Profile.Id, SkillTaxonomyId = skillResolve.Id },
            new ProfessionalSkill { Id = Guid.NewGuid(), ProfessionalProfileId = pro2Profile.Id, SkillTaxonomyId = skillSound.Id }
        );

        // Portfolio Items
        context.PortfolioItems.AddRange(
            new PortfolioItem
            {
                Id = Guid.NewGuid(),
                ProfessionalProfileId = pro1Profile.Id,
                Title = "Vitamin C Brightening Serum — 3-Part UGC Reel Campaign",
                Description = "3 high-energy hook variations tested on Instagram & Facebook ads, generating 4.2x ROAS.",
                CategorySlug = "ugc-creators",
                RolePerformed = "Direct-to-Camera Creator & Script Adaptation",
                ToolsUsed = new List<string> { "iPhone 15 Pro Max", "CapCut", "Ring Light Setup" },
                ThumbnailUrl = "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
                MediaUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
                MediaType = "Video"
            },
            new PortfolioItem
            {
                Id = Guid.NewGuid(),
                ProfessionalProfileId = pro2Profile.Id,
                Title = "Finance Documentary: The Anatomy of a Market Crash",
                Description = "12-minute documentary-style YouTube video with 850k views and 68% retention rate.",
                CategorySlug = "video-editors",
                RolePerformed = "Lead Editor, Sound Designer & Colorist",
                ToolsUsed = new List<string> { "Premiere Pro", "After Effects", "DaVinci Resolve" },
                ThumbnailUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
                MediaUrl = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                MediaType = "Video"
            }
        );

        // Sample Open Requirement from Client
        var sampleReq = new Requirement
        {
            Id = Guid.NewGuid(),
            ClientProfileId = clientProfile.Id,
            CategoryId = ugcCat.Id,
            Title = "Need 3 UGC Video Reels for Vitamin C Serum (Telugu + English)",
            Description = "Looking for an energetic, on-camera skincare UGC creator to record 3 dynamic 9:16 Instagram Reels for our natural glow serum. We will ship 2 product bottles to your address. Need authentic hook test variations.",
            BudgetMin = 12000,
            BudgetMax = 20000,
            Currency = "INR",
            ExpectedDeliveryDays = 5,
            RequiredLanguages = new List<string> { "Telugu", "English" },
            RequiresOnCamera = true,
            RequiresProductShipment = true,
            DynamicAttributesJson = "{\"product_type\":\"Skincare & Beauty\",\"video_format\":\"Problem-Agitate-Solve Hook Reel\",\"aspect_ratio\":\"9:16 (Reels/TikTok/Shorts)\",\"shipping_needed\":true,\"raw_footage\":true}",
            IsPublicListing = true,
            Status = RequirementStatus.Open
        };
        context.Requirements.Add(sampleReq);

        await context.SaveChangesAsync();
    }
}
