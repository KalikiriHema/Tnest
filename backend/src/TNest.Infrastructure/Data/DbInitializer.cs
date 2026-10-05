using System.Text.Json;
using TNest.Application.Common.Interfaces;
using TNest.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace TNest.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(AppDbContext context, IPasswordHasher hasher)
    {
        try
        {
            if (context.Database.IsRelational())
            {
                await context.Database.MigrateAsync();
            }
            else
            {
                await context.Database.EnsureCreatedAsync();
            }
        }
        catch
        {
            await context.Database.EnsureCreatedAsync();
        }

        try
        {
            if (context.Database.IsRelational())
            {
                await context.Database.ExecuteSqlRawAsync(@"
                    ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""GoogleSubjectId"" text;
                    ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""AuthProvider"" text DEFAULT 'Local';
                ");
            }
        }
        catch { }

        // 1. Ensure all 8 Top Categories exist
        var categoriesList = new List<Category>
        {
            new Category
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Name = "UGC & Creators",
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
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Name = "Video & Content",
                Slug = "video-content",
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
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Name = "Design",
                Slug = "design",
                Description = "High-CTR YouTube thumbnails, brand kits, UI/UX mockups, social graphics, and 3D renders.",
                Icon = "ImageIcon",
                DynamicSchemaJson = @"[
                    {""fieldId"": ""primary_subject"", ""label"": ""Primary Focal Element"", ""type"": ""select"", ""options"": [""Face with Expression + Graphic"", ""Product Showcase"", ""Minimalist Typography"", ""Illustrated/3D Composition""], ""required"": true},
                    {""fieldId"": ""source_files_needed"", ""label"": ""Include Layered PSD / Figma Files?"", ""type"": ""boolean"", ""required"": true}
                ]"
            },
            new Category
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                Name = "Writing & Content",
                Slug = "writing-content",
                Description = "Viral hook formulas, YouTube scripts, landing page copy, blogs, and storytelling.",
                Icon = "Feather",
                DynamicSchemaJson = @"[
                    {""fieldId"": ""target_word_count"", ""label"": ""Target Word Count / Duration"", ""type"": ""select"", ""options"": [""60s Hook Script (150 words)"", ""3-5 Min Explainer (600 words)"", ""8-12 Min YouTube Deep Dive (1500+ words)""], ""required"": true},
                    {""fieldId"": ""tone_of_voice"", ""label"": ""Tone of Voice"", ""type"": ""select"", ""options"": [""Energetic & Punchy"", ""Authoritative & Educative"", ""Humorous & Satirical"", ""Emotional Storytelling""], ""required"": true}
                ]"
            },
            new Category
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                Name = "Technology & Coding",
                Slug = "technology",
                Description = "Full stack web applications, mobile apps, automation scripts, and custom APIs.",
                Icon = "Code",
                DynamicSchemaJson = "[]"
            },
            new Category
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                Name = "Marketing & Advertising",
                Slug = "marketing-advertising",
                Description = "Meta & Google ad scaling, influencer outreach, SEO audit, and conversion funnels.",
                Icon = "TrendingUp",
                DynamicSchemaJson = "[]"
            },
            new Category
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                Name = "Music & Audio",
                Slug = "music-audio",
                Description = "Podcast mastering, sound design, voiceover narration, intro beats, and audio cleanup.",
                Icon = "Mic",
                DynamicSchemaJson = "[]"
            },
            new Category
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
                Name = "Photography & Studio",
                Slug = "photography",
                Description = "E-commerce product shoots, lifestyle portraits, event photography, and retouching.",
                Icon = "Camera",
                DynamicSchemaJson = "[]"
            }
        };

        foreach (var cat in categoriesList)
        {
            var existing = await context.Categories.FirstOrDefaultAsync(c => c.Slug == cat.Slug || c.Id == cat.Id);
            if (existing == null)
            {
                context.Categories.Add(cat);
            }
            else
            {
                existing.Name = cat.Name;
                existing.Description = cat.Description;
                existing.Icon = cat.Icon;
                if (!string.IsNullOrEmpty(cat.DynamicSchemaJson)) existing.DynamicSchemaJson = cat.DynamicSchemaJson;
            }
        }
        // Guaranteed accounts: Hema's Brand (hema@gmail.com / hema1234) and Navya (navya@gmail.com / navya1234)
        var hemaAccount = await context.Users.Include(u => u.ClientProfile).FirstOrDefaultAsync(u => u.Email == "hema@gmail.com" || u.Email == "hema@brand.com");
        if (hemaAccount == null)
        {
            var newHema = new User
            {
                Id = Guid.NewGuid(),
                FullName = "hema",
                Email = "hema@gmail.com",
                PhoneNumber = "+91 98765 11223",
                PasswordHash = hasher.HashPassword("hema1234"),
                Role = UserRole.Client,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            newHema.ClientProfile = new ClientProfile
            {
                Id = Guid.NewGuid(),
                UserId = newHema.Id,
                CompanyName = "hema's Brand",
                ContactName = "hema",
                AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                Industry = "E-Commerce & Digital Media",
                ClientType = "Startup",
                City = "Hyderabad",
                State = "Telangana",
                Bio = "Direct-to-consumer brand creating aesthetic video campaigns and creator collaborations.",
                BusinessDescription = "Premium brand connecting with high-converting creative specialists."
            };
            context.Users.Add(newHema);
            await context.SaveChangesAsync();
        }
        else
        {
            hemaAccount.Email = "hema@gmail.com";
            hemaAccount.PasswordHash = hasher.HashPassword("hema1234");
            await context.SaveChangesAsync();
        }

        var navyaAccount = await context.Users.Include(u => u.ProfessionalProfile).FirstOrDefaultAsync(u => u.Email == "navya@gmail.com" || u.Email == "navya@tnest.com");
        if (navyaAccount == null)
        {
            var newNavya = new User
            {
                Id = Guid.NewGuid(),
                FullName = "navya",
                Email = "navya@gmail.com",
                PhoneNumber = "+91 98765 33445",
                PasswordHash = hasher.HashPassword("navya1234"),
                Role = UserRole.Professional,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            newNavya.ProfessionalProfile = new ProfessionalProfile
            {
                Id = Guid.NewGuid(),
                UserId = newNavya.Id,
                DisplayName = "navya",
                Slug = "navya",
                Headline = "UGC Video Creator & Video Editor • Short-form Specialist",
                Bio = "Creative specialist delivering high-impact short-form video edits, authentic UGC reels, and digital designs.",
                AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                ExperienceLevel = "Experienced",
                YearsOfExperience = 3,
                AvailabilityStatus = AvailabilityStatus.AvailableNow,
                HourlyRate = 2200,
                Currency = "INR",
                TurnaroundDays = 2,
                Languages = new List<string> { "Telugu", "English", "Hindi" },
                AppearsOnCamera = true,
                AcceptsProductShipments = true,
                AverageRating = 4.9m,
                CompletedProjectsCount = 26,
                IsVerified = true,
                City = "Hyderabad",
                State = "Telangana"
            };
            context.Users.Add(newNavya);
            await context.SaveChangesAsync();
        }
        else
        {
            navyaAccount.Email = "navya@gmail.com";
            navyaAccount.PasswordHash = hasher.HashPassword("navya1234");
            await context.SaveChangesAsync();
        }

        // 2. Clean up dynamic user data if database was empty or needs initial seeding
        if (await context.ProfessionalProfiles.CountAsync() < 100 || await context.Requirements.CountAsync() < 75)
        {
            // Clear transactional tables
            context.Reviews.RemoveRange(context.Reviews);
            context.ProjectDeliveries.RemoveRange(context.ProjectDeliveries);
            context.Projects.RemoveRange(context.Projects);
            context.ChatMessages.RemoveRange(context.ChatMessages);
            context.Conversations.RemoveRange(context.Conversations);
            context.Inquiries.RemoveRange(context.Inquiries);
            context.Proposals.RemoveRange(context.Proposals);
            context.Requirements.RemoveRange(context.Requirements);
            context.PortfolioItems.RemoveRange(context.PortfolioItems);
            context.ProfessionalSkills.RemoveRange(context.ProfessionalSkills);
            context.ProfessionalRoles.RemoveRange(context.ProfessionalRoles);
            context.ProfessionalProfiles.RemoveRange(context.ProfessionalProfiles);
            context.ClientProfiles.RemoveRange(context.ClientProfiles);
            context.Users.RemoveRange(context.Users);
            await context.SaveChangesAsync();

            var defaultPassword = hasher.HashPassword("Password123!");

            // 3. CORE QUICK LOGIN ACCOUNTS
            // A. Admin Account
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "TNEST Platform Admin",
                Email = "admin@tnest.com",
                PhoneNumber = "+91 99999 00000",
                PasswordHash = hasher.HashPassword("AdminPass123!"),
                Role = UserRole.Admin,
                IsEmailVerified = true,
                IsPhoneVerified = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            context.Users.Add(adminUser);

            // B. Dual Role Developer Account (John Doe)
            var johnUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "John Doe",
                Email = "john@gmail.com",
                PhoneNumber = "+91 98765 00001",
                PasswordHash = defaultPassword,
                Role = UserRole.DualRole,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            johnUser.ClientProfile = new ClientProfile
            {
                Id = Guid.NewGuid(),
                UserId = johnUser.Id,
                CompanyName = "Apex Media Group",
                ContactName = "John Doe",
                AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                Industry = "Digital Growth & Media",
                ClientType = "Agency",
                City = "Bangalore",
                State = "Karnataka",
                Bio = "Commissioning high-impact video campaigns and managing creative creators across global brands.",
                BusinessDescription = "Full-service digital media agency specializing in performance creative, TikTok ads, and influencer campaigns."
            };
            johnUser.ProfessionalProfile = new ProfessionalProfile
            {
                Id = Guid.NewGuid(),
                UserId = johnUser.Id,
                DisplayName = "John Doe (Growth & Creative)",
                Slug = "john-doe",
                Headline = "Performance Creative Director & Growth Lead",
                Bio = "Bridging client strategy with high-converting visual executions across TikTok, Shorts, and YouTube.",
                AvatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                BannerUrl = "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80",
                ExperienceLevel = "Senior",
                YearsOfExperience = 5,
                AvailabilityStatus = AvailabilityStatus.AvailableNow,
                HourlyRate = 3500,
                Currency = "INR",
                TurnaroundDays = 3,
                Languages = new List<string> { "English", "Hindi" },
                AppearsOnCamera = true,
                AcceptsProductShipments = true,
                AverageRating = 4.95m,
                CompletedProjectsCount = 42,
                IsVerified = true,
                City = "Bangalore",
                State = "Karnataka"
            };
            context.Users.Add(johnUser);

            // C. Client Developer Account (Ananya Sharma - GlowSkin)
            var clientUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Ananya Sharma",
                Email = "client@glowskin.com",
                PhoneNumber = "+91 98765 43210",
                PasswordHash = hasher.HashPassword("ClientPass123!"),
                Role = UserRole.Client,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            clientUser.ClientProfile = new ClientProfile
            {
                Id = Guid.NewGuid(),
                UserId = clientUser.Id,
                CompanyName = "GlowSkin Organics",
                ContactName = "Ananya Sharma",
                AvatarUrl = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                Industry = "Direct-to-Consumer Beauty & Wellness",
                ClientType = "Startup",
                City = "Mumbai",
                State = "Maharashtra",
                Bio = "Premium ayurvedic skincare brand crafting natural glow serums and clinical botanicals.",
                BusinessDescription = "Direct-to-consumer skincare line with over 50k monthly active buyers across India."
            };
            context.Users.Add(clientUser);

            // C2. Quick Test Client Account (client@gmail.com / client1234)
            var quickClientUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Demo Client",
                Email = "client@gmail.com",
                PhoneNumber = "+91 98765 43211",
                PasswordHash = hasher.HashPassword("client1234"),
                Role = UserRole.Client,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            quickClientUser.ClientProfile = new ClientProfile
            {
                Id = Guid.NewGuid(),
                UserId = quickClientUser.Id,
                CompanyName = "Demo Client Enterprises",
                ContactName = "Demo Client",
                AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                Industry = "E-Commerce & Digital Media",
                ClientType = "Business",
                City = "Mumbai",
                State = "Maharashtra",
                Bio = "Commissioning video edits, UGC reels, and creative scripts on Tnest.",
                BusinessDescription = "Active business client account on Tnest."
            };
            context.Users.Add(quickClientUser);

            // C3. Quick Test Doer Account (doer@gmail.com / doer1234)
            var quickDoerUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Demo Creative Doer",
                Email = "doer@gmail.com",
                PhoneNumber = "+91 98765 43212",
                PasswordHash = hasher.HashPassword("doer1234"),
                Role = UserRole.Professional,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            quickDoerUser.ProfessionalProfile = new ProfessionalProfile
            {
                Id = Guid.NewGuid(),
                UserId = quickDoerUser.Id,
                DisplayName = "Demo Creative Doer",
                Slug = "demo-creative-doer",
                Headline = "Multi-disciplinary Video Editor & Content Creator",
                Bio = "Full-time creative doer delivering top-tier video and design assets for brands.",
                AvatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                BannerUrl = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80",
                ExperienceLevel = "Senior",
                YearsOfExperience = 4,
                AvailabilityStatus = AvailabilityStatus.AvailableNow,
                HourlyRate = 2800,
                Currency = "INR",
                TurnaroundDays = 2,
                Languages = new List<string> { "English", "Hindi" },
                AppearsOnCamera = true,
                AcceptsProductShipments = true,
                AverageRating = 4.95m,
                CompletedProjectsCount = 35,
                IsVerified = true,
                City = "Bangalore",
                State = "Karnataka"
            };
            context.Users.Add(quickDoerUser);

            // D. Doer Developer Account: UGC & Reels (Priya Reddy)
            var priyaUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Priya Reddy",
                Email = "priya.ugc@creator.com",
                PhoneNumber = "+91 91234 56789",
                PasswordHash = hasher.HashPassword("CreatorPass123!"),
                Role = UserRole.Professional,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            priyaUser.ProfessionalProfile = new ProfessionalProfile
            {
                Id = Guid.NewGuid(),
                UserId = priyaUser.Id,
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
                IsVerified = true,
                City = "Hyderabad",
                State = "Telangana"
            };
            context.Users.Add(priyaUser);

            // D1. Hema's Brand (Client Account)
            var hemaUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "hema",
                Email = "hema@brand.com",
                PhoneNumber = "+91 98765 11223",
                PasswordHash = defaultPassword,
                Role = UserRole.Client,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            hemaUser.ClientProfile = new ClientProfile
            {
                Id = Guid.NewGuid(),
                UserId = hemaUser.Id,
                CompanyName = "hema's Brand",
                ContactName = "hema",
                AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                Industry = "E-Commerce & Digital Media",
                ClientType = "Startup",
                City = "Hyderabad",
                State = "Telangana",
                Bio = "Direct-to-consumer brand creating aesthetic video campaigns and creator collaborations.",
                BusinessDescription = "Premium brand connecting with high-converting creative specialists."
            };
            context.Users.Add(hemaUser);

            // D2. Navya (Doer Account)
            var navyaUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "navya",
                Email = "navya@tnest.com",
                PhoneNumber = "+91 98765 33445",
                PasswordHash = defaultPassword,
                Role = UserRole.Professional,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            navyaUser.ProfessionalProfile = new ProfessionalProfile
            {
                Id = Guid.NewGuid(),
                UserId = navyaUser.Id,
                DisplayName = "navya",
                Slug = "navya",
                Headline = "UGC Video Creator & Video Editor • Short-form Specialist",
                Bio = "Creative specialist delivering high-impact short-form video edits, authentic UGC reels, and digital designs.",
                AvatarUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                ExperienceLevel = "Experienced",
                YearsOfExperience = 3,
                AvailabilityStatus = AvailabilityStatus.AvailableNow,
                HourlyRate = 2200,
                Currency = "INR",
                TurnaroundDays = 2,
                Languages = new List<string> { "Telugu", "English", "Hindi" },
                AppearsOnCamera = true,
                AcceptsProductShipments = true,
                AverageRating = 4.9m,
                CompletedProjectsCount = 26,
                IsVerified = true,
                City = "Hyderabad",
                State = "Telangana"
            };
            context.Users.Add(navyaUser);

            // E. Doer Developer Account: Video Editor (Arjun Verma)
            var arjunUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Arjun Verma",
                Email = "arjun.edits@creator.com",
                PhoneNumber = "+91 99887 76655",
                PasswordHash = hasher.HashPassword("EditorPass123!"),
                Role = UserRole.Professional,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            arjunUser.ProfessionalProfile = new ProfessionalProfile
            {
                Id = Guid.NewGuid(),
                UserId = arjunUser.Id,
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
                IsVerified = true,
                City = "Delhi NCR",
                State = "Delhi"
            };
            context.Users.Add(arjunUser);

            // F. Doer Developer Account: Full Stack Tech (Sarah Jenkins)
            var sarahUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "Sarah Jenkins",
                Email = "sarah.dev@creator.com",
                PhoneNumber = "+91 98333 44556",
                PasswordHash = hasher.HashPassword("DevPass123!"),
                Role = UserRole.Professional,
                IsEmailVerified = true,
                IsPhoneVerified = true
            };
            sarahUser.ProfessionalProfile = new ProfessionalProfile
            {
                Id = Guid.NewGuid(),
                UserId = sarahUser.Id,
                DisplayName = "Sarah Jenkins (Full Stack Dev)",
                Slug = "sarah-jenkins",
                Headline = "Senior Full Stack React & Node Engineer • Cloud APIs & SaaS",
                Bio = "Full-stack developer building robust, fast, responsive web applications, SaaS dashboards, and automated microservices.",
                AvatarUrl = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
                BannerUrl = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
                ExperienceLevel = "Expert",
                YearsOfExperience = 6,
                AvailabilityStatus = AvailabilityStatus.AvailableNow,
                HourlyRate = 4500,
                Currency = "INR",
                TurnaroundDays = 3,
                Languages = new List<string> { "English" },
                AppearsOnCamera = false,
                AcceptsProductShipments = false,
                AverageRating = 5.0m,
                CompletedProjectsCount = 38,
                IsVerified = true,
                City = "Bangalore",
                State = "Karnataka"
            };
            context.Users.Add(sarahUser);

            // 4. SEED 100 DOERS ACROSS ALL CATEGORIES
            var categories = new[]
            {
                "technology", "video-content", "ugc-creators", "design",
                "marketing-advertising", "writing-content", "music-audio", "photography"
            };

            var firstNames = new[] { "Aditya", "Rohan", "Sneha", "Kavya", "Vikram", "Neha", "Rahul", "Tanvi", "Siddharth", "Aisha", "Manish", "Divya", "Karan", "Pooja", "Varun", "Meera", "Sameer", "Anjali", "Rishabh", "Shreya", "Alex", "Elena", "Liam", "Maya", "Daniel", "Chloe", "Marcus", "Zara", "Leo", "Nora" };
            var lastNames = new[] { "Sharma", "Verma", "Reddy", "Patel", "Nair", "Kapoor", "Joshi", "Iyer", "Rao", "Gupta", "Malhotra", "Sen", "Bhatia", "Choudhury", "Menon", "Deshmukh", "Banerjee", "Kulkarni", "Mehta", "Saxena", "Smith", "Johnson", "Davis", "Taylor", "Miller" };
            var cities = new[] { "Bangalore", "Mumbai", "Hyderabad", "Delhi NCR", "Pune", "Chennai", "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh", "Kochi", "Remote" };
            var experienceLevels = new[] { "Fresher / Student", "Junior (1-2 yrs)", "Mid-Level (2-4 yrs)", "Senior (4-7 yrs)", "Expert Lead (8+ yrs)" };
            
            var avatarPool = new[]
            {
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80"
            };

            var headlines = new Dictionary<string, string[]>
            {
                ["technology"] = new[] { "Full Stack React & Node.js Developer • SaaS & Cloud", "Next.js & TypeScript Frontend Engineer", "Python & AI Automation Specialist • Fast APIs", "Mobile App Developer (React Native & Flutter)", "Backend Architect & PostgreSQL/Docker Engineer" },
                ["video-content"] = new[] { "High-Retention YouTube Video Editor • Premiere & DaVinci", "Shorts & Viral Reels Editor • Kinetic Captions", "Motion Graphics Designer & 2D After Effects Animator", "Cinematic Documentary Video Editor & Colorist", "Podcast Video & Audio Multi-Cam Editor" },
                ["ugc-creators"] = new[] { "Authentic Skincare & Beauty On-Camera UGC Creator", "Tech & Gadget Reviewer • Relatable Direct Response", "Fitness, Wellness & Lifestyle UGC Creator", "D2C Brand Spokesperson & Product Unboxing Specialist", "Hindi & English Viral TikTok/Reels Creator" },
                ["design"] = new[] { "High-CTR YouTube Thumbnail Artist & Photoshop Wizard", "Figma UI/UX & Design Systems Specialist", "Brand Identity, Logo & Social Media Designer", "3D Product Visualization & Blender Render Artist", "Presentation & Pitch Deck Designer for Startups" },
                ["marketing-advertising"] = new[] { "Performance Meta & Google Ads Scaling Specialist", "Social Media Growth & Content Marketing Strategist", "Technical SEO Specialist • Organic Traffic Growth", "Direct Response Ad Creative & Copy Strategist", "Email Marketing & Klaviyo Funnels Specialist" },
                ["writing-content"] = new[] { "High-Converting Video Scriptwriter & Storyteller", "SEO Blog & Long-Form Technical Article Writer", "Direct Response Copywriter for Landing Pages & Ads", "Ghostwriter for Founders & LinkedIn Thought Leaders", "B2B SaaS Content & Case Studies Writer" },
                ["music-audio"] = new[] { "Podcast Audio Engineer & Sound Design Specialist", "Voiceover Artist • Warm, Corporate & Storytelling", "Custom Intro Beats & Brand Audio Production", "Vocal Mixing & Mastering Engineer • Clean Audio", "Soundtrack & Commercial Jingle Composer" },
                ["photography"] = new[] { "E-Commerce & D2C Studio Product Photographer", "Editorial Portrait & Lifestyle Brand Photographer", "High-End Photo Retoucher & Photoshop Colorist", "Food & Beverage Commercial Photographer", "Event & Corporate Headshot Photographer" }
            };

            var doerList = new List<User>();
            var rnd = new Random(42);

            for (int i = 1; i <= 96; i++)
            {
                var catSlug = categories[(i - 1) % categories.Length];
                var fName = firstNames[rnd.Next(firstNames.Length)];
                var lName = lastNames[rnd.Next(lastNames.Length)];
                var fullName = $"{fName} {lName}";
                var city = cities[rnd.Next(cities.Length)];
                var exp = experienceLevels[rnd.Next(experienceLevels.Length)];
                var rate = (rnd.Next(3, 70)) * 100;
                var turnaround = new[] { 1, 2, 3, 5, 7, 10, 14 }[rnd.Next(7)];
                var headlineOptions = headlines[catSlug];
                var headline = headlineOptions[rnd.Next(headlineOptions.Length)];

                decimal rating;
                int projectsCount;
                if (i % 7 == 0)
                {
                    rating = 0.0m;
                    projectsCount = 0;
                }
                else if (i % 2 == 0)
                {
                    rating = Math.Round(4.8m + (decimal)(rnd.NextDouble() * 0.2), 1);
                    projectsCount = rnd.Next(15, 95);
                }
                else
                {
                    rating = Math.Round(4.0m + (decimal)(rnd.NextDouble() * 0.7), 1);
                    projectsCount = rnd.Next(3, 40);
                }

                var u = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = fullName,
                    Email = $"doer.{fName.ToLower()}.{lName.ToLower()}{i}@creator.com",
                    PhoneNumber = $"+91 {rnd.Next(90000, 99999)} {rnd.Next(10000, 99999)}",
                    PasswordHash = defaultPassword,
                    Role = UserRole.Professional,
                    IsEmailVerified = true,
                    IsPhoneVerified = true
                };

                u.ProfessionalProfile = new ProfessionalProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = u.Id,
                    DisplayName = fullName,
                    Slug = $"{fName.ToLower()}-{lName.ToLower()}-{i}",
                    Headline = headline,
                    Bio = $"Passionate {headline.Split('•')[0].Trim()} with hands-on experience delivering reliable, high-quality deliverables on time. Based in {city}, available for tasks, contracts, and projects.",
                    AvatarUrl = avatarPool[rnd.Next(avatarPool.Length)],
                    BannerUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80",
                    ExperienceLevel = exp.Split('(')[0].Trim(),
                    YearsOfExperience = rnd.Next(1, 10),
                    AvailabilityStatus = AvailabilityStatus.AvailableNow,
                    HourlyRate = rate,
                    Currency = "INR",
                    TurnaroundDays = turnaround,
                    Languages = new List<string> { "English", "Hindi" },
                    AppearsOnCamera = catSlug == "ugc-creators" || rnd.Next(3) == 0,
                    AcceptsProductShipments = catSlug == "ugc-creators" || catSlug == "photography",
                    AverageRating = rating,
                    CompletedProjectsCount = projectsCount,
                    IsVerified = rating >= 4.5m || i % 4 == 0,
                    City = city,
                    State = "India"
                };

                doerList.Add(u);
            }

            context.Users.AddRange(doerList);
            await context.SaveChangesAsync();

            // 5. SEED SAMPLE CLIENTS
            var sampleClients = new[]
            {
                new { Company = "GlowSkin Organics", Contact = "Ananya Sharma", Industry = "Beauty & D2C", Avatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80" },
                new { Company = "ZenFlow Productivity", Contact = "Vikram Sen", Industry = "SaaS & AI", Avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80" },
                new { Company = "UrbanEats Delivery", Contact = "Meera Joshi", Industry = "Food & Tech", Avatar = "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80" },
                new { Company = "FinVeda Wealth", Contact = "Karan Bhatia", Industry = "Fintech", Avatar = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" },
                new { Company = "Lumina Apparel", Contact = "Sneha Iyer", Industry = "Fashion & E-Commerce", Avatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" },
                new { Company = "Apex Media Group", Contact = "John Doe", Industry = "Media & Agency", Avatar = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }
            };

            var clientEntities = new List<ClientProfile>();
            foreach (var sc in sampleClients)
            {
                var cu = new User
                {
                    Id = Guid.NewGuid(),
                    FullName = sc.Contact,
                    Email = $"client.{sc.Contact.ToLower().Replace(" ", "")}@company.com",
                    PhoneNumber = $"+91 {rnd.Next(91000, 98999)} {rnd.Next(10000, 99999)}",
                    PasswordHash = defaultPassword,
                    Role = UserRole.Client,
                    IsEmailVerified = true,
                    IsPhoneVerified = true
                };
                cu.ClientProfile = new ClientProfile
                {
                    Id = Guid.NewGuid(),
                    UserId = cu.Id,
                    CompanyName = sc.Company,
                    ContactName = sc.Contact,
                    AvatarUrl = sc.Avatar,
                    Industry = sc.Industry,
                    ClientType = "Business",
                    Bio = "Verified organization commissioning tasks on Tnest.",
                    BusinessDescription = $"Corporate client account for {sc.Company}."
                };
                context.Users.Add(cu);
                clientEntities.Add(cu.ClientProfile);
            }
            await context.SaveChangesAsync();

            // 6. SEED 75 TASKS / REQUIREMENTS ACROSS ALL CATEGORIES
            var taskTitles = new Dictionary<string, (string Title, string Desc, int MinB, int MaxB, int Days)[]>
            {
                ["technology"] = new[]
                {
                    ("Full Stack Web App Development (React + Node.js)", "Build an end-to-end web portal with user authentication, dashboard analytics, and PostgreSQL database integration.", 25000, 50000, 14),
                    ("Mobile App MVP in React Native / Flutter", "Looking for a mobile developer to build an iOS and Android MVP app with REST API connectivity and push notifications.", 35000, 75000, 21),
                    ("Python Web Scraping & Automated Data Pipeline", "Need an automated Python script to crawl 4 e-commerce platforms daily, clean data, and output to Google Sheets/Postgres.", 8000, 15000, 5),
                    ("Stripe & Razorpay Payment Gateway Integration", "Integrate recurring subscriptions and one-time checkout in our existing Next.js web application.", 10000, 20000, 4),
                    ("Figma to Clean Tailwind CSS / React Code", "Convert 8 responsive Figma screens into modular React components with accessible HTML semantics.", 6000, 12000, 3)
                },
                ["video-content"] = new[]
                {
                    ("10 Fast-Paced Instagram Reels & YouTube Shorts", "Looking for a creative video editor to cut 10 viral reels from raw footage with animated kinetic captions and SFX.", 15000, 25000, 6),
                    ("YouTube Long-Form Documentary Video Editing (15 Mins)", "Edit a deep-dive finance video essay with documentary B-roll pacing, sound design, and color grading.", 12000, 22000, 5),
                    ("Kinetic Typography 2D Explainer Video", "Create a 60-second animated motion graphics explainer video showcasing our SaaS product features.", 18000, 32000, 7),
                    ("Podcast Video Multi-Cam Switch & Audiogram Cuts", "Edit 4 weekly podcast episodes (45 mins each) with speaker switches, audio leveling, and social teaser clips.", 20000, 35000, 10),
                    ("Cinematic Brand Commercial Video Grading & Sound", "Final post-production polish: DaVinci Resolve color grade and high-impact sound design for a 90s commercial.", 10000, 18000, 4)
                },
                ["ugc-creators"] = new[]
                {
                    ("3 Authentic UGC Reels for Vitamin C Serum (On-Camera)", "Looking for an energetic female creator to test and review our natural face serum. Product will be shipped to you.", 12000, 20000, 5),
                    ("Tech Gadget Unboxing & Hands-On Demo Video", "Record a clean 9:16 vertical review showing unboxing, setup, and key features of our ergonomic keyboard.", 8000, 15000, 4),
                    ("Fitness App Testimonial & Screen Recording Hook", "Charismatic fitness creator to show workout tracking app walkthrough and personal review.", 7000, 14000, 3),
                    ("Problem-Agitate-Solve Ad Hooks for D2C Brand", "Record 5 different 3-second hook variations and a 45-second core review video for TikTok/Meta ads.", 10000, 18000, 4),
                    ("Ayurvedic Hair Oil Routine Video (Hindi / English)", "Create relatable morning hair routine demonstration highlighting natural ingredients and benefits.", 9000, 16000, 5)
                },
                ["design"] = new[]
                {
                    ("5 High-CTR YouTube Thumbnails for Tech Channel", "Design 5 click-worthy YouTube thumbnails optimized for mobile CTR. Facial lighting & 3D compositions.", 5000, 9000, 2),
                    ("Complete Brand Identity & Logo Kit for Startup", "Looking for a brand designer for logo, color typography tokens, social media templates, and vector icons.", 18000, 35000, 10),
                    ("Figma Mobile App UI/UX Redesign (12 Screens)", "Redesign our food delivery user flow with modern aesthetics, dark mode, and interactive components.", 22000, 45000, 12),
                    ("Pitch Deck Presentation Design for Seed Round", "Transform 15 slide outlines into a stunning investor keynote presentation with infographics.", 12000, 25000, 5),
                    ("E-Commerce Amazon Product Listing Infographics", "Design 7 high-converting product gallery slides including feature breakdown and comparison charts.", 6000, 11000, 3)
                },
                ["marketing-advertising"] = new[]
                {
                    ("Meta Ads Setup & ROAS Optimization Campaign", "Set up Facebook & Instagram conversion ad campaigns, test 4 audiences, and optimize for 3.5x+ ROAS.", 15000, 30000, 14),
                    ("Complete Technical SEO Audit & Keyword Strategy", "Perform on-page and technical SEO audit, fix meta tags, and build a 3-month keyword roadmap.", 12000, 24000, 10),
                    ("Social Media Management & Content Calendar (30 Days)", "Create and schedule 20 posts and reels across Instagram and LinkedIn with engaging captions.", 18000, 32000, 30),
                    ("Google Search Ads Setup & Negative Keyword Bidding", "Launch high-intent Google Search campaigns for local service company with conversion tracking.", 10000, 20000, 7),
                    ("Klaviyo E-Commerce Email Automation Flows", "Build 5 core email flows: Welcome Series, Abandoned Cart, Post-Purchase, and Win-back.", 14000, 25000, 8)
                },
                ["writing-content"] = new[]
                {
                    ("5 Viral YouTube Video Scripts (Finance & Tech)", "Write 5 engaging 10-minute video scripts structured with retention hooks, story loops, and B-roll cues.", 12000, 22000, 8),
                    ("High-Converting Landing Page Copywriting", "Write compelling copy for our B2B SaaS landing page including headlines, value propositions, and FAQs.", 8000, 16000, 4),
                    ("4 In-Depth Technical SEO Blog Posts (2000 Words)", "Write well-researched, original articles on Cloud computing and DevOps best practices.", 10000, 18000, 6),
                    ("Ad Copy Variations for Meta & Google Search", "Write 20 snappy ad copy variations with emotional angles, urgency hooks, and strong calls to action.", 5000, 9000, 3),
                    ("Company Whitepaper on AI in Healthcare", "Research and author a 12-page industry report with executive summary, charts, and case studies.", 18000, 35000, 12)
                },
                ["music-audio"] = new[]
                {
                    ("Podcast Audio Cleaning, Mastering & Noise Removal", "Clean and master 4 podcast episodes (60 mins each) with EQ, compression, and loudness normalization.", 8000, 15000, 5),
                    ("Professional Voiceover for 90-Second Product Video", "Warm, authoritative voiceover narration in neutral English accent for our corporate explainer.", 6000, 12000, 2),
                    ("Custom Lofi Intro Beat & Sound Branding", "Produce unique, royalty-free 15-second intro and outro music tracks for our weekly YouTube show.", 7000, 14000, 4),
                    ("Sound Effects Design & Foley for Mobile Game", "Create 25 sound effects for UI buttons, achievements, coin pickups, and level transitions.", 10000, 20000, 6),
                    ("Multi-Track Audio Mixing for Indie Song", "Mix and master a 4-minute acoustic indie pop song with 18 stems to streaming standards.", 12000, 22000, 5)
                },
                ["photography"] = new[]
                {
                    ("Studio Product Photography for 8 Skincare Bottles", "Clean white background and lifestyle textured shots for Amazon & Shopify store listings.", 15000, 28000, 7),
                    ("Fashion Apparel Flat Lay & Model Lookbook Shoot", "Shoot 12 clothing pieces with high-res styling and color-accurate post-processing.", 20000, 38000, 8),
                    ("Corporate Executive Headshots & Team Portraits", "On-location headshots for 15 team members in Bangalore office with professional lighting.", 12000, 22000, 3),
                    ("High-End Commercial Retouching for 20 Images", "Detailed skin texture retouching, background cleanup, and color grading for billboard ads.", 8000, 16000, 4),
                    ("Food & Drink Menu Photography for Restaurant", "Shoot 15 signature dishes and cocktails on-site with ambient styling for Swiggy/Zomato.", 14000, 25000, 5)
                }
            };

            var allTasks = new List<Requirement>();

            for (int t = 1; t <= 75; t++)
            {
                var catIndex = (t - 1) % categories.Length;
                var catSlug = categories[catIndex];
                var catEntity = categoriesList.First(c => c.Slug == catSlug);
                var client = clientEntities[rnd.Next(clientEntities.Count)];
                
                var pool = taskTitles[catSlug];
                var item = pool[rnd.Next(pool.Length)];

                DateTime createdAt;
                if (t <= 15)
                {
                    createdAt = DateTime.UtcNow.AddMinutes(-rnd.Next(30, 1080));
                }
                else if (t <= 40)
                {
                    createdAt = DateTime.UtcNow.AddDays(-rnd.Next(1, 6)).AddHours(-rnd.Next(1, 23));
                }
                else if (t <= 60)
                {
                    createdAt = DateTime.UtcNow.AddDays(-rnd.Next(7, 14)).AddHours(-rnd.Next(1, 23));
                }
                else
                {
                    createdAt = DateTime.UtcNow.AddDays(-rnd.Next(15, 30));
                }

                var oppTypes = new[] { "Job", "Task", "Freelance", "Internship" };
                var assignedOppType = oppTypes[(t - 1) % oppTypes.Length];

                var req = new Requirement
                {
                    Id = Guid.NewGuid(),
                    ClientProfileId = client.Id,
                    CategoryId = catEntity.Id,
                    Title = item.Title + (t > 40 ? $" (Batch #{t})" : ""),
                    Description = item.Desc + " Please submit your relevant portfolio links, turnaround estimate, and previous work examples.",
                    BudgetMin = item.MinB,
                    BudgetMax = item.MaxB,
                    Currency = "INR",
                    ExpectedDeliveryDays = item.Days,
                    RequiredLanguages = new List<string> { "English", "Hindi" },
                    RequiresOnCamera = catSlug == "ugc-creators",
                    RequiresProductShipment = catSlug == "ugc-creators" || catSlug == "photography",
                    DynamicAttributesJson = JsonSerializer.Serialize(new
                    {
                        opportunityType = assignedOppType,
                        clientCompany = client.CompanyName,
                        selectedRole = item.Title.Split('(')[0].Trim(),
                        deliverables = new[] { "Complete deliverables repository / drive link", "Revision review meeting", "Final source files" },
                        expectedTimeline = $"{item.Days} Days"
                    }),
                    IsPublicListing = true,
                    Status = RequirementStatus.Open,
                    CreatedAtUtc = createdAt
                };

                allTasks.Add(req);
            }

            context.Requirements.AddRange(allTasks);
            await context.SaveChangesAsync();

            // 7. SEED PROPOSALS, PROJECTS, DELIVERIES, AND REVIEWS
            var seededDoers = await context.ProfessionalProfiles.Include(p => p.User).ToListAsync();
            var seededClients = await context.ClientProfiles.Include(c => c.User).ToListAsync();
            var seededReqs = await context.Requirements.Take(25).ToListAsync();

            var proposalsList = new List<Proposal>();
            for (int pIdx = 0; pIdx < seededReqs.Count; pIdx++)
            {
                var req = seededReqs[pIdx];
                var doer = seededDoers[pIdx % seededDoers.Count];

                var prop = new Proposal
                {
                    Id = Guid.NewGuid(),
                    RequirementId = req.Id,
                    ProfessionalProfileId = doer.Id,
                    CoverLetter = $"Hi! I specialize in {req.Title}. I have reviewed your project requirements and can deliver high-quality assets within the timeline.",
                    ProposedPrice = req.BudgetMin + (req.BudgetMax - req.BudgetMin) / 2,
                    EstimatedDays = req.ExpectedDeliveryDays,
                    Status = pIdx < 5 ? ProposalStatus.Accepted : (pIdx < 12 ? ProposalStatus.Shortlisted : ProposalStatus.Submitted),
                    CreatedAtUtc = req.CreatedAtUtc.AddHours(2)
                };
                proposalsList.Add(prop);
            }
            context.Proposals.AddRange(proposalsList);
            await context.SaveChangesAsync();

            // Seed Sample Projects (Active & Completed)
            var sampleProjects = new List<Project>();
            for (int prj = 0; prj < 6; prj++)
            {
                var req = seededReqs[prj];
                var acceptedProp = proposalsList[prj];
                var doer = seededDoers[prj % seededDoers.Count];
                var client = seededClients[prj % seededClients.Count];

                var projectStatus = prj < 2 ? ProjectStatus.Completed : (prj < 4 ? ProjectStatus.UnderReview : ProjectStatus.InProgress);

                var proj = new Project
                {
                    Id = Guid.NewGuid(),
                    ClientProfileId = client.Id,
                    ProfessionalProfileId = doer.Id,
                    RequirementId = req.Id,
                    ProposalId = acceptedProp.Id,
                    Title = req.Title,
                    AgreedPrice = acceptedProp.ProposedPrice,
                    Currency = "INR",
                    Status = projectStatus,
                    RequiresShipment = req.RequiresProductShipment,
                    CourierName = req.RequiresProductShipment ? "Blue Dart Express" : null,
                    TrackingNumber = req.RequiresProductShipment ? $"BD{rnd.Next(10000000, 99999999)}IN" : null,
                    ProductShippedAtUtc = req.RequiresProductShipment ? req.CreatedAtUtc.AddDays(1) : null,
                    ProductReceivedAtUtc = req.RequiresProductShipment ? req.CreatedAtUtc.AddDays(3) : null,
                    CreatedAtUtc = req.CreatedAtUtc.AddDays(1),
                    CompletedAtUtc = projectStatus == ProjectStatus.Completed ? DateTime.UtcNow.AddDays(-2) : null
                };

                // Add delivery milestone
                var delivery = new ProjectDelivery
                {
                    Id = Guid.NewGuid(),
                    ProjectId = proj.Id,
                    VersionNumber = 1,
                    Notes = "Here are the completed high-resolution assets and source project files as agreed.",
                    DeliveryUrlsJson = JsonSerializer.Serialize(new[] { "https://drive.google.com/drive/folders/sample-deliverables-v1", "https://vimeo.com/sample-review" }),
                    Status = projectStatus == ProjectStatus.Completed ? DeliveryStatus.Approved : DeliveryStatus.Submitted,
                    CreatedAtUtc = proj.CreatedAtUtc.AddDays(3),
                    ReviewedAtUtc = projectStatus == ProjectStatus.Completed ? proj.CompletedAtUtc : null
                };
                proj.Deliveries.Add(delivery);

                // Add Review for completed projects
                if (projectStatus == ProjectStatus.Completed)
                {
                    proj.Review = new Review
                    {
                        Id = Guid.NewGuid(),
                        ProjectId = proj.Id,
                        ClientProfileId = client.Id,
                        ProfessionalProfileId = doer.Id,
                        OverallRating = 5,
                        CommunicationRating = 5,
                        QualityRating = 5,
                        TimelinessRating = 5,
                        Comment = "Exceptional quality and lightning-fast turnaround! Followed instructions perfectly.",
                        ProfessionalResponse = "Thank you so much for the clear brief and wonderful collaboration!",
                        CreatedAtUtc = DateTime.UtcNow.AddDays(-1)
                    };
                }

                sampleProjects.Add(proj);
            }
            context.Projects.AddRange(sampleProjects);
            await context.SaveChangesAsync();

            // Seed Sample Conversations & Messages
            for (int convIdx = 0; convIdx < 4; convIdx++)
            {
                var cl = seededClients[convIdx % seededClients.Count];
                var pr = seededDoers[convIdx % seededDoers.Count];
                var req = seededReqs[convIdx];

                var conversation = new Conversation
                {
                    Id = Guid.NewGuid(),
                    ClientProfileId = cl.Id,
                    ProfessionalProfileId = pr.Id,
                    RequirementId = req.Id,
                    CreatedAtUtc = req.CreatedAtUtc.AddHours(1),
                    LastMessageAtUtc = DateTime.UtcNow.AddMinutes(-15)
                };

                conversation.Messages.Add(new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    ConversationId = conversation.Id,
                    SenderUserId = cl.UserId,
                    SenderRole = UserRole.Client,
                    Content = "Hi! We loved your profile and would like to discuss our project timeline.",
                    CreatedAtUtc = req.CreatedAtUtc.AddHours(1),
                    IsRead = true
                });

                conversation.Messages.Add(new ChatMessage
                {
                    Id = Guid.NewGuid(),
                    ConversationId = conversation.Id,
                    SenderUserId = pr.UserId,
                    SenderRole = UserRole.Professional,
                    Content = "Hello! Thanks for reaching out. I'm ready to start and can deliver within 3 days.",
                    CreatedAtUtc = req.CreatedAtUtc.AddHours(2),
                    IsRead = convIdx > 1 // convIdx 0 and 1 have unread incoming messages for live counters
                });

                context.Conversations.Add(conversation);
            }
            await context.SaveChangesAsync();

            // Seed Portfolio Items for Top Doers
            var portfolioDoers = seededDoers.Take(8).ToList();
            var portfolioItems = new List<PortfolioItem>();
            foreach (var pd in portfolioDoers)
            {
                portfolioItems.Add(new PortfolioItem
                {
                    Id = Guid.NewGuid(),
                    ProfessionalProfileId = pd.Id,
                    Title = $"{pd.DisplayName} - Brand Showcase v1",
                    Description = "High-performing viral creative delivered for D2C brand with 3.8x ROAS across social ad channels.",
                    CategorySlug = "ugc-creators",
                    RolePerformed = "Lead Creator & Editor",
                    ToolsUsed = new List<string> { "CapCut", "DaVinci Resolve", "Sony A7IV" },
                    ThumbnailUrl = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80",
                    MediaUrl = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80",
                    MediaType = "image",
                    LiveUrl = "https://instagram.com/sample-creator",
                    IsHidden = false,
                    CreatedAtUtc = DateTime.UtcNow.AddDays(-10)
                });
            }
            context.PortfolioItems.AddRange(portfolioItems);
            await context.SaveChangesAsync();
        }

        // 8. Ensure Dedicated System Admin Account Exists
        var adminEmail = "admin@tnest.com";
        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == adminEmail || u.Role == UserRole.Admin);
        if (existingAdmin == null)
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FullName = "TNEST Platform Admin",
                Email = adminEmail,
                PhoneNumber = "+91 99999 00000",
                PasswordHash = hasher.HashPassword("AdminPass123!"),
                Role = UserRole.Admin,
                IsEmailVerified = true,
                IsPhoneVerified = true,
                CreatedAtUtc = DateTime.UtcNow
            };
            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
        }

        // 9. Seed System Settings
        if (!await context.SystemSettings.AnyAsync())
        {
            context.SystemSettings.AddRange(new List<SystemSetting>
            {
                new SystemSetting { Key = "platform_name", Value = "TNEST Marketplace", Description = "Public platform brand name", Group = "General" },
                new SystemSetting { Key = "support_email", Value = "support@tnest.com", Description = "Primary support email address", Group = "General" },
                new SystemSetting { Key = "auto_moderation_enabled", Value = "true", Description = "Flag suspicious content automatically", Group = "Moderation" },
                new SystemSetting { Key = "report_threshold_auto_hide", Value = "3", Description = "Number of reports before content is temporarily hidden", Group = "Moderation" },
                new SystemSetting { Key = "platform_fee_percent", Value = "5.0", Description = "Standard platform commission fee percentage", Group = "Billing" },
                new SystemSetting { Key = "maintenance_mode", Value = "false", Description = "Put platform into maintenance mode", Group = "System" },
                new SystemSetting { Key = "registration_allowed", Value = "true", Description = "Allow new client/doer account registrations", Group = "Security" },
                new SystemSetting { Key = "max_portfolio_items", Value = "12", Description = "Max portfolio items per professional profile", Group = "Limits" }
            });
            await context.SaveChangesAsync();
        }

        // 10. Seed Taxonomy Roles and Skills if empty
        if (!await context.RoleTaxonomies.AnyAsync())
        {
            var dbCategories = await context.Categories.ToListAsync();
            var taxonomyRoles = new List<RoleTaxonomy>();
            var taxonomySkills = new List<SkillTaxonomy>();

            var roleMap = new Dictionary<string, (string[] Roles, string[] Skills)>
            {
                ["ugc-creators"] = (
                    new[] { "UGC Creator", "Short Form Video Host", "Unboxing Specialist", "Beauty & Skincare Reviewer" },
                    new[] { "Direct-to-Camera", "Product Demos", "TikTok / Reels", "Hook Writing", "CapCut", "Lighting" }
                ),
                ["video-content"] = (
                    new[] { "YouTube Video Editor", "Shorts & Reels Editor", "Motion Graphics Designer", "Colorist & Sound Designer" },
                    new[] { "Adobe Premiere Pro", "DaVinci Resolve", "After Effects", "Kinetic Subtitles", "Sound Design", "Color Grading" }
                ),
                ["design"] = (
                    new[] { "YouTube Thumbnail Artist", "UI/UX Designer", "Brand Identity Designer", "3D Visualization Artist" },
                    new[] { "Figma", "Adobe Photoshop", "Illustrator", "Blender", "Design Systems", "Vector Art" }
                ),
                ["technology"] = (
                    new[] { "Full Stack Web Developer", "Frontend React Engineer", "Backend & API Architect", "Mobile App Developer" },
                    new[] { "React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "C# / .NET", "Docker" }
                ),
                ["writing-content"] = (
                    new[] { "YouTube Scriptwriter", "SEO Blog Writer", "Direct Response Copywriter", "Ghostwriter" },
                    new[] { "Viral Hooks", "Storytelling", "SEO Optimization", "Ad Copy", "Technical Research", "Long-Form Guides" }
                ),
                ["marketing-advertising"] = (
                    new[] { "Performance Ads Specialist", "Social Media Strategist", "SEO Growth Lead", "Email Funnel Architect" },
                    new[] { "Meta Ads", "Google Search Ads", "Klaviyo", "Technical SEO", "Conversion Rate Optimization", "Analytics" }
                ),
                ["music-audio"] = (
                    new[] { "Podcast Audio Engineer", "Voiceover Artist", "Music Producer", "Audio Restoration Specialist" },
                    new[] { "Audition", "Logic Pro", "Mastering", "Noise Removal", "Voice Acting", "Jingle Composition" }
                ),
                ["photography"] = (
                    new[] { "E-Commerce Product Photographer", "Editorial Portrait Photographer", "Photo Retoucher", "Food & Drink Photographer" },
                    new[] { "Studio Lighting", "Lightroom", "High-End Retouching", "Color Matching", "Macro Photography" }
                )
            };

            roleMap["thumbnail-designers"] = roleMap["design"];
            roleMap["video-editors"] = roleMap["video-content"];

            foreach (var cat in dbCategories)
            {
                if (roleMap.TryGetValue(cat.Slug, out var defs) || roleMap.TryGetValue(cat.Name.ToLower().Replace(" ", "-").Replace("&", "and"), out defs))
                {
                    var existingRolesCount = await context.RoleTaxonomies.CountAsync(r => r.CategoryId == cat.Id);
                    if (existingRolesCount == 0)
                    {
                        foreach (var r in defs.Roles)
                        {
                            taxonomyRoles.Add(new RoleTaxonomy
                            {
                                Id = Guid.NewGuid(),
                                CategoryId = cat.Id,
                                Name = r,
                                Slug = r.ToLower().Replace(" ", "-").Replace("&", "and"),
                                Description = $"Professional {r} role within {cat.Name}."
                            });
                        }
                    }

                    var existingSkillsCount = await context.SkillTaxonomies.CountAsync(s => s.CategoryId == cat.Id);
                    if (existingSkillsCount == 0)
                    {
                        foreach (var s in defs.Skills)
                        {
                            taxonomySkills.Add(new SkillTaxonomy
                            {
                                Id = Guid.NewGuid(),
                                CategoryId = cat.Id,
                                Name = s,
                                Slug = s.ToLower().Replace(" ", "-").Replace("/", "-")
                            });
                        }
                    }
                }
            }

            if (taxonomyRoles.Any()) context.RoleTaxonomies.AddRange(taxonomyRoles);
            if (taxonomySkills.Any()) context.SkillTaxonomies.AddRange(taxonomySkills);
            await context.SaveChangesAsync();
        }

        // 11. Seed Sample Moderation Reports and Audit Logs if empty
        if (!await context.Reports.AnyAsync())
        {
            var firstReq = await context.Requirements.FirstOrDefaultAsync();
            var firstDoer = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Professional);
            var firstClient = await context.Users.FirstOrDefaultAsync(u => u.Role == UserRole.Client);

            var sampleReports = new List<Report>
            {
                new Report
                {
                    Id = Guid.NewGuid(),
                    ReporterUserId = firstClient?.Id,
                    ReporterEmail = firstClient?.Email ?? "client@glowskin.com",
                    ReporterName = firstClient?.FullName ?? "Ananya Sharma",
                    TargetType = "Opportunity",
                    TargetId = firstReq?.Id.ToString() ?? Guid.NewGuid().ToString(),
                    TargetTitle = firstReq?.Title ?? "Sample Opportunity Task",
                    ReasonCategory = "Suspicious Contact Request",
                    Details = "Opportunity requested off-platform direct Telegram messaging instead of escrow.",
                    Status = ReportStatus.New,
                    Priority = "High",
                    CreatedAtUtc = DateTime.UtcNow.AddHours(-3)
                },
                new Report
                {
                    Id = Guid.NewGuid(),
                    ReporterUserId = firstDoer?.Id,
                    ReporterEmail = firstDoer?.Email ?? "doer@creator.com",
                    ReporterName = firstDoer?.FullName ?? "Priya Reddy",
                    TargetType = "User",
                    TargetId = firstClient?.Id.ToString() ?? Guid.NewGuid().ToString(),
                    TargetTitle = firstClient?.FullName ?? "Sample Client",
                    ReasonCategory = "Unresponsive Client",
                    Details = "Client has not reviewed deliverables after milestone completion notice.",
                    Status = ReportStatus.UnderReview,
                    Priority = "Medium",
                    CreatedAtUtc = DateTime.UtcNow.AddHours(-18),
                    AdminNotes = "Investigation opened. Reached out to client for milestone status."
                },
                new Report
                {
                    Id = Guid.NewGuid(),
                    ReporterEmail = "community@tnest.com",
                    ReporterName = "System Sentinel",
                    TargetType = "Portfolio",
                    TargetId = Guid.NewGuid().ToString(),
                    TargetTitle = "External Watermarked Portfolio Asset",
                    ReasonCategory = "Copyright Infringement",
                    Details = "Uploaded image contained visible third-party stock photo watermarks.",
                    Status = ReportStatus.Resolved,
                    Priority = "Low",
                    CreatedAtUtc = DateTime.UtcNow.AddDays(-2),
                    ResolvedAtUtc = DateTime.UtcNow.AddDays(-1),
                    AdminNotes = "Item was reviewed and creator notified to re-upload original files."
                }
            };

            context.Reports.AddRange(sampleReports);

            var sampleAuditLogs = new List<AuditLog>
            {
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    AdminEmail = "admin@tnest.com",
                    AdminName = "TNEST Platform Admin",
                    Action = "System.Initialize",
                    TargetType = "System",
                    TargetId = "InitialBootstrap",
                    Reason = "Initial platform setup & database verification",
                    Details = "Verified all 8 top-tier categories, taxonomies, and initial security policies.",
                    CreatedAtUtc = DateTime.UtcNow.AddDays(-3),
                    IpAddress = "127.0.0.1"
                },
                new AuditLog
                {
                    Id = Guid.NewGuid(),
                    AdminEmail = "admin@tnest.com",
                    AdminName = "TNEST Platform Admin",
                    Action = "Settings.Update",
                    TargetType = "SystemSetting",
                    TargetId = "auto_moderation_enabled",
                    Reason = "Enhanced trust and safety enforcement",
                    Details = "Changed value from false to true.",
                    CreatedAtUtc = DateTime.UtcNow.AddDays(-1),
                    IpAddress = "127.0.0.1"
                }
            };

            context.AuditLogs.AddRange(sampleAuditLogs);
            await context.SaveChangesAsync();
        }
    }
}
