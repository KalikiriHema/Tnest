import { AuthSession, Category, MatchScoreResult, ProfessionalProfile, ProjectItem, Proposal, Requirement, ConversationItem, ChatMessageItem } from './types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const sessionStr = localStorage.getItem('creative_hub_session');
  if (sessionStr) {
    try {
      const session: AuthSession = JSON.parse(sessionStr);
      return { Authorization: `Bearer ${session.token}` };
    } catch {
      // ignore
    }
  }
  return {};
}

export const api = {
  // Auth
  register: async (data: any): Promise<AuthSession> => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Registration failed');
    }
    return res.json();
  },

  login: async (data: { email: string; password: string }): Promise<AuthSession> => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Login failed');
    }
    return res.json();
  },

  getCurrentUser: async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
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
    if (!res.ok) throw new Error('Professional not found');
    return res.json();
  },

  updateProfessionalProfile: async (id: string, data: any): Promise<any> => {
    const res = await fetch(`${API_BASE}/profiles/professionals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
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
    return res.json();
  },

  getClientRequirements: async (clientProfileId: string): Promise<Requirement[]> => {
    const res = await fetch(`${API_BASE}/requirements/client/${clientProfileId}`);
    if (!res.ok) throw new Error('Failed to fetch client requirements');
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
  getUserConversations: async (userId: string): Promise<ConversationItem[]> => {
    const res = await fetch(`${API_BASE}/chat/conversations/user/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  },

  getConversationMessages: async (conversationId: string): Promise<{ conversation: any; messages: ChatMessageItem[] }> => {
    const res = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`);
    if (!res.ok) throw new Error('Failed to fetch messages');
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
