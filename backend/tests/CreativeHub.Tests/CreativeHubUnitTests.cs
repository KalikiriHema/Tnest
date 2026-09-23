using CreativeHub.Core.Entities;
using CreativeHub.Infrastructure.Matching;
using CreativeHub.Infrastructure.Security;

namespace CreativeHub.Tests;

public class CreativeHubUnitTests
{
    [Fact]
    public void Argon2PasswordHasher_Should_Hash_And_Verify_Correctly()
    {
        var hasher = new Argon2PasswordHasher();
        var password = "SecurePassword@2026!";

        var hash = hasher.HashPassword(password);
        Assert.NotNull(hash);
        Assert.Contains(":", hash);

        var isValid = hasher.VerifyPassword(password, hash);
        Assert.True(isValid);

        var isInvalid = hasher.VerifyPassword("WrongPassword123", hash);
        Assert.False(isInvalid);
    }

    [Fact]
    public void JwtTokenService_Should_Generate_Valid_Tokens_With_Claims()
    {
        var jwtService = new JwtTokenService();
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Rohan Gupta",
            Email = "rohan@test.com",
            PhoneNumber = "+91 99999 88888",
            Role = UserRole.Client,
            ClientProfile = new ClientProfile { Id = Guid.NewGuid() }
        };

        var (accessToken, expiresAt) = jwtService.GenerateAccessToken(user);
        Assert.False(string.IsNullOrWhiteSpace(accessToken));
        Assert.True(expiresAt > DateTime.UtcNow);

        var (refreshToken, refreshExpires) = jwtService.GenerateRefreshToken();
        Assert.False(string.IsNullOrWhiteSpace(refreshToken));
        Assert.True(refreshExpires > DateTime.UtcNow);
    }

    [Fact]
    public void RuleBasedMatcher_Should_Score_Exact_Role_And_Languages_Higher()
    {
        var matcher = new RuleBasedMatcher();
        var catId = Guid.NewGuid();
        var req = new Requirement
        {
            Id = Guid.NewGuid(),
            CategoryId = catId,
            Title = "Need Telugu UGC Creator",
            RequiredLanguages = new List<string> { "Telugu", "English" },
            RequiresOnCamera = true,
            RequiresProductShipment = true,
            ExpectedDeliveryDays = 4,
            BudgetMax = 20000
        };

        var role = new RoleTaxonomy { Id = Guid.NewGuid(), CategoryId = catId, Name = "UGC Creator" };

        var perfectMatchPro = new ProfessionalProfile
        {
            Id = Guid.NewGuid(),
            DisplayName = "Telugu Creator Pro",
            Languages = new List<string> { "Telugu", "English" },
            AppearsOnCamera = true,
            AcceptsProductShipments = true,
            TurnaroundDays = 3,
            HourlyRate = 2000,
            ProfessionalRoles = new List<ProfessionalRole>
            {
                new() { RoleTaxonomy = role }
            }
        };

        var partialMatchPro = new ProfessionalProfile
        {
            Id = Guid.NewGuid(),
            DisplayName = "English Only Pro",
            Languages = new List<string> { "English" },
            AppearsOnCamera = false,
            AcceptsProductShipments = false,
            TurnaroundDays = 7,
            HourlyRate = 5000,
            ProfessionalRoles = new List<ProfessionalRole>()
        };

        var results = matcher.MatchProfessionalsForRequirement(req, new[] { perfectMatchPro, partialMatchPro });

        Assert.Equal(2, results.Count);
        Assert.Equal(perfectMatchPro.Id, results[0].ProfessionalProfileId);
        Assert.True(results[0].TotalScore > results[1].TotalScore);
        Assert.True(results[0].IsRecommended);
        Assert.Contains(results[0].BreakdownPills, p => p.Contains("Telugu"));
    }
}
