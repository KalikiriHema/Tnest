import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { Proposal, Requirement, MyWorkItem, OpportunityType } from '../types';
import { useAuth } from '../context/AuthContext';
import { MOCK_OPPORTUNITIES, MOCK_MY_WORK, V1_CATEGORIES } from '../data/mockData';
import { TaskDetailModal } from './TaskDetailModal';
import { SettingsModal } from './SettingsModal';
import { formatRelativeTime, formatUniversalDate } from '../utils/timeAgo';
import { 
  Briefcase, 
  MessageSquare, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  ShieldCheck, 
  Layers, 
  MapPin, 
  Send,
  Eye,
  Filter,
  Check,
  AlertCircle,
  FolderKanban,
  Edit3,
  Search,
  Bookmark,
  Bell,
  Settings,
  User as UserIcon,
  Building2,
  Compass,
  LayoutDashboard,
  Calendar,
  X,
  FileText,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Plus
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { calculateProCompletion } from '../utils/profileCompletion';

interface ProDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ProDashboard: React.FC<ProDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  
  // Active Sidebar Section:
  // 'dashboard' | 'earn-money' | 'browse' | 'applications' | 'work' | 'saved' | 'messages' | 'notifications'
  const [activeSection, setActiveSection] = useState<'dashboard' | 'earn-money' | 'browse' | 'applications' | 'work' | 'saved' | 'messages' | 'notifications'>('dashboard');

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [opportunities, setOpportunities] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeWork, setActiveWork] = useState<MyWorkItem[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Requirement | null>(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [savedOppIds, setSavedOppIds] = useState<Set<string>>(new Set(['req-ugc-1', 'req-edit-2']));
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const fetchUnread = async () => {
      try {
        const count = await api.getUnreadMessagesCount(user.id);
        setUnreadMessagesCount(count);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 4000);
    const handleUpdate = () => fetchUnread();
    window.addEventListener('tnest:messages-updated', handleUpdate);
    window.addEventListener('tnest:new-message', handleUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener('tnest:messages-updated', handleUpdate);
      window.removeEventListener('tnest:new-message', handleUpdate);
    };
  }, [user]);
  
  // Filters for Browse / Earn Money
  const [oppTypeTab, setOppTypeTab] = useState<'All' | 'Jobs' | 'Tasks' | 'Freelance' | 'Internships'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minBudget, setMinBudget] = useState<number>(0);

  // Filters for My Applications
  const [appStatusTab, setAppStatusTab] = useState<'All' | 'Pending' | 'Shortlisted' | 'Selected' | 'Rejected' | 'Withdrawn'>('All');
  const [appSearch, setAppSearch] = useState('');

  // Filters for My Work
  const [workStatusTab, setWorkStatusTab] = useState<'All' | 'Assigned' | 'In Progress' | 'Submitted' | 'Revision' | 'Completed' | 'Cancelled'>('All');
  const [workSearch, setWorkSearch] = useState('');

  const [appliedOppIds, setAppliedOppIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('tnest_applied_opps');
      return saved ? new Set(JSON.parse(saved)) : new Set(['req-ugc-1', 'req-edit-2']);
    } catch {
      return new Set(['req-ugc-1', 'req-edit-2']);
    }
  });

  const isDemoCreator = Boolean(
    user?.email === 'priya.reddy@example.com' ||
    user?.email?.toLowerCase().includes('priya') ||
    user?.fullName?.toLowerCase().includes('priya') ||
    user?.slug === 'priya-reddy' ||
    user?.id === 'demo_creator'
  );

  // Load applications, live opportunities, and work
  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        // 1. Fetch proposals
        if (user?.professionalProfileId) {
          try {
            const props = await api.getProProposals(user.professionalProfileId);
            setProposals(props || []);
          } catch {
            setProposals([]);
          }
        }

        // 2. Fetch live opportunities
        try {
          const liveOpps = await api.getOpportunities();
          if (liveOpps && liveOpps.length > 0) {
            setOpportunities(liveOpps);
          } else {
            setOpportunities(MOCK_OPPORTUNITIES);
          }
        } catch {
          setOpportunities(MOCK_OPPORTUNITIES);
        }

        // 3. Active work
        setActiveWork(MOCK_MY_WORK);
      } catch (err) {
        console.warn('Dashboard fetch fallback:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Real matching algorithm based on Doer's profile attributes
  const recommendedOpportunities = useMemo(() => {
    const rawUser = user as any;
    const rawSkills: Array<string | { name: string }> = rawUser?.skills || ['CapCut', 'Premiere Pro', 'Hook Scripting', 'Acting', 'Editing'];
    const doerSkills: string[] = rawSkills.map((s: string | { name: string }) => typeof s === 'string' ? s.toLowerCase() : s.name.toLowerCase());
    
    const rawRoles: Array<string | { name: string }> = rawUser?.roles || ['UGC Video Creator', 'Video Editor'];
    const doerRoles: string[] = rawRoles.map((r: string | { name: string }) => typeof r === 'string' ? r.toLowerCase() : r.name.toLowerCase());
    
    const rawLanguages: string[] = rawUser?.languages || ['Telugu', 'English', 'Hindi'];
    const doerLanguages: string[] = rawLanguages.map((l: string) => l.toLowerCase());

    const scored = opportunities.map(opp => {
      let score = 60; // base score
      
      let dynamicAttr: any = {};
      try {
        if (opp.dynamicAttributesJson) dynamicAttr = JSON.parse(opp.dynamicAttributesJson);
      } catch {
        dynamicAttr = {};
      }

      const oppSkills: string[] = (dynamicAttr.selectedSkills || opp.requiredSkills || []).map((s: string) => s.toLowerCase());
      const oppRole: string = (dynamicAttr.selectedRole || opp.title || '').toLowerCase();
      const oppLanguages: string[] = (opp.requiredLanguages || []).map((l: string) => l.toLowerCase());

      // 1. Role match (+25%)
      if (doerRoles.some((r: string) => oppRole.includes(r) || opp.title.toLowerCase().includes(r))) {
        score += 25;
      }

      // 2. Skill overlap (+15%)
      const skillMatches = oppSkills.filter((s: string) => doerSkills.some((ds: string) => ds.includes(s) || s.includes(ds))).length;
      if (skillMatches > 0) score += Math.min(15, skillMatches * 8);

      // 3. Language match (+10%)
      if (oppLanguages.length === 0 || oppLanguages.some((l: string) => doerLanguages.includes(l))) {
        score += 10;
      }

      const matchPercentage = Math.min(99, Math.max(78, score));

      return {
        ...opp,
        opportunityType: opp.opportunityType || dynamicAttr.opportunityType || 'Freelance',
        locationType: opp.locationType || dynamicAttr.locationType || 'Remote',
        rolesNeeded: opp.rolesNeeded || (dynamicAttr.selectedRole ? [dynamicAttr.selectedRole] : [opp.categoryName || 'Specialist']),
        requiredSkills: opp.requiredSkills || dynamicAttr.selectedSkills || ['Content Creation'],
        deliverables: opp.deliverables || dynamicAttr.deliverables || ['Final deliverables'],
        matchPercentage,
        matchedSkillsCount: skillMatches
      };
    });

    return scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
  }, [opportunities, user]);

  // Applications list
  const allApplications = useMemo(() => {
    if (proposals.length > 0) {
      return proposals.map((p) => ({
        id: p.id,
        requirementId: p.requirementId,
        title: p.requirementTitle || 'Creative Task Brief',
        role: p.categoryName || 'Video Editor / UGC Creator',
        clientName: p.clientCompany || 'Verified Client',
        proposedPrice: p.proposedPrice || 10000,
        estimatedDays: p.estimatedDays ? `${p.estimatedDays} days` : '3 days',
        status: p.status || 'Pending',
        appliedDate: p.createdAtUtc ? formatRelativeTime(p.createdAtUtc) : 'Recently',
        thumb: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80',
        location: 'Remote'
      }));
    }

    return [
      {
        id: 'prop-rec-1',
        requirementId: 'req-ui-1',
        title: 'Website UI Design',
        role: 'Design · UI/UX Designer',
        clientName: 'Studio Bloom',
        proposedPrice: 20000,
        estimatedDays: '5 days',
        status: 'Pending',
        appliedDate: '2 days ago',
        thumb: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=80',
        location: 'Hybrid'
      },
      {
        id: 'prop-rec-2',
        requirementId: 'req-ugc-1',
        title: 'UGC Creator for Brand',
        role: 'UGC & Creators',
        clientName: 'Fashion Hub',
        proposedPrice: 8000,
        estimatedDays: '3 days',
        status: 'Shortlisted',
        appliedDate: 'Sep 27, 2026',
        thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
        location: 'Remote'
      },
      {
        id: 'prop-rec-3',
        requirementId: 'req-content-1',
        title: 'Content Writer for Blog',
        role: 'Writing & Content',
        clientName: 'TechStart',
        proposedPrice: 5000,
        estimatedDays: '2 days',
        status: 'Selected',
        appliedDate: 'Sep 25, 2026',
        thumb: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&auto=format&fit=crop&q=80',
        location: 'Remote'
      },
      {
        id: 'prop-rec-4',
        requirementId: 'req-marketing-1',
        title: 'Social Media Manager',
        role: 'Marketing & Advertising',
        clientName: 'Brandify',
        proposedPrice: 15000,
        estimatedDays: '15 days',
        status: 'Rejected',
        appliedDate: 'Sep 20, 2026',
        thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80',
        location: 'Remote'
      }
    ];
  }, [proposals]);

  // Active work list
  const allMyWork = useMemo(() => {
    return [
      {
        id: 'work-1',
        title: 'Product Video Editing',
        clientName: 'Studio Bloom',
        deadline: 'Oct 5, 2026 (2 days left)',
        status: 'In Progress',
        compensation: 12000,
        thumb: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'work-2',
        title: 'Instagram Reels',
        clientName: 'Fashion Hub',
        deadline: 'Oct 10, 2026',
        status: 'Assigned',
        compensation: 8000,
        thumb: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'work-3',
        title: 'Brand Intro Video',
        clientName: 'TechStart',
        deadline: 'Completed on Sep 15, 2026',
        status: 'Completed',
        compensation: 10000,
        thumb: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=80'
      },
      {
        id: 'work-4',
        title: 'Social Media Content',
        clientName: 'Boom Studio',
        deadline: 'Completed on Sep 1, 2026',
        status: 'Completed',
        compensation: 6000,
        thumb: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&auto=format&fit=crop&q=80'
      }
    ];
  }, []);

  const handleApplySuccess = (opportunity: any) => {
    setAppliedOppIds(prev => {
      const updated = new Set(prev).add(opportunity.id);
      localStorage.setItem('tnest_applied_opps', JSON.stringify(Array.from(updated)));
      return updated;
    });
  };

  const toggleSaveOpp = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedOppIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const profileCompletion = useMemo(() => {
    return user ? calculateProCompletion(user as any) : 0;
  }, [user]);

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Workspace Two-Column Layout */}
      <div className="container" style={{ padding: '24px 20px', maxWidth: '1380px', flex: 1, display: 'flex', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* ========================================================================= */}
        {/* 1. DOER SIDEBAR NAVIGATION (Requirement 12)                              */}
        {/* ========================================================================= */}
        <aside 
          style={{ 
            width: '240px', 
            flexShrink: 0, 
            position: 'sticky', 
            top: '76px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}
        >
          {/* Main Workspace Navigation Card */}
          <div 
            className="card" 
            style={{ 
              padding: '16px 12px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            {/* Top Root: Dashboard */}
            <button
              onClick={() => setActiveSection('dashboard')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: activeSection === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
                color: activeSection === 'dashboard' ? '#FFFFFF' : 'var(--text-primary)',
                fontWeight: activeSection === 'dashboard' ? 700 : 500,
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '0.88rem',
                transition: 'all 0.15s ease',
                marginBottom: '12px'
              }}
            >
              <LayoutDashboard size={16} color={activeSection === 'dashboard' ? '#FFFFFF' : 'var(--text-muted)'} />
              <span>Dashboard</span>
            </button>

            {/* Group 1: DISCOVER */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 12px 6px' }}>
                DISCOVER
              </div>
              
              <button
                onClick={() => setActiveSection('browse')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: (activeSection === 'browse' || (activeSection as string) === 'earn-money') ? 'var(--accent-subtle)' : 'transparent',
                  color: (activeSection === 'browse' || (activeSection as string) === 'earn-money') ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: (activeSection === 'browse' || (activeSection as string) === 'earn-money') ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Compass size={15} color={(activeSection === 'browse' || (activeSection as string) === 'earn-money') ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                <span>Browse Opportunities</span>
              </button>
            </div>

            {/* Group 3: MY ACTIVITY */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 12px 6px' }}>
                MY ACTIVITY
              </div>

              <button
                onClick={() => setActiveSection('applications')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeSection === 'applications' ? 'var(--accent-subtle)' : 'transparent',
                  color: activeSection === 'applications' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: activeSection === 'applications' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Send size={15} color={activeSection === 'applications' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span>My Applications</span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  {allApplications.length}
                </span>
              </button>

              <button
                onClick={() => setActiveSection('work')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeSection === 'work' ? 'var(--accent-subtle)' : 'transparent',
                  color: activeSection === 'work' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: activeSection === 'work' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Briefcase size={15} color={activeSection === 'work' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span>My Work</span>
                </div>
                <span className="badge badge-emerald" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                  {allMyWork.filter(w => w.status !== 'Completed').length} active
                </span>
              </button>

              <button
                onClick={() => setActiveSection('saved')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeSection === 'saved' ? 'var(--accent-subtle)' : 'transparent',
                  color: activeSection === 'saved' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: activeSection === 'saved' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <Bookmark size={15} color={activeSection === 'saved' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                <span>Saved</span>
              </button>
            </div>

            {/* Group 4: COMMUNICATION */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 12px 6px' }}>
                COMMUNICATION
              </div>

              <button
                onClick={() => {
                  onNavigate('messages');
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeSection === 'messages' ? 'var(--accent-subtle)' : 'transparent',
                  color: activeSection === 'messages' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: activeSection === 'messages' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <MessageSquare size={15} color={activeSection === 'messages' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span>Messages</span>
                </div>
                {unreadMessagesCount > 0 && (
                  <span className="badge badge-primary" style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px' }}>
                    {unreadMessagesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveSection('notifications')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeSection === 'notifications' ? 'var(--accent-subtle)' : 'transparent',
                  color: activeSection === 'notifications' ? 'var(--accent-primary)' : 'var(--text-primary)',
                  fontWeight: activeSection === 'notifications' ? 700 : 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bell size={15} color={activeSection === 'notifications' ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span>Notifications</span>
                </div>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#E11D48' }} />
              </button>
            </div>

            {/* Group 5: ACCOUNT */}
            <div>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '4px 12px 6px' }}>
                ACCOUNT
              </div>

              <button
                onClick={() => onNavigate('profile', { slug: user?.slug || 'priya-reddy' })}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <UserIcon size={15} color="var(--text-muted)" />
                <span>Public Profile</span>
              </button>

              <button
                onClick={() => onNavigate('update-profile')}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Edit3 size={15} color="var(--text-muted)" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setSettingsModalOpen(true)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 500,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.84rem',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Settings size={15} color="var(--text-muted)" />
                <span>Settings</span>
              </button>
            </div>

          </div>

          {/* Quick Profile Strength Card */}
          <div 
            className="card"
            style={{
              padding: '14px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Profile Strength
              </span>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {profileCompletion}%
              </span>
            </div>
            <div style={{ width: '100%', height: '5px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${profileCompletion}%`, height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '3px' }} />
            </div>
            <button 
              onClick={() => onNavigate('update-profile')}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '6px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--accent-subtle)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent-primary)',
                fontSize: '0.74rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              Update Doer Skills →
            </button>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* 2. MAIN CONTENT PANELS (Responsive & Dynamic)                             */}
        {/* ========================================================================= */}
        <main style={{ flex: 1, minWidth: 0 }}>

          {/* Top Breadcrumb Navigation */}
          <BreadcrumbNav
            items={[
              { 
                label: user?.role === 'DualRole' ? 'Doer Dashboard' : 'My Dashboard', 
                active: activeSection === 'dashboard', 
                onClick: activeSection !== 'dashboard' ? () => setActiveSection('dashboard') : undefined 
              },
              ...(activeSection !== 'dashboard' ? [{ 
                label: activeSection === 'earn-money' ? 'Browse Opportunities' :
                       activeSection === 'browse' ? 'Browse' :
                       activeSection === 'applications' ? 'My Applications' :
                       activeSection === 'work' ? 'My Work' :
                       activeSection === 'saved' ? 'Saved Tasks' :
                       activeSection === 'messages' ? 'Messages' :
                       activeSection === 'notifications' ? 'Notifications' :
                       'Workspace', 
                active: true 
              }] : [])
            ]}
            backLabel={activeSection !== 'dashboard' ? 'Overview' : 'Back'}
            onBack={activeSection !== 'dashboard' ? () => setActiveSection('dashboard') : undefined}
            onNavigate={onNavigate}
            style={{ marginBottom: '16px', paddingTop: '0' }}
            rightElement={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('profile', { slug: user?.slug || 'my-profile' })}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={13} /> View Live Profile
                </button>
              </div>
            }
          />

          {/* ----------------------------------------------------------------------- */}
          {/* A. SCREEN 1: DOER DASHBOARD OVERVIEW                                    */}
          {/* ----------------------------------------------------------------------- */}
          {activeSection === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
              
              {/* 1. Welcome Banner */}
              <div 
                className="card" 
                style={{ 
                  padding: '28px 32px', 
                  backgroundColor: 'var(--bg-card)', 
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '20px'
                }}
              >
                <div>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                    Welcome back, {user?.fullName || 'Hema'}! 👋
                  </h1>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Here are the latest opportunities matched for you.
                  </p>
                </div>

                <button 
                  onClick={() => setActiveSection('browse')}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '0 24px', height: '42px' }}
                >
                  Browse Opportunities
                </button>
              </div>

              {/* 2. Top Summary Metric Cards (4 Cards) */}
              <div className="grid-cols-4" style={{ gap: '16px' }}>
                {/* Recommended */}
                <div className="card" style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Recommended</span>
                    <Sparkles size={16} color="var(--accent-primary)" />
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>12</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Opportunities matched</div>
                </div>

                {/* Applications */}
                <div className="card" style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Applications</span>
                    <Send size={16} color="var(--accent-primary)" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>8</span>
                    <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>+2 new</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active proposals</div>
                </div>

                {/* Active Work */}
                <div className="card" style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Work</span>
                    <Briefcase size={16} color="#10B981" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>2</span>
                    <span className="badge badge-emerald" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>In-progress</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Deliverables in progress</div>
                </div>

                {/* Completed */}
                <div className="card" style={{ padding: '18px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-card)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Completed</span>
                    <CheckCircle2 size={16} color="var(--status-success)" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>6</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>+4 this month</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>Released contracts</div>
                </div>
              </div>

              {/* 3. Recommended for You Section */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                    Recommended for You
                  </h2>
                  <button 
                    onClick={() => setActiveSection('browse')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.84rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    View All <ArrowRight size={14} />
                  </button>
                </div>

                {/* 3 Matched Cards Row */}
                <div className="grid-cols-3" style={{ gap: '18px' }}>
                  {recommendedOpportunities.slice(0, 3).map((opp, idx) => {
                    const budget = opp.budgetMax ? `₹${opp.budgetMin.toLocaleString()} – ₹${opp.budgetMax.toLocaleString()}` : `₹${opp.budgetMin.toLocaleString()}`;
                    const thumbUrl = idx === 0 
                      ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&auto=format&fit=crop&q=80'
                      : idx === 1 
                      ? 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80';

                    const isSaved = savedOppIds.has(opp.id);

                    return (
                      <div 
                        key={opp.id}
                        className="card"
                        onClick={() => setSelectedOpportunity(opp)}
                        style={{
                          padding: '0',
                          overflow: 'hidden',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Image Thumbnail */}
                        <div style={{ height: '140px', position: 'relative' }}>
                          <img src={thumbUrl} alt={opp.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            onClick={(e) => toggleSaveOpp(opp.id, e)}
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: 'rgba(0,0,0,0.5)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '30px',
                              height: '30px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSaved ? '#F59E0B' : '#FFF',
                              cursor: 'pointer'
                            }}
                          >
                            <Bookmark size={14} fill={isSaved ? '#F59E0B' : 'none'} />
                          </button>
                        </div>

                        {/* Card Body */}
                        <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                              <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{opp.opportunityType || 'Freelance'}</span>
                              <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{opp.locationType || 'Remote'}</span>
                            </div>

                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                              {opp.title}
                            </h3>

                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                              {budget}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                              {opp.vacanciesCount || 3} Vacancies
                            </div>

                            {/* Skills Pills */}
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '12px' }}>
                              {(opp.requiredSkills || ['Premiere Pro', 'CapCut']).slice(0, 3).map((skill: string, sIdx: number) => (
                                <span key={sIdx} className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            <span>Posted 2 days ago</span>
                            <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>View Details →</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Bottom Row: Recent Applications & Active Work */}
              <div className="responsive-2col" style={{ gap: '24px' }}>
                
                {/* Left Card: Recent Applications */}
                <div 
                  className="card"
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Recent Applications
                    </h3>
                    <button 
                      onClick={() => setActiveSection('applications')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View All →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allApplications.slice(0, 3).map((app) => (
                      <div 
                        key={app.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={app.thumb} alt={app.title} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{app.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{app.role} • Applied {app.appliedDate}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span 
                            className={`badge ${
                              app.status === 'Shortlisted' ? 'badge-primary' : 
                              app.status === 'Selected' ? 'badge-emerald' : 
                              app.status === 'Rejected' ? 'badge-neutral' : 'badge-neutral'
                            }`}
                            style={{ fontSize: '0.72rem' }}
                          >
                            {app.status}
                          </span>
                          {app.status === 'Shortlisted' && (
                            <button 
                              onClick={() => onNavigate('messages')}
                              className="btn btn-secondary btn-sm" 
                              style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <MessageSquare size={12} /> Chat
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Card: Active Work */}
                <div 
                  className="card"
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Active Work
                    </h3>
                    <button 
                      onClick={() => setActiveSection('work')}
                      style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      View All →
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {allMyWork.slice(0, 2).map((work) => (
                      <div 
                        key={work.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={work.thumb} alt={work.title} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-xs)', objectFit: 'cover' }} />
                          <div>
                            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{work.title}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Client: {work.clientName} • Deadline: {work.deadline}</div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`badge ${work.status === 'In Progress' ? 'badge-primary' : 'badge-emerald'}`} style={{ fontSize: '0.72rem' }}>
                            {work.status}
                          </span>
                          <button 
                            onClick={() => onNavigate('messages')}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <MessageSquare size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* B. SCREEN 2: BROWSE OPPORTUNITIES / EARN MONEY                          */}
          {/* ----------------------------------------------------------------------- */}
          {(activeSection === 'earn-money' || activeSection === 'browse') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Browse Opportunities
                </h1>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Find tasks, jobs, freelance and internships that match your skills.
                </p>
              </div>

              {/* Universal Search Bar */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{
                  position: 'relative',
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0 14px'
                }}>
                  <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
                  <input 
                    type="text"
                    placeholder="Search tasks, jobs, skills, roles or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.9rem', color: 'var(--text-primary)', height: '42px' }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                      <X size={15} />
                    </button>
                  )}
                </div>
                <button className="btn btn-primary" style={{ fontWeight: 700, padding: '0 24px', height: '42px' }}>
                  Search
                </button>
              </div>

              {/* Filter Row Pills / Dropdowns */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Category Dropdown */}
                <select 
                  className="select-field"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: 'auto', fontSize: '0.82rem', height: '36px', paddingRight: '28px' }}
                >
                  <option value="all">All Categories</option>
                  {V1_CATEGORIES.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>

                {/* Opportunity Type */}
                <select 
                  className="select-field"
                  value={oppTypeTab}
                  onChange={(e: any) => setOppTypeTab(e.target.value)}
                  style={{ width: 'auto', fontSize: '0.82rem', height: '36px', paddingRight: '28px' }}
                >
                  <option value="All">All Types</option>
                  <option value="Jobs">Jobs</option>
                  <option value="Tasks">Tasks</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Internships">Internships</option>
                </select>

                {/* Remote / Location Toggle */}
                <button
                  onClick={() => setRemoteOnly(!remoteOnly)}
                  className={`btn btn-sm ${remoteOnly ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.82rem', height: '36px' }}
                >
                  <MapPin size={13} /> {remoteOnly ? 'Remote Only ✓' : 'Remote & On-site'}
                </button>
              </div>

              {/* Opportunity Type Tabs with counts */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                {(['All', 'Jobs', 'Tasks', 'Freelance', 'Internships'] as const).map((tab) => {
                  const isSelected = oppTypeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setOppTypeTab(tab)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.86rem',
                        cursor: 'pointer'
                      }}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Opportunities List Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recommendedOpportunities
                  .filter(opp => {
                    if (oppTypeTab !== 'All') {
                      const effectiveType = (opp.opportunityType || 'Freelance').toLowerCase();
                      if (oppTypeTab === 'Jobs' && !effectiveType.includes('job')) return false;
                      if (oppTypeTab === 'Tasks' && !effectiveType.includes('task')) return false;
                      if (oppTypeTab === 'Freelance' && !effectiveType.includes('freelance')) return false;
                      if (oppTypeTab === 'Internships' && !effectiveType.includes('internship')) return false;
                    }
                    if (searchQuery.trim()) {
                      const q = searchQuery.toLowerCase();
                      const matchTitle = opp.title.toLowerCase().includes(q);
                      const matchDesc = (opp.description || '').toLowerCase().includes(q);
                      if (!matchTitle && !matchDesc) return false;
                    }
                    if (selectedCategory !== 'all' && opp.categorySlug && opp.categorySlug !== selectedCategory) {
                      return false;
                    }
                    if (remoteOnly && opp.locationType !== 'Remote') {
                      return false;
                    }
                    return true;
                  })
                  .map((opp, idx) => {
                    const budget = opp.budgetMax ? `₹${opp.budgetMin.toLocaleString()} – ₹${opp.budgetMax.toLocaleString()}` : `₹${opp.budgetMin.toLocaleString()}`;
                    const thumbUrl = idx % 2 === 0 
                      ? 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=300&auto=format&fit=crop&q=80';
                    const isSaved = savedOppIds.has(opp.id);

                    return (
                      <div 
                        key={opp.id}
                        className="card"
                        style={{
                          padding: '18px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '20px',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-card)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                          <img src={thumbUrl} alt={opp.title} style={{ width: '80px', height: '64px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                              <span className="badge badge-primary" style={{ fontSize: '0.68rem' }}>{opp.opportunityType || 'Freelance'}</span>
                              <span className="badge badge-neutral" style={{ fontSize: '0.68rem' }}>{opp.locationType || 'Remote'}</span>
                            </div>
                            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {opp.title}
                            </h3>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {opp.categoryName || 'Creative'} • {opp.vacanciesCount || 3} Vacancies • {budget}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                              {(opp.requiredSkills || ['Premiere Pro', 'CapCut']).slice(0, 3).map((s: string, sIdx: number) => (
                                <span key={sIdx} className="badge badge-neutral" style={{ fontSize: '0.66rem' }}>{s}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button
                            onClick={(e) => toggleSaveOpp(opp.id, e)}
                            style={{
                              background: 'none',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              width: '36px',
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSaved ? '#F59E0B' : 'var(--text-muted)',
                              cursor: 'pointer'
                            }}
                          >
                            <Bookmark size={15} fill={isSaved ? '#F59E0B' : 'none'} />
                          </button>

                          <button 
                            onClick={() => setSelectedOpportunity(opp)}
                            className="btn btn-primary btn-sm"
                            style={{ fontWeight: 600, height: '36px', padding: '0 18px' }}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* C. SCREEN 5: MY APPLICATIONS                                            */}
          {/* ----------------------------------------------------------------------- */}
          {activeSection === 'applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  My Applications
                </h1>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Track the status of all opportunities you've applied for.
                </p>
              </div>

              {/* Status Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
                {(['All', 'Pending', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'] as const).map((tab) => {
                  const isSelected = appStatusTab === tab;
                  const count = tab === 'All' ? allApplications.length : allApplications.filter(a => a.status === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setAppStatusTab(tab)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{tab}</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Applications List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allApplications
                  .filter(app => appStatusTab === 'All' || app.status === appStatusTab)
                  .map((app) => (
                    <div 
                      key={app.id}
                      className="card"
                      style={{
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={app.thumb} alt={app.title} style={{ width: '64px', height: '54px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                              {app.title}
                            </h3>
                            <span className={`badge ${
                              app.status === 'Shortlisted' ? 'badge-primary' : 
                              app.status === 'Selected' ? 'badge-emerald' : 
                              app.status === 'Rejected' ? 'badge-neutral' : 'badge-neutral'
                            }`} style={{ fontSize: '0.68rem' }}>
                              {app.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {app.role} • Client: <strong>{app.clientName}</strong>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Proposed: <strong>₹{app.proposedPrice.toLocaleString()}</strong> ({app.estimatedDays}) • Applied {app.appliedDate}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => {
                            const oppMatch = opportunities.find(o => o.id === app.requirementId) || {
                              id: app.requirementId,
                              title: app.title,
                              description: 'Opportunity Brief details for ' + app.title,
                              budgetMin: app.proposedPrice,
                              budgetMax: app.proposedPrice,
                              expectedDeliveryDays: 5,
                              clientCompany: app.clientName
                            };
                            setSelectedOpportunity(oppMatch as Requirement);
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ fontWeight: 600 }}
                        >
                          View Brief
                        </button>

                        {(app.status === 'Shortlisted' || app.status === 'Selected') && (
                          <button 
                            onClick={() => onNavigate('messages')}
                            className="btn btn-primary btn-sm"
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                          >
                            <MessageSquare size={13} /> Chat
                          </button>
                        )}

                        {app.status === 'Pending' && (
                          <button 
                            onClick={() => {
                              alert('Application withdrawn successfully.');
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--status-danger)', fontWeight: 500 }}
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* D. SCREEN 6: MY WORK                                                    */}
          {/* ----------------------------------------------------------------------- */}
          {activeSection === 'work' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  My Work
                </h1>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Manage your active and completed work contracts.
                </p>
              </div>

              {/* Status Tabs */}
              <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
                {(['All', 'Assigned', 'In Progress', 'Submitted', 'Revision', 'Completed', 'Cancelled'] as const).map((tab) => {
                  const isSelected = workStatusTab === tab;
                  const count = tab === 'All' ? allMyWork.length : allMyWork.filter(w => w.status === tab).length;
                  return (
                    <button
                      key={tab}
                      onClick={() => setWorkStatusTab(tab)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.86rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{tab}</span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.7 }}>({count})</span>
                    </button>
                  );
                })}
              </div>

              {/* Work Contracts List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {allMyWork
                  .filter(work => workStatusTab === 'All' || work.status === workStatusTab)
                  .map((work) => (
                    <div 
                      key={work.id}
                      className="card"
                      style={{
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '20px',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <img src={work.thumb} alt={work.title} style={{ width: '64px', height: '54px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                              {work.title}
                            </h3>
                            <span className={`badge ${
                              work.status === 'In Progress' ? 'badge-primary' : 
                              work.status === 'Completed' ? 'badge-emerald' : 'badge-neutral'
                            }`} style={{ fontSize: '0.68rem' }}>
                              {work.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Client: <strong>{work.clientName}</strong> • Deadline: {work.deadline}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            Milestone Compensation: <strong>₹{work.compensation.toLocaleString()}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button 
                          onClick={() => onNavigate('project-tracker', { projectId: work.id })}
                          className="btn btn-secondary btn-sm"
                          style={{ fontWeight: 600 }}
                        >
                          View Work
                        </button>

                        <button 
                          onClick={() => onNavigate('messages')}
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                        >
                          <MessageSquare size={13} /> Chat
                        </button>

                        {work.status === 'Completed' && (
                          <button 
                            onClick={() => onNavigate('profile', { slug: user?.slug || 'priya-reddy' })}
                            className="btn btn-primary btn-sm"
                            style={{ fontWeight: 600 }}
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* E. SAVED OPPORTUNITIES                                                  */}
          {/* ----------------------------------------------------------------------- */}
          {activeSection === 'saved' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Saved Opportunities
                </h1>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Opportunities you've bookmarked for later review.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {recommendedOpportunities
                  .filter(o => savedOppIds.has(o.id))
                  .map((opp) => (
                    <div 
                      key={opp.id}
                      className="card"
                      style={{
                        padding: '18px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                          {opp.title}
                        </h3>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Budget: ₹{opp.budgetMin.toLocaleString()} • {opp.vacanciesCount || 2} Vacancies
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => toggleSaveOpp(opp.id)}
                          className="btn btn-secondary btn-sm"
                        >
                          Remove
                        </button>
                        <button 
                          onClick={() => setSelectedOpportunity(opp)}
                          className="btn btn-primary btn-sm"
                        >
                          View & Apply
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ----------------------------------------------------------------------- */}
          {/* F. NOTIFICATIONS PANEL                                                  */}
          {/* ----------------------------------------------------------------------- */}
          {activeSection === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                  Notifications & Activity
                </h1>
                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
                  Onboarding updates, proposal statuses, client messages, and new opportunity matches.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Notification 1: Welcome Message */}
                <div 
                  onClick={() => onNavigate('opportunities')}
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
                        Welcome to Tnest, {user?.fullName || 'Specialist'}! 👋
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                        Welcome to TNest! Explore top opportunities, connect with verified clients and talent, and build your creative brand.
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>Just now</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onNavigate('opportunities'); }}
                    className="btn btn-secondary btn-sm"
                    style={{ flexShrink: 0, fontWeight: 600 }}
                  >
                    Find Work
                  </button>
                </div>

                {/* Notification 2: Complete Profile */}
                <div 
                  onClick={() => onNavigate('update-profile')}
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
                        Complete your specialist profile (bio, skills, portfolio & hourly rate) to boost your ranking and unlock high-paying client matches.
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '6px' }}>Just now</div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onNavigate('update-profile'); }}
                    className="btn btn-primary btn-sm"
                    style={{ flexShrink: 0, fontWeight: 700 }}
                  >
                    Complete Profile
                  </button>
                </div>

                {/* Activity & Matching Notifications */}
                {[
                  {
                    id: 'notif-1',
                    title: 'Application Shortlisted',
                    message: 'Fashion Hub shortlisted your proposal for UGC Creator for Brand.',
                    time: '15m ago',
                    unread: false
                  },
                  {
                    id: 'notif-2',
                    title: 'New Matching Opportunity',
                    message: 'A new opportunity "High-Retention Reels Editor" matching your profile was posted.',
                    time: '2h ago',
                    unread: false
                  }
                ].map((notif) => (
                  <div 
                    key={notif.id}
                    className="card"
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{notif.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{notif.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* 3. OPPORTUNITY DETAIL & 3-STEP APPLICATION MODAL                          */}
      {/* ========================================================================= */}
      {selectedOpportunity && (
        <TaskDetailModal
          opportunity={selectedOpportunity}
          isOpen={Boolean(selectedOpportunity)}
          isApplied={appliedOppIds.has(selectedOpportunity.id)}
          onClose={() => setSelectedOpportunity(null)}
          onApply={(opp, data) => handleApplySuccess(opp)}
          onNavigateToPoster={(poster) => {
            setSelectedOpportunity(null);
            onNavigate('messages');
          }}
          onNavigateToApplications={() => {
            setSelectedOpportunity(null);
            setActiveSection('applications');
          }}
          onNavigateToOpportunities={() => {
            setSelectedOpportunity(null);
            setActiveSection('browse');
          }}
          onNavigateToClientProfile={(clientId) => {
            setSelectedOpportunity(null);
            onNavigate('client-profile', { clientId });
          }}
          onStartChat={(clientName, title) => {
            setSelectedOpportunity(null);
            onNavigate('messages');
          }}
        />
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <SettingsModal
          onClose={() => setSettingsModalOpen(false)}
        />
      )}

    </div>
  );
};
