export type UserRole = 'Client' | 'Professional' | 'Admin' | 'DualRole';

export type OpportunityType = 'Task' | 'Job' | 'Freelance' | 'Internship';
export type LocationType = 'Remote' | 'OnSite' | 'Hybrid';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  clientProfileId?: string;
  professionalProfileId?: string;
  slug?: string;
  companyName?: string;
  clientType?: string;
  headline?: string;
  avatarUrl?: string;
  bio?: string;
  businessDescription?: string;
  websiteUrl?: string;
  hourlyRate?: number;
  city?: string;
  state?: string;
  gender?: string;
  dateOfBirth?: string;
  industry?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  otherUrl?: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface CategoryRole {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CategorySkill {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  dynamicSchemaJson: string;
  roles: CategoryRole[];
  skills: CategorySkill[];
}

export interface DynamicFormField {
  fieldId: string;
  label: string;
  type: 'text' | 'select' | 'number' | 'boolean';
  options?: string[];
  required?: boolean;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  rolePerformed: string;
  toolsUsed: string[];
  thumbnailUrl?: string;
  mediaUrl?: string;
  mediaType: string;
  liveUrl?: string;
}

export interface ReviewItem {
  id: string;
  clientName: string;
  clientCompany?: string;
  overallRating: number;
  communicationRating: number;
  qualityRating: number;
  timelinessRating: number;
  comment: string;
  professionalResponse?: string;
  createdAtUtc: string;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  displayName: string;
  email?: string;
  phoneNumber?: string;
  slug: string;
  headline: string;
  bio: string;
  avatarUrl?: string;
  bannerUrl?: string;
  
  // Personal Information
  city?: string;
  state?: string;
  gender?: string;
  dateOfBirth?: string;

  // Experience & Availability
  experienceLevel: string;
  yearsOfExperience: number;
  availabilityStatus: string;
  hourlyRate: number;
  pricingModel?: 'PerTask' | 'PerHour' | 'PerProject' | 'Negotiable' | string;
  startingPrice?: number;
  currency: string;
  turnaroundDays: number;
  languages: string[];
  appearsOnCamera: boolean;
  acceptsProductShipments: boolean;

  // Preferences
  preferredRoles?: string[];
  opportunityTypes?: string[];
  preferredLocationType?: string;
  expectedCompensationMin?: number;
  expectedCompensationMax?: number;

  // Resume
  resumeUrl?: string;
  resumeFileName?: string;

  // Social / Professional Links
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  behanceUrl?: string;
  dribbbleUrl?: string;

  // Reputation & Stats
  averageRating: number;
  completedProjectsCount: number;
  isVerified: boolean;
  roles: { id: string; name: string; categorySlug: string }[];
  skills: { id: string; name: string }[];
  portfolio?: PortfolioItem[];
  reviews?: ReviewItem[];
  reviewCount?: number;
  socialLinks?: { platform: string; url: string }[];
}

// Doer alias for inclusive naming
export type DoerProfile = ProfessionalProfile;

export interface ClientProfile {
  id: string;
  userId: string;
  contactName?: string;
  companyName?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  industry?: string;
  bio?: string;
  businessDescription?: string;
  clientType?: 'Individual' | 'Business' | 'Startup' | 'Agency' | 'Creator' | 'Other' | string;
  city?: string;
  state?: string;
  gender?: string;
  dateOfBirth?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  otherUrl?: string;
  email?: string;
  phoneNumber?: string;
  rating?: number;
  reviewsCount?: number;
  completedProjectsCount?: number;
  postedRequirementsCount?: number;
  activeProjectsCount?: number;
  createdAtUtc?: string;
  activeOpportunities?: Requirement[];
  reviews?: ReviewItem[];
}

export interface RequirementApplicant {
  id: string;
  requirementId: string;
  professionalProfileId: string;
  proDisplayName: string;
  proHeadline: string;
  proAvatarUrl?: string;
  proSlug?: string;
  proRating: number;
  proExperienceLevel: string;
  proHourlyRate: number;
  proSkills: string[];
  proRoles: string[];
  coverLetter: string;
  proposedPrice: number;
  estimatedDays: number;
  status: 'Submitted' | 'Shortlisted' | 'Accepted' | 'Declined' | string;
  createdAtUtc: string;
}

export interface Requirement {
  id: string;
  clientProfileId?: string;
  clientName?: string;
  clientCompany?: string;
  categoryId: string;
  categoryName?: string;
  categorySlug?: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  expectedDeliveryDays: number;
  requiredLanguages: string[];
  requiresOnCamera: boolean;
  requiresProductShipment: boolean;
  dynamicAttributesJson: string;
  isPublicListing: boolean;
  status: string;
  proposalsCount?: number;
  createdAtUtc: string;
  proposals?: Proposal[];
  // Enriched marketplace fields
  opportunityType?: OpportunityType;
  vacanciesCount?: number;
  locationType?: LocationType;
  city?: string;
  rolesNeeded?: string[];
  requiredSkills?: string[];
  responsibilities?: string[];
  deliverables?: string[];
  taskId?: string;
  expectedTimeline?: string;
  clientRating?: number;
  clientReviewsCount?: number;
  clientAvatar?: string;
  attachments?: {
    id: string;
    name: string;
    size: string;
    type: string;
    url?: string;
  }[];
}

export interface Proposal {
  id: string;
  requirementId: string;
  requirementTitle?: string;
  categoryName?: string;
  clientCompany?: string;
  professionalProfileId: string;
  professionalName?: string;
  professionalSlug?: string;
  avatarUrl?: string;
  coverLetter: string;
  proposedPrice: number;
  estimatedDays: number;
  status: 'Submitted' | 'Shortlisted' | 'Selected' | 'Rejected' | 'Withdrawn' | string;
  createdAtUtc: string;
}

export interface ApplicationItem {
  id: string;
  requirementId: string;
  requirementTitle: string;
  categoryName: string;
  clientName: string;
  clientCompany?: string;
  proposedPrice: number;
  estimatedDays: number;
  status: 'Pending' | 'Shortlisted' | 'Selected' | 'Rejected' | 'Withdrawn';
  createdAtUtc: string;
}

export interface MyWorkItem {
  id: string;
  title: string;
  clientName: string;
  clientCompany?: string;
  agreedPrice: number;
  currency: string;
  deadlineUtc?: string;
  status: 'Assigned' | 'InProgress' | 'Submitted' | 'RevisionRequested' | 'Completed' | 'Cancelled';
  requiresShipment: boolean;
  courierName?: string;
  trackingNumber?: string;
  productShippedAtUtc?: string;
  createdAtUtc: string;
}

export interface ConversationItem {
  id: string;
  clientProfileId: string;
  clientName: string;
  clientAvatar?: string;
  professionalProfileId: string;
  professionalName: string;
  professionalAvatar?: string;
  requirementId?: string;
  requirementTitle?: string;
  projectId?: string;
  lastMessageAtUtc: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface ChatMessageItem {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderRole: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  isRead: boolean;
  createdAtUtc: string;
}

export interface ProjectDeliveryItem {
  id: string;
  versionNumber: number;
  notes: string;
  deliveryUrlsJson: string;
  status: string;
  revisionFeedback?: string;
  createdAtUtc: string;
  reviewedAtUtc?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  clientProfileId: string;
  clientName: string;
  clientCompany?: string;
  professionalProfileId: string;
  professionalName: string;
  professionalAvatar?: string;
  professionalSlug?: string;
  agreedPrice: number;
  currency: string;
  deadlineUtc?: string;
  status: string;
  requiresShipment: boolean;
  courierName?: string;
  trackingNumber?: string;
  productShippedAtUtc?: string;
  productReceivedAtUtc?: string;
  createdAtUtc: string;
  completedAtUtc?: string;
  deliveries: ProjectDeliveryItem[];
  review?: ReviewItem;
}

export interface MatchScoreResult {
  professionalProfileId: string;
  displayName: string;
  slug: string;
  headline: string;
  avatarUrl?: string;
  hourlyRate: number;
  currency: string;
  turnaroundDays: number;
  averageRating: number;
  completedProjectsCount: number;
  languages: string[];
  appearsOnCamera: boolean;
  acceptsProductShipments: boolean;
  totalScore: number;
  roleScore: number;
  skillsScore: number;
  languageScore: number;
  budgetAndSlaScore: number;
  breakdownPills: string[];
  isRecommended: boolean;
  topPortfolio: { id: string; title: string; thumbnailUrl?: string; mediaUrl?: string }[];
}

export interface UniversalSearchResult {
  query: string;
  opportunities: Requirement[];
  doers: ProfessionalProfile[];
  categories: Category[];
  matchedSkills: string[];
  matchedRoles: string[];
}

export interface AdminDashboardMetrics {
  summary: {
    totalUsers: number;
    totalClients: number;
    totalDoers: number;
    suspendedUsers: number;
    totalOpportunities: number;
    openOpportunities: number;
    hiddenOpportunities: number;
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    pendingApplications?: number;
    totalApplications?: number;
    pendingReports: number;
    resolvedReports: number;
    totalReports: number;
    pendingModeration: number;
  };
  recentActivity: AdminAuditLogItem[];
  recentReports: AdminReportItem[];
}

export interface AdminUserListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  suspensionReason?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAtUtc: string;
  avatarUrl?: string;
  companyName?: string;
  headline?: string;
  rating: number;
  completedProjects: number;
}

export interface AdminUserDetail {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  suspensionReason?: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAtUtc: string;
  clientProfile?: any;
  professionalProfile?: {
    id: string;
    displayName: string;
    headline: string;
    bio: string;
    avatarUrl?: string;
    bannerUrl?: string;
    experienceLevel: string;
    yearsOfExperience: number;
    availabilityStatus: string;
    hourlyRate: number;
    currency: string;
    turnaroundDays: number;
    languages: string[];
    appearsOnCamera: boolean;
    averageRating: number;
    completedProjectsCount: number;
    isVerified: boolean;
    roles: string[];
    skills: string[];
    portfolio: any[];
  };
  stats: {
    requirementsCount: number;
    proposalsCount: number;
    projectsCount: number;
    reportsCount: number;
  };
}

export interface AdminOpportunityItem {
  id: string;
  title: string;
  description: string;
  category: string;
  categorySlug: string;
  clientName: string;
  clientEmail: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  expectedDeliveryDays: number;
  requiresOnCamera: boolean;
  requiresProductShipment: boolean;
  isHidden: boolean;
  moderationReason?: string;
  status: string;
  createdAtUtc: string;
}

export interface AdminReportItem {
  id: string;
  reporterUserId?: string;
  reporterName: string;
  reporterEmail: string;
  targetType: string;
  targetId: string;
  targetTitle: string;
  targetOwnerName?: string;
  reasonCategory: string;
  reason?: string;
  details: string;
  priority: string;
  status: 'New' | 'UnderReview' | 'Resolved' | 'Dismissed';
  adminNotes?: string;
  resolutionAction?: string;
  assignedAdminEmail?: string;
  createdAtUtc: string;
  resolvedAtUtc?: string;
}

export interface AdminPortfolioItem {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  rolePerformed: string;
  toolsUsed: string[];
  thumbnailUrl?: string;
  mediaUrl?: string;
  mediaType: string;
  liveUrl?: string;
  isHidden: boolean;
  moderationReason?: string;
  creatorName: string;
  creatorEmail: string;
  createdAtUtc: string;
}

export interface AdminReviewItem {
  id: string;
  projectId: string;
  overallRating: number;
  communicationRating: number;
  qualityRating: number;
  timelinessRating: number;
  comment: string;
  professionalResponse?: string;
  isHidden: boolean;
  moderationReason?: string;
  clientName: string;
  clientEmail: string;
  doerName: string;
  doerEmail: string;
  createdAtUtc: string;
}

export interface AdminAuditLogItem {
  id: string;
  adminUserId?: string;
  adminEmail: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  details?: string;
  ipAddress?: string;
  createdAtUtc: string;
}

export interface AdminSystemSetting {
  id: string;
  key: string;
  value: string;
  description: string;
  group: string;
  updatedAtUtc: string;
}

