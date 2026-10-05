import { AuthSession, Category, MatchScoreResult, ProfessionalProfile, ClientProfile, RequirementApplicant, ProjectItem, Proposal, Requirement, ConversationItem, ChatMessageItem } from './types';

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');
export const BACKEND_URL = RAW_BASE;
export const API_BASE = RAW_BASE ? `${RAW_BASE}/api` : '/api';
export const CHAT_HUB_URL = RAW_BASE ? `${RAW_BASE}/hubs/chat` : '/hubs/chat';

function getStoredSession(): AuthSession | null {
  const sessionStr = localStorage.getItem('tnest_session');
  if (sessionStr) {
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  }
  return null;
}

function getAuthHeader(): Record<string, string> {
  const session = getStoredSession();
  if (session?.token) {
    return { Authorization: `Bearer ${session.token}` };
  }
  return {};
}

async function refreshAuthToken(): Promise<string | null> {
  const session = getStoredSession();
  if (!session?.refreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: session.refreshToken })
    });

    if (res.ok) {
      const newSession: AuthSession = await res.json();
      localStorage.setItem('tnest_session', JSON.stringify(newSession));
      return newSession.token;
    }
  } catch {
    // refresh failed
  }
  return null;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = {
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {})
  };

  let res = await fetch(url, { ...options, headers });

  if (res.status === 401) {
    const newToken = await refreshAuthToken();
    if (newToken) {
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`
      };
      res = await fetch(url, { ...options, headers: retryHeaders });
    }
  }

  return res;
}

async function handleResponseJson<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    let message = fallbackError;
    try {
      const text = await res.text();
      try {
        const json = JSON.parse(text);
        message = json.message || json.detail || json.title || (typeof json === 'string' ? json : fallbackError);
      } catch {
        if (text && text.length < 150 && !text.includes('<html')) {
          message = text;
        }
      }
    } catch {
      // keep fallback
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Auth
  register: async (data: any): Promise<AuthSession> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponseJson<AuthSession>(res, 'Registration failed');
  },

  login: async (data: { email: string; password: string }): Promise<AuthSession> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponseJson<AuthSession>(res, 'Invalid email or password credentials');
  },

  googleLogin: async (data: { idToken: string; role?: string; companyName?: string; headline?: string }): Promise<AuthSession> => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponseJson<AuthSession>(res, 'Google authentication failed');
  },

  logout: async (): Promise<void> => {
    const session = getStoredSession();
    try {
      if (session?.refreshToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: session.refreshToken })
        });
      }
    } catch {
      // best-effort logout
    } finally {
      localStorage.removeItem('tnest_session');
    }
  },

  getCurrentUser: async (): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE}/auth/me`);
    return handleResponseJson<any>(res, 'Failed to fetch user');
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<any> => {
    const res = await fetchWithAuth(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponseJson<any>(res, 'Failed to change password');
  },

  // Taxonomy
  getCategories: async (): Promise<Category[]> => {
    const res = await fetch(`${API_BASE}/taxonomy/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  // Professionals
  getProfessionals: async (filters: { category?: string; language?: string; onCamera?: boolean; productShipment?: boolean; maxRate?: number; search?: string } = {}): Promise<ProfessionalProfile[]> => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.language) params.append('language', filters.language);
    if (filters.onCamera) params.append('onCamera', 'true');
    if (filters.productShipment) params.append('productShipment', 'true');
    if (filters.maxRate) params.append('maxRate', filters.maxRate.toString());
    if (filters.search) params.append('search', filters.search);

    const res = await fetch(`${API_BASE}/profiles/professionals?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch professionals');
    return res.json();
  },

  getProfessionalBySlug: async (slug: string): Promise<ProfessionalProfile> => {
    const res = await fetch(`${API_BASE}/profiles/professionals/${slug}`);
    return handleResponseJson<ProfessionalProfile>(res, 'Professional not found');
  },

  updateProfessionalProfile: async (id: string, data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/profiles/professionals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponseJson<any>(res, 'Failed to update profile');
  },

  getClientProfile: async (id: string): Promise<ClientProfile> => {
    const res = await fetch(`${API_BASE}/profiles/clients/${id}`);
    return handleResponseJson<ClientProfile>(res, 'Client profile not found');
  },

  getClientProfileByUserId: async (userId: string): Promise<ClientProfile> => {
    const res = await fetch(`${API_BASE}/profiles/clients/by-user/${userId}`);
    return handleResponseJson<ClientProfile>(res, 'Client profile not found');
  },

  getClientPublicProfile: async (id: string): Promise<ClientProfile> => {
    const res = await fetch(`${API_BASE}/profiles/clients/${id}/public`);
    return handleResponseJson<ClientProfile>(res, 'Client profile not found');
  },

  updateClientProfile: async (id: string, data: any): Promise<ClientProfile> => {
    const res = await fetch(`${API_BASE}/profiles/clients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponseJson<ClientProfile>(res, 'Failed to update client profile');
  },

  // Requirements
  createRequirement: async (data: any): Promise<Requirement> => {
    const res = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create requirement');
    return res.json();
  },

  getRequirementById: async (id: string): Promise<Requirement> => {
    const res = await fetch(`${API_BASE}/requirements/${id}`);
    if (!res.ok) throw new Error('Requirement not found');
    return res.json();
  },

  updateRequirement: async (id: string, data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/requirements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    return handleResponseJson<any>(res, 'Failed to update requirement');
  },

  closeRequirement: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/requirements/${id}/close`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponseJson<any>(res, 'Failed to close requirement');
  },

  updateRequirementStatus: async (id: string, status: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/requirements/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status })
    });
    return handleResponseJson<any>(res, 'Failed to update requirement status');
  },

  getRequirementMatches: async (id: string): Promise<MatchScoreResult[]> => {
    const res = await fetch(`${API_BASE}/requirements/${id}/matches`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    return res.json();
  },

  getOpportunities: async (filters: { categorySlug?: string; language?: string } = {}): Promise<Requirement[]> => {
    const params = new URLSearchParams();
    if (filters.categorySlug) params.append('categorySlug', filters.categorySlug);
    if (filters.language) params.append('language', filters.language);

    const res = await fetch(`${API_BASE}/requirements/opportunities?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch opportunities');
    const data = await res.json();
    return (data || []).map((item: any) => {
      let dynamicAttrs: any = {};
      try {
        if (item.dynamicAttributesJson) {
          dynamicAttrs = JSON.parse(item.dynamicAttributesJson);
        }
      } catch {}
      return {
        ...item,
        opportunityType: item.opportunityType || dynamicAttrs.opportunityType || 'Freelance',
        locationType: item.locationType || dynamicAttrs.locationType || (item.requiresProductShipment ? 'On-site / Hybrid' : 'Remote'),
        vacanciesCount: item.vacanciesCount || dynamicAttrs.vacanciesCount || 1,
        rolesNeeded: item.rolesNeeded || (dynamicAttrs.selectedRole ? [dynamicAttrs.selectedRole] : [item.categoryName || 'Specialist']),
        requiredSkills: item.requiredSkills || dynamicAttrs.selectedSkills || ['Content Creation', 'Digital Specialist'],
        deliverables: item.deliverables || dynamicAttrs.deliverables || ['Final Project Deliverable Files', 'Source Assets & Documentation']
      };
    });
  },

  getClientRequirements: async (clientProfileId: string): Promise<Requirement[]> => {
    const res = await fetch(`${API_BASE}/requirements/client/${clientProfileId}`);
    if (!res.ok) throw new Error('Failed to fetch client requirements');
    return res.json();
  },

  getClientProjects: async (clientProfileId: string): Promise<ProjectItem[]> => {
    const res = await fetch(`${API_BASE}/projects/client/${clientProfileId}`);
    if (!res.ok) return [];
    return res.json();
  },

  getProProjects: async (proProfileId: string): Promise<ProjectItem[]> => {
    const res = await fetch(`${API_BASE}/projects/pro/${proProfileId}`);
    if (!res.ok) return [];
    return res.json();
  },

  // Proposals & Inquiries
  submitProposal: async (data: { requirementId: string; professionalProfileId: string; coverLetter: string; proposedPrice: number; estimatedDays: number }): Promise<Proposal> => {
    const res = await fetch(`${API_BASE}/proposals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit proposal');
    return res.json();
  },

  getRequirementProposals: async (requirementId: string): Promise<RequirementApplicant[]> => {
    const res = await fetch(`${API_BASE}/proposals/requirement/${requirementId}`);
    return handleResponseJson<RequirementApplicant[]>(res, 'Failed to fetch applicants');
  },

  shortlistProposal: async (proposalId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/proposals/${proposalId}/shortlist`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponseJson<any>(res, 'Failed to shortlist proposal');
  },

  rejectProposal: async (proposalId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/proposals/${proposalId}/reject`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    return handleResponseJson<any>(res, 'Failed to reject proposal');
  },

  acceptProposal: async (proposalId: string): Promise<{ project: ProjectItem; proposal: Proposal }> => {
    const res = await fetch(`${API_BASE}/proposals/${proposalId}/accept`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to accept proposal');
    return res.json();
  },

  getProProposals: async (proProfileId: string): Promise<Proposal[]> => {
    const res = await fetch(`${API_BASE}/proposals/pro/${proProfileId}`);
    if (!res.ok) throw new Error('Failed to fetch proposals');
    return res.json();
  },

  createInquiry: async (data: { clientProfileId: string; professionalProfileId: string; requirementId?: string; initialMessage: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create inquiry');
    return res.json();
  },

  // Messaging
  startConversation: async (data: {
    senderUserId?: string;
    senderRole?: string;
    clientProfileId?: string;
    professionalProfileId?: string;
    recipientUserId?: string;
    recipientName?: string;
    requirementId?: string;
    projectId?: string;
    initialMessage?: string;
  }): Promise<ConversationItem> => {
    const res = await fetch(`${API_BASE}/chat/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to start conversation');
    return res.json();
  },

  getUserConversations: async (userId: string): Promise<ConversationItem[]> => {
    const res = await fetch(`${API_BASE}/chat/conversations/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  getUnreadMessagesCount: async (userId?: string): Promise<number> => {
    try {
      const url = userId ? `${API_BASE}/chat/unread-count?userId=${userId}` : `${API_BASE}/chat/unread-count`;
      const res = await fetch(url, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        return typeof data.unreadCount === 'number' ? data.unreadCount : (typeof data.unreadChatsCount === 'number' ? data.unreadChatsCount : 0);
      }
      if (userId) {
        const convs = await api.getUserConversations(userId);
        return (convs || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
      }
      return 0;
    } catch {
      return 0;
    }
  },

  getUnreadCounts: async (userId?: string): Promise<{ unreadMessages: number; unreadChats: number }> => {
    try {
      const url = userId ? `${API_BASE}/chat/unread-count?userId=${userId}` : `${API_BASE}/chat/unread-count`;
      const res = await fetch(url, {
        headers: { ...getAuthHeader() }
      });
      if (res.ok) {
        const data = await res.json();
        return {
          unreadMessages: typeof data.unreadCount === 'number' ? data.unreadCount : 0,
          unreadChats: typeof data.unreadChatsCount === 'number' ? data.unreadChatsCount : 0
        };
      }
      if (userId) {
        const convs = await api.getUserConversations(userId);
        const unreadMessages = (convs || []).reduce((sum: number, c: any) => sum + (c.unreadCount || 0), 0);
        const unreadChats = (convs || []).filter((c: any) => (c.unreadCount || 0) > 0).length;
        return { unreadMessages, unreadChats };
      }
      return { unreadMessages: 0, unreadChats: 0 };
    } catch {
      return { unreadMessages: 0, unreadChats: 0 };
    }
  },

  getConversationMessages: async (conversationId: string): Promise<{ conversation: any; messages: ChatMessageItem[] }> => {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  },

  sendMessage: async (conversationId: string, data: { senderUserId: string; senderRole: string; content: string; attachmentUrl?: string; attachmentName?: string; attachmentType?: string }): Promise<ChatMessageItem> => {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  },

  // Projects
  getProjectById: async (id: string): Promise<ProjectItem> => {
    const res = await fetch(`${API_BASE}/projects/${id}`);
    if (!res.ok) throw new Error('Project not found');
    return res.json();
  },

  updateShipment: async (projectId: string, data: { courierName: string; trackingNumber: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/shipment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update shipment');
    return res.json();
  },

  confirmProductReceived: async (projectId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/product-received`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to confirm receipt');
    return res.json();
  },

  submitDelivery: async (projectId: string, data: { notes: string; deliveryUrls: string[] }): Promise<any> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/deliveries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit delivery');
    return res.json();
  },

  requestRevision: async (projectId: string, deliveryId: string, feedback: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/deliveries/${deliveryId}/revision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ feedback })
    });
    if (!res.ok) throw new Error('Failed to request revision');
    return res.json();
  },

  approveDelivery: async (projectId: string, deliveryId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/deliveries/${deliveryId}/approve`, {
      method: 'POST',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to approve delivery');
    return res.json();
  },

  submitReview: async (projectId: string, data: { overallRating: number; communicationRating: number; qualityRating: number; timelinessRating: number; comment: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/projects/${projectId}/review`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to submit review');
    }
    return res.json();
  }
};

export const reportsApi = {
  submitReport: async (data: {
    targetType: string;
    targetId: string;
    targetTitle?: string;
    reasonCategory: string;
    details: string;
    priority?: string;
  }) => {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to submit report');
    }
    return res.json();
  }
};

export const adminApi = {
  getDashboard: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load admin dashboard');
    return res.json();
  },

  getUsers: async (params?: { search?: string; role?: string; status?: string; page?: number; pageSize?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load users');
    return res.json();
  },

  getUserById: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load user details');
    return res.json();
  },

  updateUserStatus: async (id: string, data: { isActive: boolean; reason: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update user status');
    }
    return res.json();
  },

  getOpportunities: async (params?: { search?: string; category?: string; status?: string; isHidden?: boolean; page?: number; pageSize?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.isHidden !== undefined) query.set('isHidden', params.isHidden.toString());
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/admin/opportunities?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load opportunities');
    return res.json();
  },

  getOpportunityById: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/opportunities/${id}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load opportunity details');
    return res.json();
  },

  moderateOpportunity: async (id: string, data: { action: 'hide' | 'restore' | 'close' | 'remove'; reason: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/opportunities/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to moderate opportunity');
    }
    return res.json();
  },

  getApplications: async (page = 1, pageSize = 20): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/applications?page=${page}&pageSize=${pageSize}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load applications');
    return res.json();
  },

  getProjects: async (params?: { status?: string; page?: number; pageSize?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/admin/projects?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load projects');
    return res.json();
  },

  getReports: async (params?: { status?: string; targetType?: string; page?: number; pageSize?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.targetType) query.set('targetType', params.targetType);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/admin/reports?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load reports');
    return res.json();
  },

  updateReportStatus: async (id: string, data: { status: string; adminNotes?: string; resolutionAction?: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reports/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update report status');
    }
    return res.json();
  },

  getPortfolios: async (params?: { isHidden?: boolean; page?: number; pageSize?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.isHidden !== undefined) query.set('isHidden', params.isHidden.toString());
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/admin/portfolios?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load portfolios');
    return res.json();
  },

  moderatePortfolio: async (id: string, data: { action: 'hide' | 'restore' | 'remove'; reason: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/portfolios/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to moderate portfolio');
    }
    return res.json();
  },

  getReviews: async (params?: { isHidden?: boolean; page?: number; pageSize?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.isHidden !== undefined) query.set('isHidden', params.isHidden.toString());
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/admin/reviews?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load reviews');
    return res.json();
  },

  moderateReview: async (id: string, data: { action: 'hide' | 'restore' | 'remove'; reason: string }): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/reviews/${id}/moderate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to moderate review');
    }
    return res.json();
  },

  getCategories: async (includeArchived = true): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/categories?includeArchived=${includeArchived}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load categories');
    return res.json();
  },

  saveCategory: async (data: { id?: string; name: string; slug: string; description: string; icon: string; dynamicSchemaJson?: string }): Promise<any> => {
    const isEdit = !!data.id;
    const url = isEdit ? `${API_BASE}/admin/categories/${data.id}` : `${API_BASE}/admin/categories`;
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save category');
    }
    return res.json();
  },

  toggleArchiveCategory: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to toggle category archive status');
    return res.json();
  },

  getRoles: async (categoryId?: string): Promise<any> => {
    const url = categoryId ? `${API_BASE}/admin/roles?categoryId=${categoryId}` : `${API_BASE}/admin/roles`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load roles');
    return res.json();
  },

  saveRole: async (data: { id?: string; categoryId: string; name: string; slug: string; description?: string }): Promise<any> => {
    const isEdit = !!data.id;
    const url = isEdit ? `${API_BASE}/admin/roles/${data.id}` : `${API_BASE}/admin/roles`;
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save role');
    }
    return res.json();
  },

  toggleArchiveRole: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/roles/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to toggle role archive status');
    return res.json();
  },

  getSkills: async (categoryId?: string): Promise<any> => {
    const url = categoryId ? `${API_BASE}/admin/skills?categoryId=${categoryId}` : `${API_BASE}/admin/skills`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load skills');
    return res.json();
  },

  saveSkill: async (data: { id?: string; categoryId: string; name: string; slug: string }): Promise<any> => {
    const isEdit = !!data.id;
    const url = isEdit ? `${API_BASE}/admin/skills/${data.id}` : `${API_BASE}/admin/skills`;
    const res = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to save skill');
    }
    return res.json();
  },

  toggleArchiveSkill: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/skills/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to toggle skill archive status');
    return res.json();
  },

  getAuditLogs: async (params?: { search?: string; action?: string; page?: number; pageSize?: number }): Promise<any> => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.action) query.set('action', params.action);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.pageSize) query.set('pageSize', params.pageSize.toString());

    const res = await fetch(`${API_BASE}/admin/audit-logs?${query.toString()}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load audit logs');
    return res.json();
  },

  getSettings: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load system settings');
    return res.json();
  },

  updateSetting: async (key: string, value: string, reason?: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ key, value, reason })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update setting');
    }
    return res.json();
  },

  getNotifications: async (): Promise<any[]> => {
    const res = await fetch(`${API_BASE}/admin/notifications`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load notifications');
    return res.json();
  }
};


