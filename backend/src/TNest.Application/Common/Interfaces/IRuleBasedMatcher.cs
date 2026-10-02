using TNest.Domain.Entities;

namespace TNest.Application.Common.Interfaces;

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
