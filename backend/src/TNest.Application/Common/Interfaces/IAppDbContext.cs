using TNest.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace TNest.Application.Common.Interfaces;

public interface IAppDbContext
{
    DbSet<User> Users { get; }
    DbSet<RefreshToken> RefreshTokens { get; }
    DbSet<Category> Categories { get; }
    DbSet<RoleTaxonomy> RoleTaxonomies { get; }
    DbSet<SkillTaxonomy> SkillTaxonomies { get; }
    DbSet<ClientProfile> ClientProfiles { get; }
    DbSet<ProfessionalProfile> ProfessionalProfiles { get; }
    DbSet<ProfessionalRole> ProfessionalRoles { get; }
    DbSet<ProfessionalSkill> ProfessionalSkills { get; }
    DbSet<PortfolioItem> PortfolioItems { get; }
    DbSet<Requirement> Requirements { get; }
    DbSet<Proposal> Proposals { get; }
    DbSet<Inquiry> Inquiries { get; }
    DbSet<Conversation> Conversations { get; }
    DbSet<ChatMessage> ChatMessages { get; }
    DbSet<Project> Projects { get; }
    DbSet<ProjectDelivery> ProjectDeliveries { get; }
    DbSet<Review> Reviews { get; }
    DbSet<Report> Reports { get; }
    DbSet<AuditLog> AuditLogs { get; }
    DbSet<SystemSetting> SystemSettings { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
    EntityEntry<TEntity> Entry<TEntity>(TEntity entity) where TEntity : class;
}
