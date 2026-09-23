using CreativeHub.Core.Entities;

namespace CreativeHub.Infrastructure.Matching;

public class MatchScoreResult
{
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public int TotalScore { get; set; } // 0 - 100
    public int RoleScore { get; set; }
    public int SkillsScore { get; set; }
    public int LanguageScore { get; set; }
    public int BudgetAndSlaScore { get; set; }
    public List<string> BreakdownPills { get; set; } = new();
    public bool IsRecommended { get; set; }
}

public interface IRuleBasedMatcher
{
    List<MatchScoreResult> MatchProfessionalsForRequirement(Requirement requirement, IEnumerable<ProfessionalProfile> candidates);
}

public class RuleBasedMatcher : IRuleBasedMatcher
{
    public List<MatchScoreResult> MatchProfessionalsForRequirement(Requirement requirement, IEnumerable<ProfessionalProfile> candidates)
    {
        var results = new List<MatchScoreResult>();

        foreach (var pro in candidates)
        {
            var result = new MatchScoreResult
            {
                ProfessionalProfileId = pro.Id,
                ProfessionalProfile = pro
            };

            var pills = new List<string>();

            // 1. Role / Category match (Max 40 points)
            bool hasCategoryRole = pro.ProfessionalRoles.Any(pr => pr.RoleTaxonomy != null && pr.RoleTaxonomy.CategoryId == requirement.CategoryId);
            if (hasCategoryRole)
            {
                result.RoleScore = 40;
                pills.Add("Role: Verified Specialist");
            }
            else
            {
                result.RoleScore = 15;
            }

            // 2. Language match (Max 20 points)
            if (requirement.RequiredLanguages.Count == 0)
            {
                result.LanguageScore = 20;
            }
            else
            {
                var matchedLangs = requirement.RequiredLanguages
                    .Where(rl => pro.Languages.Any(pl => pl.Equals(rl, StringComparison.OrdinalIgnoreCase)))
                    .ToList();

                if (matchedLangs.Count == requirement.RequiredLanguages.Count)
                {
                    result.LanguageScore = 20;
                    pills.Add($"Languages: {string.Join(" + ", matchedLangs)} Matched");
                }
                else if (matchedLangs.Count > 0)
                {
                    result.LanguageScore = (int)((double)matchedLangs.Count / requirement.RequiredLanguages.Count * 20);
                    pills.Add($"Languages: {string.Join(" + ", matchedLangs)} ({matchedLangs.Count}/{requirement.RequiredLanguages.Count})");
                }
                else
                {
                    result.LanguageScore = 0;
                }
            }

            // 3. On-Camera & Shipping match (Max 15 points)
            int cameraAndShipScore = 15;
            if (requirement.RequiresOnCamera)
            {
                if (pro.AppearsOnCamera)
                {
                    pills.Add("On-Camera: Ready");
                }
                else
                {
                    cameraAndShipScore -= 8;
                }
            }

            if (requirement.RequiresProductShipment)
            {
                if (pro.AcceptsProductShipments)
                {
                    pills.Add("Product Shipment: Accepted");
                }
                else
                {
                    cameraAndShipScore -= 7;
                }
            }
            result.SkillsScore = Math.Max(0, cameraAndShipScore) + (pro.ProfessionalSkills.Count > 0 ? 10 : 5);
            if (pro.ProfessionalSkills.Count > 0)
            {
                pills.Add($"Skills: {pro.ProfessionalSkills.Count} Verified");
            }

            // 4. Budget & SLA Turnaround (Max 15 points)
            int budgetSlaScore = 0;
            if (pro.TurnaroundDays <= requirement.ExpectedDeliveryDays)
            {
                budgetSlaScore += 8;
                pills.Add($"SLA: {pro.TurnaroundDays}d (Within {requirement.ExpectedDeliveryDays}d)");
            }
            else
            {
                budgetSlaScore += 3;
            }

            // Budget estimate check (assuming standard project estimate vs hourly)
            decimal estimatedRate = pro.HourlyRate * 5; // standard unit
            if (requirement.BudgetMax > 0 && estimatedRate <= requirement.BudgetMax)
            {
                budgetSlaScore += 7;
                pills.Add("Budget: High Compatibility");
            }
            else
            {
                budgetSlaScore += 4;
            }
            result.BudgetAndSlaScore = budgetSlaScore;

            result.TotalScore = Math.Clamp(result.RoleScore + result.SkillsScore + result.LanguageScore + result.BudgetAndSlaScore, 0, 100);
            result.IsRecommended = result.TotalScore >= 75;
            result.BreakdownPills = pills;

            results.Add(result);
        }

        return results.OrderByDescending(r => r.TotalScore).ToList();
    }
}
