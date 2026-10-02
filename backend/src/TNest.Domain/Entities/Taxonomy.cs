namespace TNest.Domain.Entities;

public class Category
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Icon { get; set; } = string.Empty;
    public string DynamicSchemaJson { get; set; } = "[]"; // Dynamic form field definitions
    public bool IsArchived { get; set; } = false;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;

    public ICollection<RoleTaxonomy> Roles { get; set; } = new List<RoleTaxonomy>();
    public ICollection<SkillTaxonomy> Skills { get; set; } = new List<SkillTaxonomy>();
}

public class RoleTaxonomy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public bool IsArchived { get; set; } = false;
}

public class SkillTaxonomy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CategoryId { get; set; }
    public Category Category { get; set; } = null!;
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public bool IsArchived { get; set; } = false;
}

public class ProfessionalRole
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public Guid RoleTaxonomyId { get; set; }
    public RoleTaxonomy RoleTaxonomy { get; set; } = null!;
}

public class ProfessionalSkill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public Guid SkillTaxonomyId { get; set; }
    public SkillTaxonomy SkillTaxonomy { get; set; } = null!;
}

public class PortfolioItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProfessionalProfileId { get; set; }
    public ProfessionalProfile ProfessionalProfile { get; set; } = null!;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string CategorySlug { get; set; } = string.Empty;
    public string RolePerformed { get; set; } = string.Empty;
    public List<string> ToolsUsed { get; set; } = new();
    public string? ThumbnailUrl { get; set; }
    public string? MediaUrl { get; set; }
    public string MediaType { get; set; } = "Video"; // Video, Image, Audio, Document
    public string? LiveUrl { get; set; }
    public bool IsHidden { get; set; } = false;
    public string? ModerationReason { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
