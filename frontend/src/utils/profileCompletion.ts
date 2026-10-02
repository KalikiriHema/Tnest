import { User } from '../types';

export interface ClientProfileData {
  fullName?: string;
  contactName?: string;
  email?: string;
  phoneNumber?: string;
  companyName?: string;
  avatarUrl?: string;
  websiteUrl?: string;
  bio?: string;
}

export interface ProProfileData {
  fullName?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  headline?: string;
  bio?: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  hourlyRate?: number;
  experienceLevel?: string;
  websiteUrl?: string;
  resumeUrl?: string;
  roles?: any[];
  skills?: any[];
  portfolio?: any[];
}

/**
 * Calculates Client profile completion percentage consistently across all components.
 * Total: 100%
 */
export function calculateClientCompletion(data: ClientProfileData): number {
  if (!data) return 0;
  let score = 0;

  const contact = (data.contactName || data.fullName || '').trim();
  if (contact) score += 15;

  const email = (data.email || '').trim();
  if (email) score += 15;

  const company = (data.companyName || '').trim();
  if (company) score += 15;

  const phone = (data.phoneNumber || '').trim();
  if (phone) score += 15;

  const avatar = (data.avatarUrl || '').trim();
  if (avatar && !avatar.includes('placeholder')) score += 15;

  const bio = (data.bio || '').trim();
  if (bio.length >= 15) score += 15;

  const website = (data.websiteUrl || '').trim();
  if (website) score += 10;

  return Math.min(100, Math.max(0, score));
}

/**
 * Calculates Specialist / Doer profile completion percentage consistently across all components.
 * Total: 100%
 */
export function calculateProCompletion(data: ProProfileData): number {
  if (!data) return 0;
  let score = 0;

  const name = (data.displayName || data.fullName || '').trim();
  if (name) score += 10;

  const contact = (data.email || '').trim() || (data.phoneNumber || '').trim();
  if (contact) score += 10;

  const headline = (data.headline || '').trim();
  if (headline) score += 15;

  const bio = (data.bio || '').trim();
  if (bio.length >= 15) score += 15;

  const avatar = (data.avatarUrl || '').trim();
  if (avatar && !avatar.includes('placeholder')) score += 10;

  const location = (data.city || data.state || '').trim();
  if (location) score += 10;

  const rate = Number(data.hourlyRate);
  if (!isNaN(rate) && rate > 0) score += 15;

  const links = (data.websiteUrl || '').trim() || (data.resumeUrl || '').trim();
  if (links) score += 5;

  const portfolio = data.portfolio && data.portfolio.length > 0;
  const taxonomy = (data.roles && data.roles.length > 0) || (data.skills && data.skills.length > 0);
  if (portfolio || taxonomy) score += 10;

  return Math.min(100, Math.max(0, score));
}

/**
 * Unified helper for Auth User in Navbar, Dropdowns, etc.
 */
export function calculateUserProfileCompletion(user: User | null): number {
  if (!user) return 0;

  if (user.role === 'Client') {
    return calculateClientCompletion({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      companyName: user.companyName,
      avatarUrl: user.avatarUrl,
      websiteUrl: user.websiteUrl,
      bio: user.bio
    });
  }

  return calculateProCompletion({
    fullName: user.fullName,
    displayName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    headline: user.headline,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    city: user.city,
    hourlyRate: user.hourlyRate,
    websiteUrl: user.websiteUrl,
    resumeUrl: user.resumeUrl
  });
}
