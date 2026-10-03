using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TNest.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuditLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AdminUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    AdminEmail = table.Column<string>(type: "text", nullable: false),
                    AdminName = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    TargetType = table.Column<string>(type: "text", nullable: false),
                    TargetId = table.Column<string>(type: "text", nullable: false),
                    TargetName = table.Column<string>(type: "text", nullable: true),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: true),
                    IpAddress = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Icon = table.Column<string>(type: "text", nullable: false),
                    DynamicSchemaJson = table.Column<string>(type: "text", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Reports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReporterUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ReporterName = table.Column<string>(type: "text", nullable: false),
                    ReporterEmail = table.Column<string>(type: "text", nullable: false),
                    TargetType = table.Column<string>(type: "text", nullable: false),
                    TargetId = table.Column<string>(type: "text", nullable: false),
                    TargetTitle = table.Column<string>(type: "text", nullable: false),
                    TargetOwnerName = table.Column<string>(type: "text", nullable: false),
                    ReasonCategory = table.Column<string>(type: "text", nullable: false),
                    Reason = table.Column<string>(type: "text", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: false),
                    Priority = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AdminNotes = table.Column<string>(type: "text", nullable: true),
                    ResolutionAction = table.Column<string>(type: "text", nullable: true),
                    AssignedAdminId = table.Column<Guid>(type: "uuid", nullable: true),
                    AssignedAdminName = table.Column<string>(type: "text", nullable: true),
                    AssignedAdminEmail = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ResolvedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reports", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Group = table.Column<string>(type: "text", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FullName = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PhoneNumber = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false),
                    IsEmailVerified = table.Column<bool>(type: "boolean", nullable: false),
                    IsPhoneVerified = table.Column<bool>(type: "boolean", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SuspensionReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "RoleTaxonomies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleTaxonomies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RoleTaxonomies_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SkillTaxonomies",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SkillTaxonomies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SkillTaxonomies_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ClientProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompanyName = table.Column<string>(type: "text", nullable: true),
                    ContactName = table.Column<string>(type: "text", nullable: true),
                    AvatarUrl = table.Column<string>(type: "text", nullable: true),
                    WebsiteUrl = table.Column<string>(type: "text", nullable: true),
                    Industry = table.Column<string>(type: "text", nullable: true),
                    Bio = table.Column<string>(type: "text", nullable: true),
                    BusinessDescription = table.Column<string>(type: "text", nullable: true),
                    ClientType = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    State = table.Column<string>(type: "text", nullable: true),
                    Gender = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<string>(type: "text", nullable: true),
                    LinkedinUrl = table.Column<string>(type: "text", nullable: true),
                    InstagramUrl = table.Column<string>(type: "text", nullable: true),
                    YoutubeUrl = table.Column<string>(type: "text", nullable: true),
                    OtherUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ClientProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ClientProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalProfiles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    DisplayName = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    Headline = table.Column<string>(type: "text", nullable: false),
                    Bio = table.Column<string>(type: "text", nullable: false),
                    AvatarUrl = table.Column<string>(type: "text", nullable: true),
                    BannerUrl = table.Column<string>(type: "text", nullable: true),
                    City = table.Column<string>(type: "text", nullable: true),
                    State = table.Column<string>(type: "text", nullable: true),
                    Gender = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<string>(type: "text", nullable: true),
                    ExperienceLevel = table.Column<string>(type: "text", nullable: false),
                    YearsOfExperience = table.Column<int>(type: "integer", nullable: false),
                    AvailabilityStatus = table.Column<string>(type: "text", nullable: false),
                    HourlyRate = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    TurnaroundDays = table.Column<int>(type: "integer", nullable: false),
                    Languages = table.Column<string>(type: "text", nullable: false),
                    AppearsOnCamera = table.Column<bool>(type: "boolean", nullable: false),
                    AcceptsProductShipments = table.Column<bool>(type: "boolean", nullable: false),
                    AverageRating = table.Column<decimal>(type: "numeric", nullable: false),
                    CompletedProjectsCount = table.Column<int>(type: "integer", nullable: false),
                    IsVerified = table.Column<bool>(type: "boolean", nullable: false),
                    PreferredRoles = table.Column<string>(type: "text", nullable: false),
                    OpportunityTypes = table.Column<string>(type: "text", nullable: false),
                    PreferredLocationType = table.Column<string>(type: "text", nullable: false),
                    ExpectedCompensationMin = table.Column<decimal>(type: "numeric", nullable: false),
                    ExpectedCompensationMax = table.Column<decimal>(type: "numeric", nullable: false),
                    ResumeUrl = table.Column<string>(type: "text", nullable: true),
                    ResumeFileName = table.Column<string>(type: "text", nullable: true),
                    WebsiteUrl = table.Column<string>(type: "text", nullable: true),
                    GithubUrl = table.Column<string>(type: "text", nullable: true),
                    LinkedinUrl = table.Column<string>(type: "text", nullable: true),
                    InstagramUrl = table.Column<string>(type: "text", nullable: true),
                    YoutubeUrl = table.Column<string>(type: "text", nullable: true),
                    BehanceUrl = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalProfiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfessionalProfiles_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "RefreshTokens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Token = table.Column<string>(type: "text", nullable: false),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RevokedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedByIp = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RefreshTokens", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RefreshTokens_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Requirements",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    BudgetMin = table.Column<decimal>(type: "numeric", nullable: false),
                    BudgetMax = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    ExpectedDeliveryDays = table.Column<int>(type: "integer", nullable: false),
                    RequiredLanguages = table.Column<string>(type: "text", nullable: false),
                    RequiresOnCamera = table.Column<bool>(type: "boolean", nullable: false),
                    RequiresProductShipment = table.Column<bool>(type: "boolean", nullable: false),
                    DynamicAttributesJson = table.Column<string>(type: "text", nullable: false),
                    IsPublicListing = table.Column<bool>(type: "boolean", nullable: false),
                    IsHidden = table.Column<bool>(type: "boolean", nullable: false),
                    ModerationReason = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Requirements_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Requirements_ClientProfiles_ClientProfileId",
                        column: x => x.ClientProfileId,
                        principalTable: "ClientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PortfolioItems",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    CategorySlug = table.Column<string>(type: "text", nullable: false),
                    RolePerformed = table.Column<string>(type: "text", nullable: false),
                    ToolsUsed = table.Column<string>(type: "text", nullable: false),
                    ThumbnailUrl = table.Column<string>(type: "text", nullable: true),
                    MediaUrl = table.Column<string>(type: "text", nullable: true),
                    MediaType = table.Column<string>(type: "text", nullable: false),
                    LiveUrl = table.Column<string>(type: "text", nullable: true),
                    IsHidden = table.Column<bool>(type: "boolean", nullable: false),
                    ModerationReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PortfolioItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PortfolioItems_ProfessionalProfiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalRoles",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleTaxonomyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalRoles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfessionalRoles_ProfessionalProfiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfessionalRoles_RoleTaxonomies_RoleTaxonomyId",
                        column: x => x.RoleTaxonomyId,
                        principalTable: "RoleTaxonomies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProfessionalSkills",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    SkillTaxonomyId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfessionalSkills", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProfessionalSkills_ProfessionalProfiles_ProfessionalProfile~",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProfessionalSkills_SkillTaxonomies_SkillTaxonomyId",
                        column: x => x.SkillTaxonomyId,
                        principalTable: "SkillTaxonomies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Conversations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastMessageAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Conversations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Conversations_ClientProfiles_ClientProfileId",
                        column: x => x.ClientProfileId,
                        principalTable: "ClientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Conversations_ProfessionalProfiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Conversations_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalTable: "Requirements",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Inquiries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: true),
                    InitialMessage = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Inquiries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Inquiries_ClientProfiles_ClientProfileId",
                        column: x => x.ClientProfileId,
                        principalTable: "ClientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Inquiries_ProfessionalProfiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Inquiries_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalTable: "Requirements",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Proposals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    CoverLetter = table.Column<string>(type: "text", nullable: false),
                    ProposedPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    EstimatedDays = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Proposals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Proposals_ProfessionalProfiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Proposals_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalTable: "Requirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ChatMessages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ConversationId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderRole = table.Column<string>(type: "text", nullable: false),
                    Content = table.Column<string>(type: "text", nullable: false),
                    AttachmentUrl = table.Column<string>(type: "text", nullable: true),
                    AttachmentName = table.Column<string>(type: "text", nullable: true),
                    AttachmentType = table.Column<string>(type: "text", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChatMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChatMessages_Conversations_ConversationId",
                        column: x => x.ConversationId,
                        principalTable: "Conversations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: true),
                    ProposalId = table.Column<Guid>(type: "uuid", nullable: true),
                    Title = table.Column<string>(type: "text", nullable: false),
                    AgreedPrice = table.Column<decimal>(type: "numeric", nullable: false),
                    Currency = table.Column<string>(type: "text", nullable: false),
                    DeadlineUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    RequiresShipment = table.Column<bool>(type: "boolean", nullable: false),
                    CourierName = table.Column<string>(type: "text", nullable: true),
                    TrackingNumber = table.Column<string>(type: "text", nullable: true),
                    ProductShippedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ProductReceivedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_ClientProfiles_ClientProfileId",
                        column: x => x.ClientProfileId,
                        principalTable: "ClientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Projects_ProfessionalProfiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Projects_Proposals_ProposalId",
                        column: x => x.ProposalId,
                        principalTable: "Proposals",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Projects_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalTable: "Requirements",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "ProjectDeliveries",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    DeliveryUrlsJson = table.Column<string>(type: "text", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    RevisionFeedback = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectDeliveries", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectDeliveries_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    ClientProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProfessionalProfileId = table.Column<Guid>(type: "uuid", nullable: false),
                    OverallRating = table.Column<int>(type: "integer", nullable: false),
                    CommunicationRating = table.Column<int>(type: "integer", nullable: false),
                    QualityRating = table.Column<int>(type: "integer", nullable: false),
                    TimelinessRating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "text", nullable: false),
                    ProfessionalResponse = table.Column<string>(type: "text", nullable: true),
                    IsHidden = table.Column<bool>(type: "boolean", nullable: false),
                    ModerationReason = table.Column<string>(type: "text", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_ClientProfiles_ClientProfileId",
                        column: x => x.ClientProfileId,
                        principalTable: "ClientProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_ProfessionalProfiles_ProfessionalProfileId",
                        column: x => x.ProfessionalProfileId,
                        principalTable: "ProfessionalProfiles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reviews_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_Action",
                table: "AuditLogs",
                column: "Action");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_AdminUserId",
                table: "AuditLogs",
                column: "AdminUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AuditLogs_CreatedAtUtc",
                table: "AuditLogs",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_ConversationId",
                table: "ChatMessages",
                column: "ConversationId");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_CreatedAtUtc",
                table: "ChatMessages",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_ChatMessages_SenderUserId",
                table: "ChatMessages",
                column: "SenderUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ClientProfiles_UserId",
                table: "ClientProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ClientProfileId",
                table: "Conversations",
                column: "ClientProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_LastMessageAtUtc",
                table: "Conversations",
                column: "LastMessageAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ProfessionalProfileId",
                table: "Conversations",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_ProjectId",
                table: "Conversations",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Conversations_RequirementId",
                table: "Conversations",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_ClientProfileId",
                table: "Inquiries",
                column: "ClientProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_ProfessionalProfileId",
                table: "Inquiries",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Inquiries_RequirementId",
                table: "Inquiries",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_PortfolioItems_ProfessionalProfileId",
                table: "PortfolioItems",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalProfiles_AcceptsProductShipments",
                table: "ProfessionalProfiles",
                column: "AcceptsProductShipments");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalProfiles_AppearsOnCamera",
                table: "ProfessionalProfiles",
                column: "AppearsOnCamera");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalProfiles_AvailabilityStatus",
                table: "ProfessionalProfiles",
                column: "AvailabilityStatus");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalProfiles_HourlyRate",
                table: "ProfessionalProfiles",
                column: "HourlyRate");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalProfiles_Slug",
                table: "ProfessionalProfiles",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalProfiles_UserId",
                table: "ProfessionalProfiles",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalRoles_ProfessionalProfileId",
                table: "ProfessionalRoles",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalRoles_RoleTaxonomyId",
                table: "ProfessionalRoles",
                column: "RoleTaxonomyId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalSkills_ProfessionalProfileId",
                table: "ProfessionalSkills",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_ProfessionalSkills_SkillTaxonomyId",
                table: "ProfessionalSkills",
                column: "SkillTaxonomyId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDeliveries_ProjectId",
                table: "ProjectDeliveries",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectDeliveries_Status",
                table: "ProjectDeliveries",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ClientProfileId",
                table: "Projects",
                column: "ClientProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CreatedAtUtc",
                table: "Projects",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ProfessionalProfileId",
                table: "Projects",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_ProposalId",
                table: "Projects",
                column: "ProposalId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_RequirementId",
                table: "Projects",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_Status",
                table: "Projects",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Proposals_CreatedAtUtc",
                table: "Proposals",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Proposals_ProfessionalProfileId",
                table: "Proposals",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Proposals_RequirementId",
                table: "Proposals",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_Proposals_RequirementId_ProfessionalProfileId",
                table: "Proposals",
                columns: new[] { "RequirementId", "ProfessionalProfileId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Proposals_Status",
                table: "Proposals",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_Token",
                table: "RefreshTokens",
                column: "Token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RefreshTokens_UserId",
                table: "RefreshTokens",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_Status",
                table: "Reports",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_TargetType_TargetId",
                table: "Reports",
                columns: new[] { "TargetType", "TargetId" });

            migrationBuilder.CreateIndex(
                name: "IX_Requirements_CategoryId",
                table: "Requirements",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Requirements_ClientProfileId",
                table: "Requirements",
                column: "ClientProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Requirements_CreatedAtUtc",
                table: "Requirements",
                column: "CreatedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_Requirements_Status",
                table: "Requirements",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ClientProfileId",
                table: "Reviews",
                column: "ClientProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ProfessionalProfileId",
                table: "Reviews",
                column: "ProfessionalProfileId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ProjectId",
                table: "Reviews",
                column: "ProjectId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RoleTaxonomies_CategoryId",
                table: "RoleTaxonomies",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_SkillTaxonomies_CategoryId",
                table: "SkillTaxonomies",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_Key",
                table: "SystemSettings",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_PhoneNumber",
                table: "Users",
                column: "PhoneNumber");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditLogs");

            migrationBuilder.DropTable(
                name: "ChatMessages");

            migrationBuilder.DropTable(
                name: "Inquiries");

            migrationBuilder.DropTable(
                name: "PortfolioItems");

            migrationBuilder.DropTable(
                name: "ProfessionalRoles");

            migrationBuilder.DropTable(
                name: "ProfessionalSkills");

            migrationBuilder.DropTable(
                name: "ProjectDeliveries");

            migrationBuilder.DropTable(
                name: "RefreshTokens");

            migrationBuilder.DropTable(
                name: "Reports");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropTable(
                name: "Conversations");

            migrationBuilder.DropTable(
                name: "RoleTaxonomies");

            migrationBuilder.DropTable(
                name: "SkillTaxonomies");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Proposals");

            migrationBuilder.DropTable(
                name: "ProfessionalProfiles");

            migrationBuilder.DropTable(
                name: "Requirements");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "ClientProfiles");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
