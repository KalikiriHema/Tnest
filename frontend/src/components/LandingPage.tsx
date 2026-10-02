import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Briefcase, 
  Users, 
  MapPin, 
  Clock, 
  Calendar, 
  Star, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Zap,
  Building2,
  Lock,
  Layers,
  FileCheck,
  Plus,
  FolderKanban,
  Shield,
  Compass,
  User as UserIcon
} from 'lucide-react';
import { V1_CATEGORIES, MOCK_OPPORTUNITIES, MOCK_DOERS } from '../data/mockData';
import { Requirement, ProfessionalProfile, OpportunityType } from '../types';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, activePersona } = useAuth();
  
  const roleLower = (user?.role || '').toLowerCase();
  const isDoer = Boolean(
    roleLower === 'professional' ||
    roleLower === 'doer' ||
    activePersona === 'doer' ||
    (Boolean(user?.professionalProfileId) && !user?.clientProfileId) ||
    user?.email?.toLowerCase().includes('doer') ||
    user?.fullName?.toLowerCase().includes('doer') ||
    user?.email === 'priya.reddy@example.com' ||
    user?.email === 'priya.ugc@creator.com'
  );

  const [universalSearchQuery, setUniversalSearchQuery] = useState('');

  const [liveOpportunities, setLiveOpportunities] = useState<Requirement[]>(MOCK_OPPORTUNITIES);
  const [liveDoers, setLiveDoers] = useState<ProfessionalProfile[]>(MOCK_DOERS);

  // Stream Filters State
  const [oppFilterCategory, setOppFilterCategory] = useState<string>('all');
  const [oppFilterType, setOppFilterType] = useState<string>('all');
  const [oppRemoteOnly, setOppRemoteOnly] = useState<boolean>(false);

  const [doerFilterRole, setDoerFilterRole] = useState<string>('all');
  const [doerTopRatedOnly, setDoerTopRatedOnly] = useState<boolean>(false);

  // Money & Earnings Calculator State
  const [calcMode, setCalcMode] = useState<'doer' | 'client'>('doer');
  const [calcCategory, setCalcCategory] = useState<'video' | 'ugc' | 'design' | 'dev' | 'writing'>('video');
  const [calcTasksCount, setCalcTasksCount] = useState<number>(6);
  const [calcLevel, setCalcLevel] = useState<'standard' | 'pro' | 'expert'>('pro');

  const RATES: Record<string, Record<'standard' | 'pro' | 'expert', number>> = {
    video: { standard: 3500, pro: 6500, expert: 12000 },
    ugc: { standard: 2500, pro: 5000, expert: 9000 },
    design: { standard: 3000, pro: 6000, expert: 14000 },
    dev: { standard: 8000, pro: 16000, expert: 35000 },
    writing: { standard: 1800, pro: 3800, expert: 7500 }
  };

  const CATEGORY_NAMES: Record<string, string> = {
    video: 'Video Editing & Motion',
    ugc: 'UGC & Creator Content',
    design: 'UI/UX & Brand Design',
    dev: 'App & Web Development',
    writing: 'Technical & Copywriting'
  };

  const filteredOpportunities = liveOpportunities.filter((opp) => {
    if (oppFilterCategory !== 'all') {
      const catMatch = opp.categorySlug === oppFilterCategory || opp.categoryName?.toLowerCase().includes(oppFilterCategory.toLowerCase());
      if (!catMatch) return false;
    }
    if (oppFilterType !== 'all') {
      if ((opp.opportunityType || 'Task').toLowerCase() !== oppFilterType.toLowerCase()) return false;
    }
    if (oppRemoteOnly && opp.locationType !== 'Remote') return false;
    return true;
  });

  const filteredDoers = liveDoers.filter((doer) => {
    if (doerFilterRole !== 'all') {
      const match = (doer.headline || '').toLowerCase().includes(doerFilterRole.toLowerCase()) ||
        (doer.roles || []).some(r => r.name?.toLowerCase().includes(doerFilterRole.toLowerCase()) || r.categorySlug?.includes(doerFilterRole.toLowerCase())) ||
        (doer.skills || []).some(s => s.name?.toLowerCase().includes(doerFilterRole.toLowerCase()));
      if (!match) return false;
    }
    if (doerTopRatedOnly && (doer.averageRating || 0) < 4.0) return false;
    return true;
  });

  useEffect(() => {
    // Fetch live opportunities
    api.getOpportunities().then((res) => {
      if (res && res.length > 0) {
        const normalized = res.map((o: any) => {
          let dynamicAttr: any = {};
          try {
            if (o.dynamicAttributesJson) dynamicAttr = JSON.parse(o.dynamicAttributesJson);
          } catch {}
          return {
            ...o,
            opportunityType: (dynamicAttr.opportunityType as OpportunityType) || o.opportunityType || 'Task',
            clientCompany: o.clientCompany || 'Verified Client'
          };
        });
        const liveIds = new Set(normalized.map((n) => n.id));
        const filteredMock = MOCK_OPPORTUNITIES.filter((m) => !liveIds.has(m.id));
        setLiveOpportunities([...normalized, ...filteredMock]);
      }
    }).catch(() => {});

    // Fetch live doers
    api.getProfessionals().then((res) => {
      if (res && res.length > 0) {
        const liveIds = new Set(res.map((n) => n.id));
        const filteredMock = MOCK_DOERS.filter((m) => !liveIds.has(m.id));
        setLiveDoers([...res, ...filteredMock]);
      }
    }).catch(() => {});
  }, []);

  // Client workspace dynamic summary metrics
  const [clientBriefsCount, setClientBriefsCount] = useState<number>(0);
  const [clientProposalsCount, setClientProposalsCount] = useState<number>(0);
  const [clientActiveProjectsCount, setClientActiveProjectsCount] = useState<number>(0);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'Client') {
      const clientId = user?.clientProfileId || user?.id;
      if (clientId) {
        api.getClientRequirements(clientId).then((reqs) => {
          if (reqs && reqs.length > 0) {
            setClientBriefsCount(reqs.length);
            let totalProps = 0;
            reqs.forEach((r: any) => {
              if (r.proposals) totalProps += r.proposals.length;
            });
            setClientProposalsCount(totalProps);
          } else {
            setClientBriefsCount(2);
            setClientProposalsCount(4);
          }
        }).catch(() => {
          setClientBriefsCount(2);
          setClientProposalsCount(4);
        });

        api.getClientProjects(clientId).then((projs) => {
          if (projs && projs.length > 0) {
            setClientActiveProjectsCount(projs.filter((p: any) => p.status === 'InProgress' || p.status === 'Assigned' || p.status === 'UnderReview').length);
          } else {
            setClientActiveProjectsCount(1);
          }
        }).catch(() => {
          setClientActiveProjectsCount(1);
        });
      }
    }
  }, [isAuthenticated, user]);

  const handleUniversalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (universalSearchQuery.trim()) {
      onNavigate('opportunities', { search: universalSearchQuery });
    } else {
      onNavigate('opportunities');
    }
  };

  return (
    <div>
      
      {/* 1. HERO SECTION: Modern Clean Executive Hub / Product Landing */}
      <section style={{ 
        position: 'relative',
        padding: isAuthenticated ? '44px 0 40px' : '72px 0 64px', 
        borderBottom: '1px solid var(--border-subtle)', 
        background: 'radial-gradient(120% 70% at 50% -10%, rgba(217, 119, 6, 0.08) 0%, rgba(250, 247, 242, 0) 65%), var(--bg-primary)',
        overflow: 'hidden'
      }}>
        {/* Modern Ambient Radial Glow Highlights */}
        <div 
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-120px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '340px',
            background: 'radial-gradient(circle, rgba(217, 119, 6, 0.12) 0%, rgba(217, 119, 6, 0.02) 60%, transparent 80%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
        <div className="container" style={{ maxWidth: '1060px', position: 'relative', zIndex: 1 }}>
          
          {/* ========================================================================= */}
          {/* CLIENT WORKSPACE EXECUTIVE COMMAND HUB */}
          {/* ========================================================================= */}
          {isAuthenticated && user?.role === 'Client' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Executive Top Banner Card */}
              <div 
                className="card"
                style={{
                  padding: '30px 34px',
                  background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(217, 119, 6, 0.04) 50%, var(--bg-secondary) 100%)',
                  border: '1px solid rgba(217, 119, 6, 0.22)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 12px 32px rgba(217, 119, 6, 0.08)',
                  textAlign: 'left',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ maxWidth: '720px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ padding: '3px 10px', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                        Welcome, {user?.companyName || user?.fullName || 'Client'}
                      </span>
                      <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', fontSize: '0.74rem', fontWeight: 600 }}>
                        <ShieldCheck size={13} /> 100% Safe Milestone Protection Active
                      </span>
                    </div>

                    <h1 style={{
                      fontSize: 'clamp(1.85rem, 3.4vw, 2.4rem)',
                      fontWeight: 800,
                      letterSpacing: '-0.025em',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                      lineHeight: 1.2
                    }}>
                      Where Needs Meet Skills.
                    </h1>

                    <p style={{
                      fontSize: '0.94rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      margin: 0,
                      maxWidth: '640px'
                    }}>
                      Post scoped task briefs, match with verified Doers, and track deliverables with milestone-secured payments.
                    </p>
                  </div>

                  {/* Primary Action Button Suite at the end of card */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button 
                      onClick={() => onNavigate('wizard')} 
                      className="btn btn-primary"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontWeight: 700,
                        padding: '10px 20px',
                        boxShadow: '0 4px 14px rgba(217, 119, 6, 0.28)'
                      }}
                    >
                      <Plus size={17} strokeWidth={2.5} />
                      <span>Post New Brief</span>
                    </button>
                    <button 
                      onClick={() => onNavigate('browse')} 
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, padding: '10px 18px' }}
                    >
                      <Users size={16} />
                      <span>Find Doers</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Client-Focused Search & Quick Category Filters */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
                padding: '16px 20px',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-xs)'
              }}>
                <div style={{ flex: '1 1 320px' }}>
                  <form onSubmit={handleUniversalSearch}>
                    <div 
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px', 
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '4px 6px 4px 12px'
                      }}
                    >
                      <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                      <input 
                        type="text"
                        placeholder="Search 100+ verified Doers (e.g. Next.js, UGC Video, UI/UX, SEO)..."
                        value={universalSearchQuery}
                        onChange={(e) => setUniversalSearchQuery(e.target.value)}
                        style={{ 
                          background: 'transparent', 
                          border: 'none', 
                          color: 'var(--text-primary)', 
                          fontSize: '0.88rem', 
                          width: '100%', 
                          outline: 'none' 
                        }}
                      />
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-sm"
                        style={{ padding: '6px 14px', fontSize: '0.82rem' }}
                      >
                        Search
                      </button>
                    </div>
                  </form>
                </div>

                {/* Quick Role Filters */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Quick Hire:</span>
                  {[
                    { label: '🎬 Video Editors', slug: 'video-content' },
                    { label: '📱 UGC Creators', slug: 'ugc-creators' },
                    { label: '💻 Web Devs', slug: 'technology' },
                    { label: '🎨 Designers', slug: 'design' },
                    { label: '📈 Marketers', slug: 'marketing-advertising' }
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onNavigate('opportunities', { category: item.slug })}
                      className="btn btn-ghost btn-sm"
                      style={{
                        padding: '4px 10px',
                        fontSize: '0.78rem',
                        fontWeight: 500,
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          ) : isAuthenticated && user?.role === 'Professional' ? (
            /* ========================================================================= */
            /* SPECIALIST / DOER EXECUTIVE COMMAND HUB */
            /* ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div 
                className="card"
                style={{
                  padding: '30px 34px',
                  background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(217, 119, 6, 0.04) 50%, var(--bg-secondary) 100%)',
                  border: '1px solid rgba(217, 119, 6, 0.22)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 12px 32px rgba(217, 119, 6, 0.08)',
                  textAlign: 'left',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                  <div style={{ maxWidth: '720px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      <span className="badge badge-primary" style={{ padding: '3px 10px', fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                        Welcome, {user?.fullName || 'Specialist'}
                      </span>
                      <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', fontSize: '0.74rem', fontWeight: 600 }}>
                        <Sparkles size={13} /> Verified Specialist Pro
                      </span>
                    </div>

                    <h1 style={{
                      fontSize: 'clamp(1.85rem, 3.4vw, 2.4rem)',
                      fontWeight: 800,
                      letterSpacing: '-0.025em',
                      color: 'var(--text-primary)',
                      marginBottom: '8px',
                      lineHeight: 1.2
                    }}>
                      Where Needs Meet Skills.
                    </h1>

                    <p style={{
                      fontSize: '0.94rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.55,
                      margin: 0,
                      maxWidth: '640px'
                    }}>
                      Discover high-paying client briefs matching your skillset, submit proposals, and earn with guaranteed milestone payouts.
                    </p>
                  </div>

                  {/* Specialist Action Buttons at the end of card */}
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <button 
                      onClick={() => onNavigate('opportunities')} 
                      className="btn btn-primary"
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        fontWeight: 700,
                        padding: '10px 20px',
                        boxShadow: '0 4px 14px rgba(217, 119, 6, 0.28)'
                      }}
                    >
                      <Compass size={17} />
                      <span>Browse Opportunities</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : isAuthenticated && user?.role === 'Admin' ? (
            /* ========================================================================= */
            /* ADMIN EXECUTIVE COMMAND HUB */
            /* ========================================================================= */
            <div 
              className="card"
              style={{
                padding: '30px 34px',
                background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(225, 29, 72, 0.04) 50%, var(--bg-secondary) 100%)',
                border: '1px solid rgba(225, 29, 72, 0.22)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 12px 32px rgba(225, 29, 72, 0.07)',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <span className="badge badge-rose" style={{ padding: '3px 10px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '8px', display: 'inline-block' }}>
                    Platform Administration
                  </span>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    Platform Management & Oversight
                  </h1>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Access moderation queues, audit logs, user verifications, and marketplace settings.
                  </p>
                </div>
                <button 
                  onClick={() => onNavigate('admin')} 
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, backgroundColor: '#E11D48', borderColor: '#E11D48' }}
                >
                  <Shield size={17} />
                  <span>Open Admin Control Center</span>
                </button>
              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* PUBLIC VISITOR / GUEST HERO: THEME 1 NATURAL WARM GLOW */
            /* ========================================================================= */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', position: 'relative' }}>
              
              {/* Decorative Corner Leaf Accents */}
              <div 
                aria-hidden="true" 
                style={{ 
                  position: 'absolute', 
                  bottom: '-20px', 
                  left: '-40px', 
                  width: '120px', 
                  height: '120px', 
                  pointerEvents: 'none', 
                  opacity: 0.85,
                  zIndex: 0
                }}
              >
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path d="M10 90C20 60 50 40 85 35C80 65 60 85 10 90Z" fill="#5C7A58" opacity="0.8" />
                  <path d="M10 90C35 80 55 60 65 30C45 40 25 65 10 90Z" fill="#759870" opacity="0.65" />
                  <path d="M10 90Q50 60 85 35" stroke="#3E573B" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              <div 
                aria-hidden="true" 
                style={{ 
                  position: 'absolute', 
                  bottom: '-20px', 
                  right: '-40px', 
                  width: '120px', 
                  height: '120px', 
                  pointerEvents: 'none', 
                  opacity: 0.85,
                  transform: 'scaleX(-1)',
                  zIndex: 0
                }}
              >
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                  <path d="M10 90C20 60 50 40 85 35C80 65 60 85 10 90Z" fill="#5C7A58" opacity="0.8" />
                  <path d="M10 90C35 80 55 60 65 30C45 40 25 65 10 90Z" fill="#759870" opacity="0.65" />
                  <path d="M10 90Q50 60 85 35" stroke="#3E573B" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* 2-Column Split Master Hero */}
              <div 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1.05fr 0.95fr', 
                  gap: '36px', 
                  alignItems: 'center',
                  textAlign: 'left',
                  position: 'relative',
                  zIndex: 1
                }}
              >
                
                {/* Left Column: Core Value Proposition & Search */}
                <div>
                  {/* Master Headline */}
                  <h1 style={{
                    fontSize: 'clamp(2.5rem, 4vw, 3.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.12,
                    color: '#1C1917',
                    marginBottom: '12px'
                  }}>
                    Where Needs <br />Meet Skills
                  </h1>

                  {/* Subtitle in clear, simple English */}
                  <p style={{
                    fontSize: '1.08rem',
                    color: '#44403C',
                    maxWidth: '460px',
                    margin: '0 0 24px',
                    lineHeight: 1.5,
                    fontWeight: 450
                  }}>
                    Find exceptional talent for your every project.
                  </p>

                  {/* Rounded Search Bar */}
                  <div style={{ maxWidth: '440px', marginBottom: '16px' }}>
                    <form onSubmit={handleUniversalSearch}>
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #DDD5C5',
                          borderRadius: 'var(--radius-full)',
                          padding: '6px 14px 6px 18px',
                          boxShadow: '0 4px 16px rgba(28, 25, 23, 0.05)',
                          transition: 'border-color 0.15s ease'
                        }}
                      >
                        <input 
                          type="text"
                          placeholder="Search for skills, services..."
                          value={universalSearchQuery}
                          onChange={(e) => setUniversalSearchQuery(e.target.value)}
                          style={{ 
                            background: 'transparent', 
                            border: 'none', 
                            color: '#1C1917', 
                            fontSize: '0.94rem', 
                            width: '100%', 
                            outline: 'none' 
                          }}
                        />
                        <button 
                          type="submit" 
                          aria-label="Search"
                          style={{ 
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#C28E2B',
                            padding: '4px'
                          }}
                        >
                          <Search size={19} strokeWidth={2.2} />
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Quick Skill Tags (Pills) matching Sample Theme */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
                    {[
                      { label: 'Video', slug: 'video-content', active: true },
                      { label: 'UGC', slug: 'ugc-creators', active: false },
                      { label: 'Coding', slug: 'technology', active: false },
                      { label: 'Design', slug: 'design', active: false }
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => onNavigate('opportunities', { category: item.slug })}
                        style={{
                          backgroundColor: item.active ? '#C28E2B' : '#FAF8F5',
                          border: `1.5px solid ${item.active ? '#C28E2B' : '#DDD5C5'}`,
                          borderRadius: 'var(--radius-full)',
                          padding: '6px 18px',
                          fontSize: '0.86rem',
                          fontWeight: 600,
                          color: item.active ? '#FFFFFF' : '#44403C',
                          cursor: 'pointer',
                          boxShadow: item.active ? '0 2px 8px rgba(194, 142, 43, 0.28)' : 'none',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!item.active) e.currentTarget.style.backgroundColor = '#F3EFEA';
                        }}
                        onMouseLeave={(e) => {
                          if (!item.active) e.currentTarget.style.backgroundColor = '#FAF8F5';
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                </div>

                {/* Right Column: 3D Nest on Pedestal Showcase (Theme 1 Natural Warm Glow) */}
                <div 
                  style={{ 
                    position: 'relative',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img 
                    src="/tnest-pedestal-nest.jpg" 
                    alt="Tnest Golden Nest Ecosystem & Escrow"
                    style={{
                      width: '100%',
                      maxHeight: '420px',
                      objectFit: 'contain',
                      borderRadius: '24px',
                      display: 'block'
                    }}
                  />
                </div>

              </div>

              {/* Bottom 3-Step Escrow Process Flow Ribbon (Theme 1 Floating Pill Banner) */}
              <div 
                style={{
                  backgroundColor: '#FAF8F5',
                  borderRadius: 'var(--radius-full)',
                  border: '1.5px solid #EBE4D8',
                  padding: '12px 32px',
                  boxShadow: '0 8px 24px rgba(28, 25, 23, 0.05)',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto 1.15fr auto 1.35fr',
                  alignItems: 'center',
                  gap: '20px',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {/* Step 1 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#FEF3C7',
                      background: 'radial-gradient(circle at 35% 30%, #FDE68A 0%, #D97706 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(217, 119, 6, 0.28)'
                    }}
                  >
                    <Plus size={22} color="#FFFFFF" strokeWidth={3} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1C1917', marginBottom: '2px' }}>
                      1. Post Your Need
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#78716C', lineHeight: 1.3 }}>
                      Share your project or task details.
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ color: '#78716C', fontSize: '1.2rem', fontWeight: 300, userSelect: 'none' }}>
                  →
                </div>

                {/* Step 2 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#FEF3C7',
                      background: 'radial-gradient(circle at 35% 30%, #FDE68A 0%, #C28E2B 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(194, 142, 43, 0.28)'
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 14C4 18.5 7.5 21 12 21C16.5 21 20 18.5 20 14C18 15 15 16 12 16C9 16 6 15 4 14Z" fill="#78350F" />
                      <circle cx="12" cy="11" r="5" fill="#FBBF24" stroke="#D97706" strokeWidth="1.2" />
                      <path d="M10 9H14M10 11H14M11.5 9V14" stroke="#78350F" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1C1917', marginBottom: '2px' }}>
                      2. Secure Deposit
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#78716C', lineHeight: 1.3 }}>
                      Payment is held safely until work is completed.
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ color: '#78716C', fontSize: '1.2rem', fontWeight: 300, userSelect: 'none' }}>
                  →
                </div>

                {/* Step 3 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div 
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      backgroundColor: '#DCFCE7',
                      background: 'radial-gradient(circle at 35% 30%, #BBF7D0 0%, #16A34A 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.28)'
                    }}
                  >
                    <CheckCircle2 size={22} color="#FFFFFF" strokeWidth={2.6} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1C1917', marginBottom: '2px' }}>
                      3. Review & Release
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#78716C', lineHeight: 1.3 }}>
                      Approve final work to pay your Doer.
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* 2. CATEGORIES SECTION */}
      <section style={{ padding: '64px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="container">
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h2 style={{ marginBottom: '6px' }}>Explore Categories</h2>
              <p style={{ fontSize: '0.95rem' }}>Find work or hire specialists across core disciplines.</p>
            </div>
            <button 
              onClick={() => onNavigate('opportunities')} 
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--accent-primary)', fontWeight: 600 }}
            >
              All Categories <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid-cols-4" style={{ gap: '16px' }}>
            {V1_CATEGORIES.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => onNavigate('opportunities', { category: cat.slug })}
                className="card card-hover"
                style={{ padding: '20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>{cat.name}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{cat.description}</p>
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.78rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                  {cat.roles.length} Roles available →
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. LIVE OPPORTUNITIES PREVIEW (Visible for Visitors, Doers, DualRole; Hidden for Clients) */}
      {(!isAuthenticated || user?.role === 'Professional' || user?.role === 'DualRole') && (
        <section style={{ padding: '64px 0' }}>
          <div className="container">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Live Opportunities</span>
                <h2 style={{ marginBottom: '6px' }}>Active Opportunities on Tnest</h2>
                <p style={{ fontSize: '0.95rem' }}>Apply directly to open briefs, tasks, and freelance projects.</p>
              </div>
              <button 
                onClick={() => onNavigate('opportunities')}
                className="btn btn-secondary btn-sm"
              >
                Browse All Opportunities <ArrowRight size={14} />
              </button>
            </div>

            {/* Filter Bar for Opportunities */}
            <div style={{ 
              backgroundColor: 'var(--bg-secondary)', 
              padding: '16px 20px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-subtle)',
              marginBottom: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {/* Category Pills */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '6px' }}>Category:</span>
                  {[
                    { id: 'all', label: 'All Opportunities' },
                    { id: 'video', label: 'Video & Motion' },
                    { id: 'ugc', label: 'UGC & Content' },
                    { id: 'design', label: 'UI/UX & Design' },
                    { id: 'tech', label: 'Tech & Dev' },
                    { id: 'marketing', label: 'Marketing' }
                  ].map((item) => {
                    const isActive = oppFilterCategory === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setOppFilterCategory(item.id)}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          fontWeight: isActive ? 600 : 500,
                          borderRadius: '20px',
                          border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          backgroundColor: isActive ? 'var(--accent-light)' : 'var(--bg-primary)',
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {(oppFilterCategory !== 'all' || oppFilterType !== 'all' || oppRemoteOnly) && (
                  <button
                    onClick={() => {
                      setOppFilterCategory('all');
                      setOppFilterType('all');
                      setOppRemoteOnly(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: '4px 8px'
                    }}
                  >
                    Reset filters
                  </button>
                )}
              </div>

              {/* Sub-Filters: Type & Remote */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '4px' }}>Type:</span>
                  {[
                    { id: 'all', label: 'All Types' },
                    { id: 'task', label: 'Task' },
                    { id: 'job', label: 'Job' },
                    { id: 'freelance', label: 'Freelance' },
                    { id: 'internship', label: 'Internship' }
                  ].map((t) => {
                    const isActive = oppFilterType === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setOppFilterType(t.id)}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          fontWeight: isActive ? 600 : 500,
                          borderRadius: 'var(--radius-xs)',
                          border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          backgroundColor: isActive ? 'var(--accent-light)' : 'var(--bg-primary)',
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => setOppRemoteOnly(!oppRemoteOnly)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 12px',
                      fontSize: '0.78rem',
                      fontWeight: oppRemoteOnly ? 600 : 500,
                      borderRadius: '20px',
                      border: oppRemoteOnly ? '1px solid var(--status-success)' : '1px solid var(--border-subtle)',
                      backgroundColor: oppRemoteOnly ? '#E6F4EA' : 'var(--bg-primary)',
                      color: oppRemoteOnly ? '#137333' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: oppRemoteOnly ? '#137333' : '#9AA0A6' }} />
                    Remote Only
                  </button>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {filteredOpportunities.length} {filteredOpportunities.length === 1 ? 'result' : 'results'}
                  </span>
                </div>
              </div>
            </div>

            {/* Opportunities Cards Grid */}
            {filteredOpportunities.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px dashed var(--border-subtle)' 
              }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  No active opportunities found matching your filters.
                </p>
                <button
                  onClick={() => {
                    setOppFilterCategory('all');
                    setOppFilterType('all');
                    setOppRemoteOnly(false);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid-cols-3" style={{ gap: '20px' }}>
                {filteredOpportunities.slice(0, 6).map((opp) => (
                  <div 
                    key={opp.id}
                    onClick={() => onNavigate('opportunities', { search: opp.title })}
                    className="card card-hover"
                    style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      
                      {/* Meta Category & Badges */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>{opp.categoryName}</span>
                          <span className="badge badge-neutral" style={{ fontSize: '0.72rem' }}>{opp.opportunityType || 'Task'}</span>
                        </div>
                        {opp.locationType === 'Remote' && (
                          <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Remote</span>
                        )}
                      </div>

                      {/* Title & Client */}
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                        {opp.title}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                        Posted by {opp.clientCompany || 'Verified Client'}
                      </span>

                      {/* Description snippet */}
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {opp.description}
                      </p>

                      {/* Skills tags */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '18px' }}>
                        {(opp.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                          <span key={idx} style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            {skill}
                          </span>
                        ))}
                      </div>

                    </div>

                    {/* Bottom Budget & CTA */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Budget</span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                          {opp.budgetMax ? `₹${opp.budgetMin.toLocaleString()} - ₹${opp.budgetMax.toLocaleString()}` : `₹${opp.budgetMin.toLocaleString()}`}
                        </strong>
                      </div>
                      <button className="btn btn-secondary btn-sm">
                        View Brief
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* 4. VERIFIED DOERS PREVIEW (Visible for Visitors, Clients, DualRole; Hidden for pure Doers) */}
      {(!isAuthenticated || user?.role === 'Client' || user?.role === 'DualRole') && (
        <section style={{ padding: '64px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>Verified Talent</span>
                <h2 style={{ marginBottom: '6px' }}>Featured Doers on Tnest</h2>
                <p style={{ fontSize: '0.95rem' }}>Inspect portfolios, client reviews, and connect directly with specialists.</p>
              </div>
              <button 
                onClick={() => onNavigate('browse')}
                className="btn btn-secondary btn-sm"
              >
                Find More Doers <ArrowRight size={14} />
              </button>
            </div>

            {/* Filter Bar for Featured Doers */}
            <div style={{ 
              backgroundColor: 'var(--bg-primary)', 
              padding: '16px 20px', 
              borderRadius: 'var(--radius-md)', 
              border: '1px solid var(--border-subtle)',
              marginBottom: '28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Role Pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: '6px' }}>Role:</span>
                {[
                  { id: 'all', label: 'All Roles' },
                  { id: 'video', label: 'Video Editors' },
                  { id: 'ugc', label: 'UGC Creators' },
                  { id: 'design', label: 'Designers' },
                  { id: 'developer', label: 'Developers' },
                  { id: 'writing', label: 'Writers' }
                ].map((r) => {
                  const isActive = doerFilterRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setDoerFilterRole(r.id)}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.82rem',
                        fontWeight: isActive ? 600 : 500,
                        borderRadius: '20px',
                        border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isActive ? 'var(--accent-light)' : 'var(--bg-secondary)',
                        color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>

              {/* Right side toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setDoerTopRatedOnly(!doerTopRatedOnly)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: doerTopRatedOnly ? 600 : 500,
                    borderRadius: '20px',
                    border: doerTopRatedOnly ? '1px solid #E2A03F' : '1px solid var(--border-subtle)',
                    backgroundColor: doerTopRatedOnly ? '#FEF7E0' : 'var(--bg-secondary)',
                    color: doerTopRatedOnly ? '#B06000' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Star size={13} fill={doerTopRatedOnly ? '#B06000' : 'none'} />
                  Top Rated (4.0+)
                </button>

                {(doerFilterRole !== 'all' || doerTopRatedOnly) && (
                  <button
                    onClick={() => {
                      setDoerFilterRole('all');
                      setDoerTopRatedOnly(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-primary)',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      padding: '4px 8px'
                    }}
                  >
                    Reset
                  </button>
                )}

                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {filteredDoers.length} {filteredDoers.length === 1 ? 'doer' : 'doers'}
                </span>
              </div>
            </div>

            {/* Doers Cards Grid */}
            {filteredDoers.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '48px 24px', 
                backgroundColor: 'var(--bg-primary)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px dashed var(--border-subtle)' 
              }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  No verified doers found matching your role filters.
                </p>
                <button
                  onClick={() => {
                    setDoerFilterRole('all');
                    setDoerTopRatedOnly(false);
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid-cols-3" style={{ gap: '20px' }}>
                {filteredDoers.slice(0, 6).map((doer) => (
                  <div 
                    key={doer.id}
                    className="card card-hover"
                    style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      
                      {/* Top Profile Info */}
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '14px' }}>
                        <img 
                          src={doer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                          alt={doer.displayName} 
                          style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                        />
                        <div>
                          <h4 
                            onClick={() => onNavigate('profile', { slug: doer.slug })}
                            style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                          >
                            {doer.displayName}
                          </h4>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                            {doer.headline}
                          </p>
                        </div>
                      </div>

                      {/* Rating & Tasks completed */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                        {doer.averageRating && doer.averageRating > 0 ? (
                          <span style={{ color: 'var(--status-warning)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                            <Star size={13} fill="currentColor" /> {doer.averageRating.toFixed(1)} ({doer.reviewCount || doer.reviews?.length || 0})
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>New Doer</span>
                        )}
                        <span>•</span>
                        <span>{doer.completedProjectsCount || 0} Tasks Done</span>
                        <span>•</span>
                        <span style={{ color: 'var(--status-success)', fontWeight: 500 }}>Available</span>
                      </div>

                      {/* Skills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '18px' }}>
                        {doer.skills.slice(0, 3).map((s) => (
                          <span key={s.id} style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                            {s.name}
                          </span>
                        ))}
                      </div>

                    </div>

                    {/* Footer Rate & Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>₹{doer.hourlyRate.toLocaleString()}</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / hr</span>
                      </div>
                      <button 
                        onClick={() => onNavigate('profile', { slug: doer.slug })}
                        className="btn btn-secondary btn-sm"
                      >
                        View Profile
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        </section>
      )}

      {/* 5. HOW IT WORKS */}
      <section style={{ padding: '64px 0', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container" style={{ maxWidth: '920px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Workflow</span>
            <h2 style={{ marginBottom: '8px' }}>How Tnest Works</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              A transparent, safe, and structured process for every collaboration.
            </p>
          </div>

          <div className="grid-cols-3" style={{ gap: '24px' }}>
            
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>
                1
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Post or Discover</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Clients post clear task briefs. Doers discover opportunities matching their specific skills and submit proposals.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>
                2
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Chat & Collaborate</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Communicate directly via built-in messaging. Align on scope, share draft deliverables, and track progress.
              </p>
            </div>

            <div className="card" style={{ padding: '24px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.9rem', marginBottom: '16px' }}>
                3
              </div>
              <h4 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Approve & Release</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Milestone funds are securely held and only released when the client approves completed work. Leave verified feedback.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. LIVE RATES & MONEY CALCULATOR SECTION (Visible for Visitors, Doers, DualRole; Hidden for pure Clients) */}
      {(!isAuthenticated || user?.role === 'Professional' || user?.role === 'DualRole') && (
        <section style={{ padding: '72px 0', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-primary)' }}>
          <div className="container">
            
            <div style={{ textAlign: 'center', marginBottom: '36px' }}>
              <span className="badge badge-primary" style={{ marginBottom: '8px' }}>Transparent Rates & Calculator</span>
              <h2 style={{ marginBottom: '6px' }}>Estimate Your Earnings or Project Budget</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                Whether pricing a task as a client or forecasting monthly income as a Doer, Tnest provides upfront transparency with 0% hidden fees.
              </p>
            </div>

            <div 
              className="card" 
              style={{ 
                maxWidth: '880px', 
                margin: '0 auto', 
                padding: '28px 32px', 
                textAlign: 'left',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-sm)',
                backgroundColor: 'var(--bg-primary)'
              }}
            >
              {/* Calculator Header & Mode Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '22px', paddingBottom: '16px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <span className="badge badge-primary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                    Interactive Rate Simulator
                  </span>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {calcMode === 'doer' ? 'Estimate Your Potential Earnings' : 'Estimate Your Project Budget'}
                  </h3>
                </div>

                {/* Mode Toggle Tabs */}
                <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '3px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <button
                    type="button"
                    onClick={() => setCalcMode('doer')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: calcMode === 'doer' ? 'var(--bg-primary)' : 'transparent',
                      color: calcMode === 'doer' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      boxShadow: calcMode === 'doer' ? 'var(--shadow-xs)' : 'none'
                    }}
                  >
                    Doer Earnings
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcMode('client')}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-xs)',
                      border: 'none',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      backgroundColor: calcMode === 'client' ? 'var(--bg-primary)' : 'transparent',
                      color: calcMode === 'client' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      boxShadow: calcMode === 'client' ? 'var(--shadow-xs)' : 'none'
                    }}
                  >
                    Client Budget
                  </button>
                </div>
              </div>

              {/* Calculator Controls Grid */}
              <div className="grid-cols-2" style={{ gap: '28px', alignItems: 'center' }}>
                
                {/* Left Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  
                  {/* 1. Category Selector */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      Select Skill / Domain
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {[
                        { key: 'video', label: 'Video & Motion' },
                        { key: 'ugc', label: 'UGC Content' },
                        { key: 'design', label: 'UI/UX Design' },
                        { key: 'dev', label: 'Tech & Dev' },
                        { key: 'writing', label: 'Copywriting' }
                      ].map((cat) => (
                        <button
                          key={cat.key}
                          type="button"
                          onClick={() => setCalcCategory(cat.key as any)}
                          style={{
                            padding: '5px 11px',
                            borderRadius: 'var(--radius-xs)',
                            border: calcCategory === cat.key ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                            backgroundColor: calcCategory === cat.key ? 'var(--status-info-bg)' : 'var(--bg-secondary)',
                            color: calcCategory === cat.key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Experience / Complexity Tier */}
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                      Experience & Complexity Tier
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {(['standard', 'pro', 'expert'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => setCalcLevel(lvl)}
                          style={{
                            padding: '7px 10px',
                            borderRadius: 'var(--radius-xs)',
                            border: calcLevel === lvl ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                            backgroundColor: calcLevel === lvl ? 'var(--status-info-bg)' : 'var(--bg-secondary)',
                            color: calcLevel === lvl ? 'var(--accent-primary)' : 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            textTransform: 'capitalize',
                            cursor: 'pointer'
                          }}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Slider: Number of Tasks/Month */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {calcMode === 'doer' ? 'Projects / Tasks per Month:' : 'Project Volume / Deliverables:'}
                      </label>
                      <strong style={{ fontSize: '0.95rem', color: 'var(--accent-primary)' }}>
                        {calcTasksCount} {calcTasksCount === 1 ? 'task' : 'tasks'}
                      </strong>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      value={calcTasksCount}
                      onChange={(e) => setCalcTasksCount(Number(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>1 task</span>
                      <span>10 tasks</span>
                      <span>20 tasks</span>
                    </div>
                  </div>

                </div>

                {/* Right Result Display Card */}
                <div 
                  style={{ 
                    padding: '24px', 
                    borderRadius: 'var(--radius-sm)', 
                    backgroundColor: 'var(--bg-secondary)', 
                    border: '1px solid var(--border-medium)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      {calcMode === 'doer' ? 'Estimated Monthly Earnings' : 'Estimated Total Project Budget'}
                    </span>
                    <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                      ₹{(RATES[calcCategory][calcLevel] * calcTasksCount).toLocaleString()}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                      Based on avg. <strong>₹{RATES[calcCategory][calcLevel].toLocaleString()}</strong> per {CATEGORY_NAMES[calcCategory]} task
                    </span>
                  </div>

                  <div style={{ margin: '18px 0', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Milestone Payment Security:</span>
                      <strong style={{ color: 'var(--status-success)' }}>100% Guaranteed</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Average Payout Speed:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>Within 48h</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Platform Upfront Fee:</span>
                      <strong style={{ color: 'var(--accent-primary)' }}>₹0 (Free Listing)</strong>
                    </div>
                  </div>

                  {calcMode === 'doer' ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) onOpenAuth('register');
                        else onNavigate('opportunities');
                      }}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Start Earning on Tnest
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (!isAuthenticated) onOpenAuth('login');
                        else onNavigate('wizard');
                      }}
                      className="btn btn-primary"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      Post Task at this Budget
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>
        </section>
      )}

      {/* 7. BOTTOM CALL TO ACTION */}
      <section style={{ padding: '64px 0', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Ready to get started on Tnest?</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '28px' }}>
            {isAuthenticated && user?.role === 'Client'
              ? 'Post a scoped brief with milestone protection or discover verified talent today.'
              : isAuthenticated && user?.role === 'Professional'
              ? 'Browse live opportunities matching your skills and start earning with guaranteed milestone payouts.'
              : 'Post a task today or create your Doer profile to explore open opportunities.'}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {isAuthenticated && user?.role === 'Client' ? (
              <>
                <button 
                  onClick={() => onNavigate('wizard')}
                  className="btn btn-primary btn-lg"
                >
                  + Post New Brief
                </button>
                <button 
                  onClick={() => onNavigate('browse')}
                  className="btn btn-secondary btn-lg"
                >
                  Find Doers
                </button>
              </>
            ) : isAuthenticated && user?.role === 'Professional' ? (
              <>
                <button 
                  onClick={() => onNavigate('opportunities')}
                  className="btn btn-primary btn-lg"
                >
                  Browse Opportunities
                </button>
                <button 
                  onClick={() => onNavigate('pro-dashboard')}
                  className="btn btn-secondary btn-lg"
                >
                  My Dashboard
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => {
                    if (!isAuthenticated) onOpenAuth('login');
                    else onNavigate('wizard');
                  }}
                  className="btn btn-primary btn-lg"
                >
                  Post Task
                </button>
                <button 
                  onClick={() => onNavigate('opportunities')}
                  className="btn btn-secondary btn-lg"
                >
                  Browse Opportunities
                </button>
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};

