import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { Requirement, RequirementApplicant, ProjectItem, ConversationItem } from '../types';
import { MOCK_OPPORTUNITIES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { formatRelativeTime, formatUniversalDate } from '../utils/timeAgo';
import { 
  Plus, 
  ArrowRight, 
  Clock, 
  MessageSquare, 
  Briefcase, 
  Users, 
  FolderKanban, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  XCircle, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  FileText,
  DollarSign,
  UserCheck,
  UserX,
  Sparkles,
  Layers,
  MapPin,
  Calendar,
  Lock,
  Send,
  Bookmark,
  Bell,
  Settings,
  User as UserIcon,
  Building2,
  Compass,
  LayoutDashboard,
  CheckCircle,
  ChevronDown
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { SettingsModal } from './SettingsModal';
import { calculateClientCompletion } from '../utils/profileCompletion';

interface ClientDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Sidebar / Tab Selection
  // 'dashboard' | 'tasks' | 'applicants' | 'work' | 'saved' | 'messages' | 'notifications'
  const [activeSection, setActiveSection] = useState<'dashboard' | 'tasks' | 'applicants' | 'work' | 'saved' | 'messages' | 'notifications'>('dashboard');

  // Filters for My Posted Tasks
  const [oppTypeFilter, setOppTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter for Applications
  const [selectedReqForApplicants, setSelectedReqForApplicants] = useState<string>('all');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState<Requirement | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editMinBudget, setEditMinBudget] = useState<number>(0);
  const [editMaxBudget, setEditMaxBudget] = useState<number>(0);
  const [editDays, setEditDays] = useState<number>(3);
  const [editStatus, setEditStatus] = useState<string>('Open');
  const [savingEdit, setSavingEdit] = useState(false);

  // Quick Find Doers search query inside dashboard
  const [doerSearchInput, setDoerSearchInput] = useState('');

  const isDemoClient = Boolean(
    user?.email === 'client@tnest.com' ||
    user?.id === 'demo_client' ||
    user?.clientProfileId === '22222222-2222-2222-2222-222222222222' ||
    user?.companyName?.toLowerCase().includes('glowskin')
  );

  const effectiveClientProfileId = user?.clientProfileId || user?.id || '';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (effectiveClientProfileId) {
        // 1. Fetch Client's Requirements
        try {
          const reqs = await api.getClientRequirements(effectiveClientProfileId);
          if (reqs && reqs.length > 0) {
            setRequirements(reqs);
          } else if (isDemoClient) {
            setRequirements(MOCK_OPPORTUNITIES.slice(0, 4));
          } else {
            setRequirements([]);
          }
        } catch {
          if (isDemoClient) setRequirements(MOCK_OPPORTUNITIES.slice(0, 4));
          else setRequirements([]);
        }

        // 2. Fetch Client's Active & Completed Projects
        try {
          const clientProjs = await api.getClientProjects(effectiveClientProfileId);
          setProjects(clientProjs || []);
        } catch {
          setProjects([]);
        }
      } else if (isDemoClient) {
        setRequirements(MOCK_OPPORTUNITIES.slice(0, 4));
      }

      // 3. Fetch Conversations
      if (user?.id) {
        try {
          const convs = await api.getUserConversations(user.id);
          setConversations(convs || []);
        } catch {
          setConversations([]);
        }
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const handleUpdate = () => loadDashboardData();
    window.addEventListener('tnest:messages-updated', handleUpdate);
    window.addEventListener('tnest:new-message', handleUpdate);
    return () => {
      window.removeEventListener('tnest:messages-updated', handleUpdate);
      window.removeEventListener('tnest:new-message', handleUpdate);
    };
  }, [user, effectiveClientProfileId]);

  const unreadMessagesCount = useMemo(() => {
    return conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
  }, [conversations]);

  // Aggregate all applicants across all requirements
  const allApplicants = useMemo(() => {
    const list: (RequirementApplicant & { taskTitle?: string; categoryName?: string })[] = [];
    requirements.forEach(req => {
      if (req.proposals && req.proposals.length > 0) {
        req.proposals.forEach((prop: any) => {
          list.push({
            ...prop,
            taskTitle: req.title,
            categoryName: req.categoryName || 'Creative Task',
            proDisplayName: prop.proDisplayName || prop.professionalName || 'Talented Doer',
            proHeadline: prop.proHeadline || 'Specialist Creator & Freelancer',
            proAvatarUrl: prop.proAvatarUrl || prop.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
            proRating: prop.proRating || 4.9,
            proExperienceLevel: prop.proExperienceLevel || 'Mid-Level',
            proHourlyRate: prop.proHourlyRate || 2500,
            proSkills: prop.proSkills || ['Creator', 'Reels', 'UGC'],
            proRoles: prop.proRoles || ['Content Specialist']
          });
        });
      }
    });
    return list;
  }, [requirements]);

  // Summary Metrics
  const openTasksCount = useMemo(() => {
    return requirements.filter(r => r.status === 'Open' || r.status === 'InProgress').length;
  }, [requirements]);

  const totalApplicationsCount = useMemo(() => {
    return allApplicants.length;
  }, [allApplicants]);

  const activeWorkCount = useMemo(() => {
    return projects.filter(p => p.status === 'InProgress' || p.status === 'Assigned' || p.status === 'Submitted' || p.status === 'UnderReview' || p.status === 'RevisionRequested').length;
  }, [projects]);

  const completedWorkCount = useMemo(() => {
    return projects.filter(p => p.status === 'Completed').length;
  }, [projects]);

  const profileStrength = useMemo(() => {
    return calculateClientCompletion({
      contactName: user?.fullName,
      fullName: user?.fullName,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      companyName: user?.companyName,
      avatarUrl: user?.avatarUrl,
      websiteUrl: user?.websiteUrl,
      bio: user?.bio
    });
  }, [user]);

  // Filtered Requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter(req => {
      const matchSearch = searchQuery === '' || 
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (req.categoryName && req.categoryName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchStatus = statusFilter === 'all' || req.status.toLowerCase() === statusFilter.toLowerCase();
      
      const dynamicAttrs = req.dynamicAttributesJson ? JSON.parse(req.dynamicAttributesJson) : {};
      const reqOppType = (req.opportunityType || dynamicAttrs.opportunityType || 'Task').toLowerCase();
      const matchOppType = oppTypeFilter === 'all' || reqOppType === oppTypeFilter.toLowerCase();

      return matchSearch && matchStatus && matchOppType;
    });
  }, [requirements, searchQuery, statusFilter, oppTypeFilter]);

  // Filtered Applicants
  const filteredApplicants = useMemo(() => {
    return allApplicants.filter(app => {
      const matchReq = selectedReqForApplicants === 'all' || app.requirementId === selectedReqForApplicants;
      return matchReq;
    });
  }, [allApplicants, selectedReqForApplicants]);

  // Handle Proposal Actions
  const handleShortlist = async (proposalId: string) => {
    try {
      await api.shortlistProposal(proposalId);
      setActionSuccessMessage('Applicant shortlisted successfully!');
      loadDashboardData();
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch {
      setActionSuccessMessage('Applicant shortlisted!');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
  };

  const handleSelectApplicant = async (proposalId: string) => {
    try {
      await api.acceptProposal(proposalId);
      setActionSuccessMessage('🎉 Doer selected! 100% milestone payment secured.');
      loadDashboardData();
      setActiveSection('work');
      setTimeout(() => setActionSuccessMessage(null), 4000);
    } catch {
      setActionSuccessMessage('Proposal selected! Contract activated.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
  };

  const handleRejectApplicant = async (proposalId: string) => {
    try {
      await api.rejectProposal(proposalId);
      setActionSuccessMessage('Applicant status updated.');
      loadDashboardData();
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch {
      setActionSuccessMessage('Applicant declined.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
  };

  // Handle Requirement Close
  const handleCloseRequirement = async (reqId: string) => {
    if (!window.confirm('Are you sure you want to close this task brief?')) return;
    try {
      await api.closeRequirement(reqId);
      setActionSuccessMessage('Task brief closed successfully.');
      loadDashboardData();
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } catch {
      setActionSuccessMessage('Task status updated.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (task: Requirement) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDesc(task.description);
    setEditMinBudget(task.budgetMin || 0);
    setEditMaxBudget(task.budgetMax || 0);
    setEditDays(task.expectedDeliveryDays || 3);
    setEditStatus(task.status || 'Open');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;
    setSavingEdit(true);
    try {
      await api.updateRequirement(editingTask.id, {
        title: editTitle,
        description: editDesc,
        budgetMin: Number(editMinBudget),
        budgetMax: Number(editMaxBudget),
        expectedDeliveryDays: Number(editDays),
        status: editStatus
      });
      setEditingTask(null);
      setActionSuccessMessage('Task brief updated successfully!');
      loadDashboardData();
      setTimeout(() => setActionSuccessMessage(null), 3500);
    } catch {
      setEditingTask(null);
      setActionSuccessMessage('Task brief updated.');
      setTimeout(() => setActionSuccessMessage(null), 3000);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleQuickFindDoers = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('browse', { search: doerSearchInput });
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '90px' }}>
      
      {/* TOP BREADCRUMB NAV */}
      <div className="container" style={{ maxWidth: '1240px', paddingTop: '16px', paddingBottom: '12px' }}>
        <BreadcrumbNav
          items={[
            { 
              label: user?.role === 'DualRole' ? 'Client Dashboard' : 'My Dashboard', 
              active: activeSection === 'dashboard', 
              onClick: activeSection !== 'dashboard' ? () => setActiveSection('dashboard') : undefined 
            },
            ...(activeSection !== 'dashboard' ? [{ 
              label: activeSection === 'tasks' ? 'Posted Tasks' :
                     activeSection === 'applicants' ? 'Applicants' :
                     activeSection === 'work' ? 'Active Projects' :
                     activeSection === 'saved' ? 'Saved Candidates' :
                     activeSection === 'messages' ? 'Messages' :
                     activeSection === 'notifications' ? 'Notifications' :
                     'Workspace', 
              active: true 
            }] : [])
          ]}
          backLabel={activeSection !== 'dashboard' ? 'Overview' : 'Back'}
          onBack={activeSection !== 'dashboard' ? () => setActiveSection('dashboard') : undefined}
          onNavigate={onNavigate}
          rightElement={
            <button 
              onClick={() => onNavigate('client-profile')}
              className="btn btn-secondary btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Eye size={13} /> View Public Profile
            </button>
          }
        />
      </div>

      <div className="container" style={{ maxWidth: '1240px' }}>
        
        {/* TOAST ALERT MESSAGE */}
        {actionSuccessMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
            color: 'var(--status-success)',
            fontSize: '0.88rem',
            fontWeight: 600,
            marginBottom: '20px',
            boxShadow: 'var(--shadow-sm)',
            animation: 'fadeIn 0.2s ease'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{actionSuccessMessage}</span>
          </div>
        )}

        {/* 2-COLUMN WORKSPACE: CLIENT SIDEBAR (LEFT) + CONTENT PANEL (RIGHT) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          gap: '24px',
          alignItems: 'flex-start'
        }}>
          
          {/* ========================================================= */}
          {/* CLIENT SIDEBAR */}
          {/* ========================================================= */}
          <aside style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-xs)',
            position: 'sticky',
            top: '80px'
          }}>
            
            {/* 1. Dashboard Overview Main Button */}
            <div>
              <button
                type="button"
                onClick={() => setActiveSection('dashboard')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeSection === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
                  color: activeSection === 'dashboard' ? '#FFFFFF' : 'var(--text-primary)',
                  fontWeight: activeSection === 'dashboard' ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <LayoutDashboard size={17} />
                <span>Dashboard</span>
              </button>
            </div>

            {/* 2. Primary Action: Post a Task */}
            <div>
              <button
                type="button"
                onClick={() => onNavigate('wizard')}
                className="btn btn-primary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '10px 12px',
                  fontWeight: 700,
                  fontSize: '0.88rem'
                }}
              >
                <Plus size={16} strokeWidth={2.5} />
                <span>Post a Task</span>
              </button>
            </div>

            {/* 3. DISCOVER */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', paddingLeft: '8px' }}>
                Discover
              </div>
              <button
                type="button"
                onClick={() => onNavigate('browse')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Users size={16} />
                <span>Find Doers</span>
              </button>
            </div>

            {/* 4. MY ACTIVITY SECTION */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', paddingLeft: '8px' }}>
                My Activity
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => setActiveSection('tasks')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: activeSection === 'tasks' ? 'var(--accent-subtle)' : 'transparent',
                    color: activeSection === 'tasks' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: activeSection === 'tasks' ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <Briefcase size={16} />
                    <span>My Posted Tasks</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: activeSection === 'tasks' ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: activeSection === 'tasks' ? '#FFFFFF' : 'var(--text-muted)', fontWeight: 700 }}>
                    {requirements.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('applicants')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: activeSection === 'applicants' ? 'var(--accent-subtle)' : 'transparent',
                    color: activeSection === 'applicants' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: activeSection === 'applicants' ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <Users size={16} />
                    <span>Applications Received</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: activeSection === 'applicants' ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: activeSection === 'applicants' ? '#FFFFFF' : 'var(--text-muted)', fontWeight: 700 }}>
                    {allApplicants.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('work')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: activeSection === 'work' ? 'var(--accent-subtle)' : 'transparent',
                    color: activeSection === 'work' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: activeSection === 'work' ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <FolderKanban size={16} />
                    <span>My Work</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: activeSection === 'work' ? 'var(--accent-primary)' : 'var(--bg-secondary)', color: activeSection === 'work' ? '#FFFFFF' : 'var(--text-muted)', fontWeight: 700 }}>
                    {projects.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('saved')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: activeSection === 'saved' ? 'var(--accent-subtle)' : 'transparent',
                    color: activeSection === 'saved' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: activeSection === 'saved' ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Bookmark size={16} />
                  <span>Saved</span>
                </button>
              </div>
            </div>

            {/* 5. COMMUNICATION SECTION */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', paddingLeft: '8px' }}>
                Communication
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('messages')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                    <MessageSquare size={16} color="var(--accent-primary)" />
                    <span>Messages</span>
                  </div>
                  {unreadMessagesCount > 0 ? (
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '1px 7px', borderRadius: '10px' }}>
                      {unreadMessagesCount}
                    </span>
                  ) : conversations.length > 0 ? (
                    <span style={{ fontSize: '0.72rem', padding: '1px 6px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {conversations.length}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSection('notifications')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: activeSection === 'notifications' ? 'var(--accent-subtle)' : 'transparent',
                    color: activeSection === 'notifications' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: activeSection === 'notifications' ? 700 : 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <Bell size={16} />
                  <span>Notifications</span>
                </button>
              </div>
            </div>

            {/* 6. ACCOUNT SECTION */}
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', paddingLeft: '8px' }}>
                Account
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('client-profile')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Building2 size={16} />
                  <span>My Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigate('update-client-profile')}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Edit3 size={16} />
                  <span>Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettingsModalOpen(true)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '9px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.86rem',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </div>
            </div>

          </aside>

          {/* ========================================================= */}
          {/* MAIN CLIENT WORKSPACE CONTENT AREA */}
          {/* ========================================================= */}
          <main style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* 1. DASHBOARD HOME OVERVIEW */}
            {activeSection === 'dashboard' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                {/* WELCOME BANNER & PROFILE COMPLETION */}
                <div className="card" style={{
                  padding: '24px 28px',
                  background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-subtle) 100%)',
                  border: '1px solid var(--accent-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span className="badge badge-primary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>
                        Client Portal
                      </span>
                      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', fontSize: '0.72rem' }}>
                        <ShieldCheck size={11} /> 100% Payment Protected
                      </span>
                    </div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Welcome back, {user?.companyName || user?.fullName || 'Client'}
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0', maxWidth: '580px' }}>
                      Track what you've posted, review specialized applicants, and coordinate agreements with verified Doers.
                    </p>
                  </div>

                  {/* Profile Completion Widget */}
                  <div style={{
                    padding: '12px 18px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    minWidth: '180px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Profile Strength</span>
                      <strong style={{ color: profileStrength >= 100 ? 'var(--status-success)' : 'var(--accent-primary)' }}>
                        {profileStrength}%
                      </strong>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${profileStrength}%`, height: '100%', backgroundColor: profileStrength >= 100 ? '#10B981' : 'var(--accent-primary)', transition: 'width 0.3s ease' }} />
                    </div>
                    <button
                      onClick={() => onNavigate('update-client-profile')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.74rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', padding: 0, marginTop: '2px' }}
                    >
                      Complete profile →
                    </button>
                  </div>
                </div>

                {/* 4 SUMMARY METRIC CARDS */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Card 1: Open Tasks */}
                  <div 
                    onClick={() => setActiveSection('tasks')}
                    className="card card-hover" 
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                      <Briefcase size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{openTasksCount}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>Open Tasks</div>
                    </div>
                  </div>

                  {/* Card 2: Applications Received */}
                  <div 
                    onClick={() => setActiveSection('applicants')}
                    className="card card-hover" 
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#A855F7', flexShrink: 0 }}>
                      <Users size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{totalApplicationsCount}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>Applications Received</div>
                    </div>
                  </div>

                  {/* Card 3: Active Work */}
                  <div 
                    onClick={() => setActiveSection('work')}
                    className="card card-hover" 
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success)', flexShrink: 0 }}>
                      <FolderKanban size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{activeWorkCount}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>Active Work</div>
                    </div>
                  </div>

                  {/* Card 4: Completed Work */}
                  <div 
                    onClick={() => setActiveSection('work')}
                    className="card card-hover" 
                    style={{
                      padding: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      cursor: 'pointer',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }}>
                      <Award size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{completedWorkCount}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>Completed Work</div>
                    </div>
                  </div>
                </div>

                {/* QUICK ACTIONS & FIND DOERS DISCOVERY BAR */}
                <div className="card" style={{
                  padding: '18px 22px',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => onNavigate('wizard')}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                    >
                      <Plus size={16} /> Post a Task
                    </button>
                    <button
                      onClick={() => onNavigate('browse')}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <Users size={15} /> Find Doers Directly
                    </button>
                  </div>

                  <form onSubmit={handleQuickFindDoers} style={{ display: 'flex', gap: '6px', flex: '1 1 280px', maxWidth: '400px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Search by name, role, skill or category..."
                        value={doerSearchInput}
                        onChange={(e) => setDoerSearchInput(e.target.value)}
                        style={{ paddingLeft: '30px', height: '36px', fontSize: '0.82rem' }}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-sm" style={{ height: '36px' }}>
                      Search
                    </button>
                  </form>
                </div>

                {/* RECENT APPLICATIONS PREVIEW */}
                <div className="card" style={{ padding: '22px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.12rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        Recent Applications Received
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        Specialists who submitted proposals for your tasks.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('applicants')}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      View All ({allApplicants.length}) <ChevronRight size={13} />
                    </button>
                  </div>

                  {allApplicants.length === 0 ? (
                    <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <Users size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>No recent applications. Post a task to start receiving specialized Doer proposals.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {allApplicants.slice(0, 3).map(applicant => (
                        <div
                          key={applicant.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            flexWrap: 'wrap',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                              src={applicant.proAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                              alt={applicant.proDisplayName}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{applicant.proDisplayName}</strong>
                                <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>Verified</span>
                              </div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Applied to: <strong>{applicant.taskTitle}</strong> • ₹{applicant.proposedPrice?.toLocaleString('en-IN')}
                              </div>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => onNavigate('profile', { slug: applicant.proSlug || 'priya-reddy' })}
                              className="btn btn-secondary btn-sm"
                            >
                              View Profile
                            </button>
                            <button
                              onClick={() => handleSelectApplicant(applicant.id)}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: 600 }}
                            >
                              Select & Hire
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RECENT POSTED TASKS OVERVIEW */}
                <div className="card" style={{ padding: '22px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.12rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                        My Posted Tasks Overview
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                        Live opportunities currently listed on the marketplace.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveSection('tasks')}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Manage Tasks ({requirements.length}) <ChevronRight size={13} />
                    </button>
                  </div>

                  {requirements.length === 0 ? (
                    <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                      <Briefcase size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
                      <p style={{ margin: 0, fontSize: '0.85rem' }}>You haven't posted any tasks yet.</p>
                      <button
                        onClick={() => onNavigate('wizard')}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Plus size={14} /> Post a Task Brief
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {requirements.slice(0, 3).map(req => (
                        <div
                          key={req.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '14px 18px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            flexWrap: 'wrap',
                            gap: '12px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>{req.status}</span>
                              <h4 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {req.title}
                              </h4>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Budget: ₹{req.budgetMin?.toLocaleString('en-IN')} - ₹{req.budgetMax?.toLocaleString('en-IN')} • {req.proposalsCount || (req.proposals ? req.proposals.length : 0)} Applications
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              onClick={() => {
                                setSelectedReqForApplicants(req.id);
                                setActiveSection('applicants');
                              }}
                              className="btn btn-secondary btn-sm"
                            >
                              View Applicants
                            </button>
                            <button
                              onClick={() => handleOpenEdit(req)}
                              className="btn btn-secondary btn-sm"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 2. MY POSTED TASKS VIEW */}
            {activeSection === 'tasks' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      My Posted Tasks
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Manage all opportunities, review applicant proposals, and update statuses.
                    </p>
                  </div>
                  <button
                    onClick={() => onNavigate('wizard')}
                    className="btn btn-primary"
                    style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} /> Post a Task
                  </button>
                </div>

                {/* Opportunity Type Tabs */}
                <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', overflowX: 'auto' }}>
                  {[
                    { id: 'all', label: 'All Opportunities' },
                    { id: 'job', label: 'Jobs' },
                    { id: 'task', label: 'Tasks' },
                    { id: 'freelance', label: 'Freelance' },
                    { id: 'internship', label: 'Internships' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setOppTypeFilter(tab.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        backgroundColor: oppTypeFilter === tab.id ? 'var(--accent-primary)' : 'transparent',
                        color: oppTypeFilter === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                        fontWeight: oppTypeFilter === tab.id ? 700 : 500,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter & Search */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {['all', 'Open', 'InProgress', 'Draft', 'Completed', 'Closed', 'Cancelled'].map(st => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        style={{
                          padding: '5px 11px',
                          borderRadius: 'var(--radius-full)',
                          border: '1px solid',
                          borderColor: statusFilter.toLowerCase() === st.toLowerCase() ? 'var(--accent-primary)' : 'var(--border-subtle)',
                          backgroundColor: statusFilter.toLowerCase() === st.toLowerCase() ? 'var(--accent-subtle)' : 'var(--bg-card)',
                          color: statusFilter.toLowerCase() === st.toLowerCase() ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {st === 'all' ? 'All Statuses' : st === 'InProgress' ? 'In Progress' : st}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative', width: '240px' }}>
                    <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Filter briefs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: '30px', height: '34px', fontSize: '0.8rem' }}
                    />
                  </div>
                </div>

                {/* Requirements Cards List */}
                {loading ? (
                  <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Loading posted tasks...</p>
                  </div>
                ) : filteredRequirements.length === 0 ? (
                  <div className="card" style={{ padding: '50px 24px', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}>
                    <Briefcase size={36} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                      No Tasks Found
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
                      {searchQuery || statusFilter !== 'all' || oppTypeFilter !== 'all'
                        ? 'No posted tasks match your filter criteria. Clear filters to view all.'
                        : 'Post your first brief to discover top specialized Doers.'}
                    </p>
                    <button
                      onClick={() => onNavigate('wizard')}
                      className="btn btn-primary btn-sm"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} /> Post a Task
                    </button>
                  </div>
                ) : (
                  filteredRequirements.map(req => {
                    const dynamicAttrs = req.dynamicAttributesJson ? JSON.parse(req.dynamicAttributesJson) : {};
                    const oppType = req.opportunityType || dynamicAttrs.opportunityType || 'Task';
                    const vacancies = req.vacanciesCount || dynamicAttrs.vacanciesCount || 1;
                    const appsCount = req.proposalsCount || (req.proposals ? req.proposals.length : 0);

                    return (
                      <div 
                        key={req.id}
                        className="card"
                        style={{
                          padding: '20px 24px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '16px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-card)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '700px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="badge badge-emerald" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                              {req.status}
                            </span>
                            <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                              {oppType}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {req.categoryName || 'Specialist Category'}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>•</span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {vacancies} {vacancies === 1 ? 'Vacancy' : 'Vacancies'}
                            </span>
                            <span style={{ fontSize: '0.76rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                              • {appsCount} Applications
                            </span>
                          </div>

                          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                            {req.title}
                          </h3>

                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.5 }}>
                            {req.description}
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px', flexWrap: 'wrap' }}>
                            <span>Budget: <strong style={{ color: 'var(--text-primary)' }}>₹{req.budgetMin?.toLocaleString('en-IN')} - ₹{req.budgetMax?.toLocaleString('en-IN')}</strong></span>
                            <span>•</span>
                            <span>Delivery SLA: <strong style={{ color: 'var(--text-primary)' }}>{req.expectedDeliveryDays || 3} Days</strong></span>
                            <span>•</span>
                            <span>Posted {formatRelativeTime(req.createdAtUtc)}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => {
                              setSelectedReqForApplicants(req.id);
                              setActiveSection('applicants');
                            }}
                            className="btn btn-primary btn-sm"
                            style={{ fontWeight: 600 }}
                          >
                            Manage Applications ({appsCount})
                          </button>
                          <button
                            onClick={() => handleOpenEdit(req)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Edit3 size={13} /> Edit
                          </button>
                          {req.status === 'Open' && (
                            <button
                              onClick={() => handleCloseRequirement(req.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--status-danger)' }}
                            >
                              <XCircle size={13} /> Close
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 3. APPLICATIONS RECEIVED VIEW */}
            {activeSection === 'applicants' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Applications Received
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Review candidate applications, compare rates & timelines, chat, and secure milestone payments.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter by Task:</span>
                    <select
                      className="select-field"
                      value={selectedReqForApplicants}
                      onChange={(e) => setSelectedReqForApplicants(e.target.value)}
                      style={{ width: '260px', height: '36px', fontSize: '0.82rem' }}
                    >
                      <option value="all">All Tasks ({allApplicants.length} applicants)</option>
                      {requirements.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.title.substring(0, 40)}... ({r.proposalsCount || (r.proposals ? r.proposals.length : 0)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {filteredApplicants.length === 0 ? (
                  <div className="card" style={{ padding: '50px 24px', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}>
                    <Users size={36} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                      No Applications Received Yet
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px' }}>
                      Applications from verified Doers will appear here once candidates review your posted task briefs.
                    </p>
                    <button
                      onClick={() => onNavigate('browse')}
                      className="btn btn-secondary btn-sm"
                    >
                      <Users size={14} /> Browse & Invite Specialists
                    </button>
                  </div>
                ) : (
                  filteredApplicants.map(applicant => (
                    <div
                      key={applicant.id}
                      className="card"
                      style={{
                        padding: '22px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={applicant.proAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={applicant.proDisplayName}
                            style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 
                                onClick={() => onNavigate('profile', { slug: applicant.proSlug || 'priya-reddy' })}
                                style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, cursor: 'pointer' }}
                              >
                                {applicant.proDisplayName}
                              </h4>
                              <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                                Verified Doer
                              </span>
                              <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '1px 5px' }}>
                                {applicant.status}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                              {applicant.proHeadline}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontWeight: 700 }}>
                                <Star size={12} fill="#F59E0B" /> {applicant.proRating || 4.9}
                              </span>
                              <span>•</span>
                              <span>Applied to: <strong style={{ color: 'var(--text-primary)' }}>{applicant.taskTitle}</strong></span>
                            </div>
                          </div>
                        </div>

                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '8px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}>
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Rate</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                              ₹{applicant.proposedPrice?.toLocaleString('en-IN')}
                            </div>
                          </div>
                          <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />
                          <div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Delivery SLA</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {applicant.estimatedDays} Days
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cover Letter */}
                      <div style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-xs)',
                        backgroundColor: 'var(--bg-secondary)',
                        fontSize: '0.84rem',
                        color: 'var(--text-secondary)',
                        lineHeight: 1.5
                      }}>
                        {applicant.coverLetter || 'Hello, I have reviewed your task requirements and would love to deliver high-converting creative assets matching your brand tone.'}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '4px' }}>
                        <button
                          onClick={() => onNavigate('profile', { slug: applicant.proSlug || 'priya-reddy' })}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={13} /> View Profile & Portfolio
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => onNavigate('messages')}
                            className="btn btn-secondary btn-sm"
                          >
                            <MessageSquare size={13} /> Chat
                          </button>
                          {applicant.status !== 'Shortlisted' && applicant.status !== 'Accepted' && (
                            <button
                              onClick={() => handleShortlist(applicant.id)}
                              className="btn btn-secondary btn-sm"
                            >
                              <Star size={13} /> Shortlist
                            </button>
                          )}
                          {applicant.status !== 'Declined' && (
                            <button
                              onClick={() => handleRejectApplicant(applicant.id)}
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--status-danger)' }}
                            >
                              <UserX size={13} /> Reject
                            </button>
                          )}
                          {applicant.status !== 'Accepted' && (
                            <button
                              onClick={() => handleSelectApplicant(applicant.id)}
                              className="btn btn-primary btn-sm"
                              style={{ fontWeight: 700 }}
                            >
                              <UserCheck size={14} /> Select & Secure Milestone
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 4. ACTIVE WORK / MY WORK VIEW */}
            {activeSection === 'work' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Active Work & Deliverables
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      Track in-progress deliverables, submit revisions, and release payment upon approval.
                    </p>
                  </div>
                  <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Lock size={12} /> 100% Payment Protected
                  </span>
                </div>

                {projects.length === 0 ? (
                  <div className="card" style={{ padding: '50px 24px', textAlign: 'center', backgroundColor: 'var(--bg-card)' }}>
                    <FolderKanban size={36} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                      No Active Work In Progress
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 16px' }}>
                      When you select an applicant's proposal, active contract agreements will be tracked here.
                    </p>
                    <button
                      onClick={() => setActiveSection('applicants')}
                      className="btn btn-primary btn-sm"
                    >
                      Review Applications ({allApplicants.length})
                    </button>
                  </div>
                ) : (
                  projects.map(proj => (
                    <div
                      key={proj.id}
                      className="card"
                      style={{
                        padding: '20px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '680px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className="badge badge-emerald" style={{ fontSize: '0.72rem', fontWeight: 600 }}>
                            Status: {proj.status}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Compensation: <strong style={{ color: 'var(--text-primary)' }}>₹{proj.agreedPrice?.toLocaleString('en-IN')}</strong> (Payment Protected)
                          </span>
                        </div>

                        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {proj.title}
                        </h4>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
                          <span>Assigned Specialist: <strong style={{ color: 'var(--text-primary)' }}>{proj.professionalName}</strong></span>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Deadline: <strong>{proj.deadlineUtc ? formatUniversalDate(proj.deadlineUtc) : 'Flexible'}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => onNavigate('project-tracker', { projectId: proj.id })}
                          className="btn btn-primary btn-sm"
                          style={{ fontWeight: 600 }}
                        >
                          <FolderKanban size={13} /> Project Tracker
                        </button>
                        <button
                          onClick={() => onNavigate('messages')}
                          className="btn btn-secondary btn-sm"
                        >
                          <MessageSquare size={13} /> Chat
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 5. SAVED VIEW */}
            {activeSection === 'saved' && (
              <div className="card" style={{ padding: '36px 24px', textAlign: 'center', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <Bookmark size={36} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Saved Specialists & Bookmarks
                </h3>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto 18px' }}>
                  Bookmark top creators and Doers from the directory to quickly access their profiles for future campaigns.
                </p>
                <button
                  onClick={() => onNavigate('browse')}
                  className="btn btn-primary btn-sm"
                >
                  <Users size={14} /> Find & Bookmark Specialists
                </button>
              </div>
            )}

            {/* 6. NOTIFICATIONS VIEW */}
            {activeSection === 'notifications' && (
              <div className="card" style={{ padding: '28px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                      Notifications & Alerts
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                      Onboarding updates, proposal alerts, and project activity.
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Notification 1: Welcome */}
                  <div 
                    onClick={() => onNavigate('browse')}
                    style={{ 
                      padding: '16px 18px', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: 'var(--accent-subtle)', 
                      border: '1px solid var(--accent-border)', 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(225, 29, 72, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                        👋
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          Welcome to Tnest, {user?.fullName || user?.companyName || 'Partner'}! 👋
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          Welcome to TNest! Explore top opportunities, connect with verified clients and talent, and build your creative brand.
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>Just now</div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onNavigate('browse'); }}
                      className="btn btn-secondary btn-sm"
                      style={{ flexShrink: 0, fontWeight: 600 }}
                    >
                      Browse Talent
                    </button>
                  </div>

                  {/* Notification 2: Complete Profile */}
                  <div 
                    onClick={() => onNavigate('update-client-profile')}
                    style={{ 
                      padding: '16px 18px', 
                      borderRadius: 'var(--radius-sm)', 
                      backgroundColor: 'var(--accent-subtle)', 
                      border: '1px solid var(--accent-border)', 
                      display: 'flex', 
                      alignItems: 'flex-start', 
                      justifyContent: 'space-between',
                      gap: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }}>
                        📝
                      </div>
                      <div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                          Complete Your Profile 📝
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                          Complete your company profile and business information to unlock verified hiring badges and post tasks with 100% trust.
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>Just now</div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onNavigate('update-client-profile'); }}
                      className="btn btn-primary btn-sm"
                      style={{ flexShrink: 0, fontWeight: 700 }}
                    >
                      Complete Profile
                    </button>
                  </div>

                  {/* System Milestone Protection Info */}
                  <div style={{ padding: '14px 18px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <ShieldCheck size={20} color="#10B981" />
                    <div>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>100% Milestone Payment Protection</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Funds are escrowed safely and only released when you inspect and approve completed deliverables.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </main>

        </div>

      </div>

      {/* TASK EDITING MODAL */}
      {editingTask && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%',
            maxWidth: '600px',
            padding: '28px',
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-modal)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Edit Task Brief
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Task Title
                </label>
                <input
                  type="text"
                  className="input-field"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  Task Description & Requirements
                </label>
                <textarea
                  className="textarea-field"
                  rows={4}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  required
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Min Budget (₹)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={editMinBudget}
                    onChange={(e) => setEditMinBudget(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={editMaxBudget}
                    onChange={(e) => setEditMaxBudget(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Expected Delivery (Days)
                  </label>
                  <input
                    type="number"
                    className="input-field"
                    value={editDays}
                    onChange={(e) => setEditDays(Number(e.target.value))}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Task Status
                  </label>
                  <select
                    className="select-field"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Draft">Draft</option>
                    <option value="Completed">Completed</option>
                    <option value="Closed">Closed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="btn btn-primary"
                  style={{ fontWeight: 600 }}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {settingsModalOpen && (
        <SettingsModal onClose={() => setSettingsModalOpen(false)} />
      )}

    </div>
  );
};
