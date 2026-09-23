export type UserRole = 'Client' | 'Professional' | 'Admin';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  clientProfileId?: string;
  professionalProfileId?: string;
  slug?: string;
}

export interface AuthSession {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  dynamicSchemaJson: string;
  roles: { id: string; name: string; slug: string; description: string }[];
  skills: { id: string; name: string; slug: string }[];
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
  slug: string;
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
  acceptsProductShipments: boolean;
  averageRating: number;
  completedProjectsCount: number;
  isVerified: boolean;
  roles: { id: string; name: string; categorySlug: string }[];
  skills: { id: string; name: string }[];
  portfolio?: PortfolioItem[];
  reviews?: ReviewItem[];
  reviewCount?: number;
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
  status: string;
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
