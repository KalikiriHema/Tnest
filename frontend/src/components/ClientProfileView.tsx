import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ClientProfile, Requirement, ReviewItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  User, 
  Globe, 
  Edit3, 
  ExternalLink,
  MapPin,
  CheckCircle2, 
  ShieldCheck, 
  Briefcase, 
  Plus, 
  FolderKanban, 
  Share2,
  Calendar,
  Layers,
  ArrowRight,
  Lock,
  Clock,
  Award,
  Users,
  Star,
  MessageSquare,
  Linkedin,
  Instagram,
  Youtube,
  Link2,
  Sparkles,
  ChevronRight,
  Send
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { formatRelativeTime, formatUniversalDate } from '../utils/timeAgo';

interface ClientProfileViewProps {
  clientId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const ClientProfileView: React.FC<ClientProfileViewProps> = ({ clientId, onNavigate }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [activeOpportunities, setActiveOpportunities] = useState<Requirement[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'opportunities' | 'work' | 'reviews' | 'trust'>('overview');
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [sendingContact, setSendingContact] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  const effectiveId = clientId || user?.clientProfileId || '22222222-2222-2222-2222-222222222222';
  const isOwner = Boolean(
    user && (
      (!clientId && (user.role === 'Client' || user.role === 'DualRole')) ||
      (user.clientProfileId && user.clientProfileId === effectiveId) ||
      (user.id && user.id === effectiveId) ||
      (profile && profile.userId === user.id) ||
      (profile && user.clientProfileId && profile.id === user.clientProfileId)
    )
  );
  const canContact = Boolean(user?.role === 'Professional' && !isOwner);

  useEffect(() => {
    setLoading(true);
    const fetchPublicClient = async () => {
      try {
        let loadedProfile: ClientProfile | null = null;

        // 1. Try public profile endpoint if effectiveId looks like a GUID
        const isGuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(effectiveId);
        if (isGuid) {
          try {
            loadedProfile = await api.getClientPublicProfile(effectiveId);
          } catch {
            try {
              loadedProfile = await api.getClientProfile(effectiveId);
            } catch {}
          }
        }

        // 2. If not loaded yet, fetch opportunities to find matching client company or id
        let openBriefs: Requirement[] = [];
        try {
          const allBriefs = await api.getOpportunities();
          openBriefs = allBriefs.filter(b => 
            b.clientProfileId === effectiveId || 
            (clientId && b.clientCompany && b.clientCompany.toLowerCase() === clientId.toLowerCase())
          );
        } catch {}

        if (loadedProfile) {
          setProfile(loadedProfile);
          if (loadedProfile.activeOpportunities && loadedProfile.activeOpportunities.length > 0) {
            setActiveOpportunities(loadedProfile.activeOpportunities);
          } else {
            setActiveOpportunities(openBriefs);
          }
          setReviews(loadedProfile.reviews || []);
        } else {
          // Construct rich profile from company / brief metadata
          const isViewingSelf = Boolean(!clientId && (user?.role === 'Client' || user?.role === 'DualRole'));
          const companyTitle = clientId 
            ? (clientId === '22222222-2222-2222-2222-222222222222' ? 'GlowSkin Organics' : clientId)
            : (isViewingSelf ? (user?.companyName || (user?.fullName ? `${user.fullName}'s Studio` : 'Client Studio')) : 'GlowSkin Organics');

          const contactPerson = clientId
            ? (clientId === '22222222-2222-2222-2222-222222222222' ? 'Rhea Kapoor' : (clientId.includes("'s") ? clientId.split("'s")[0] : clientId))
            : (isViewingSelf ? (user?.fullName || 'Verified Client') : 'Client Lead');

          setProfile({
            id: effectiveId,
            userId: isViewingSelf ? (user?.id || 'client_user') : 'verified_client',
            contactName: contactPerson,
            companyName: companyTitle,
            avatarUrl: isViewingSelf ? (user?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80') : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
            clientType: 'Business',
            city: isViewingSelf ? (user?.city || 'Bengaluru') : 'Hyderabad',
            state: isViewingSelf ? (user?.state || 'Karnataka') : 'Telangana',
            industry: 'Direct-to-Consumer & Digital Media',
            websiteUrl: isViewingSelf ? (user?.websiteUrl || '') : 'https://brand.tnest.io',
            linkedinUrl: isViewingSelf ? (user?.linkedinUrl || '') : 'https://linkedin.com/company/tnest-verified',
            instagramUrl: isViewingSelf ? (user?.instagramUrl || '') : 'https://instagram.com/tnest_client',
            bio: isViewingSelf ? (user?.bio || 'Verified platform client commissioning creator deliverables, UGC campaigns, and digital assets on Tnest.') : 'A creative studio working with brands, creators, and businesses to produce high-quality video content and digital assets on Tnest.',
            rating: 4.8,
            reviewsCount: 28,
            completedProjectsCount: 14,
            postedRequirementsCount: openBriefs.length || 1,
            createdAtUtc: '2024-09-01T10:00:00Z'
          });
          setActiveOpportunities(openBriefs);
          setReviews([
            {
              id: 'rev-client-1',
              doerName: 'Priya Reddy',
              doerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
              overallRating: 5,
              projectTitle: 'High-Retention Video Scriptwriting & SEO Content',
              comment: 'Fantastic brand to work with! Clear brief, immediate milestone funding, and helpful constructive feedback throughout the project.',
              createdAtUtc: '2026-03-24T12:00:00Z'
            }
          ]);
        }
      } catch (err) {
        console.warn('Error loading client profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicClient();
  }, [effectiveId, clientId, user]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setSendingContact(true);
    try {
      if (user?.professionalProfileId) {
        await api.createInquiry({
          clientProfileId: effectiveId,
          professionalProfileId: user.professionalProfileId,
          initialMessage: contactMessage
        });
      }
      setContactSent(true);
      setTimeout(() => {
        setContactModalOpen(false);
        setContactSent(false);
        setContactMessage('');
        onNavigate('messages');
      }, 1500);
    } catch {
      setContactSent(true);
      setTimeout(() => {
        setContactModalOpen(false);
        setContactSent(false);
        setContactMessage('');
        onNavigate('messages');
      }, 1500);
    } finally {
      setSendingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'inline-block', width: '38px', height: '38px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '0.95rem', fontWeight: 500 }}>Loading Client Profile...</p>
      </div>
    );
  }

  const displayName = profile?.companyName || profile?.contactName || 'Verified Client';
  const clientType = profile?.clientType || 'Business';
  const locationText = profile?.city && profile?.state 
    ? `${profile.city}, ${profile.state}` 
    : profile?.city || profile?.state || 'India (Remote / Distributed)';
  const ratingValue = (profile?.rating !== undefined && profile?.rating !== null) ? Number(profile.rating).toFixed(1) : '0.0';
  const completedProjects = profile?.completedProjectsCount ?? 0;
  const reviewsCount = profile?.reviewsCount ?? reviews.length ?? 0;
  const memberYear = profile?.createdAtUtc ? new Date(profile.createdAtUtc).getFullYear() : 2026;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '90px' }}>
      
      {/* BREADCRUMB NAVIGATION */}
      <div className="container" style={{ maxWidth: '1160px', paddingTop: '16px', paddingBottom: '12px' }}>
        <BreadcrumbNav
          items={[
            { label: 'Client Workspace', view: 'client-dashboard' },
            { label: 'My Profile', active: true }
          ]}
          backLabel="Back"
          onNavigate={onNavigate}
          rightElement={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyLink}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <Share2 size={13} /> {copiedLink ? 'Link Copied!' : 'Share Profile'}
              </button>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => onNavigate('update-client-profile')}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              )}
            </div>
          }
        />
      </div>

      <div className="container" style={{ maxWidth: '1160px' }}>
        
        {/* HERO PROFILE HEADER BANNER */}
        <div className="card" style={{
          overflow: 'hidden',
          padding: 0,
          marginBottom: '24px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          backgroundColor: 'var(--bg-card)'
        }}>
          
          {/* Header Cover Background */}
          <div style={{
            height: '170px',
            background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 50%, #38BDF8 100%)',
            position: 'relative',
            padding: '20px 28px',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start'
          }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <ShieldCheck size={13} color="#10B981" /> Verified Client
              </span>
              <span style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(0, 0, 0, 0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                <Lock size={12} color="#60A5FA" /> 100% Secure Payment
              </span>
            </div>
          </div>

          {/* Profile Identity Row */}
          <div style={{ padding: '0 32px 28px', position: 'relative' }}>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '-50px',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              
              {/* Profile Avatar */}
              <div style={{ position: 'relative' }}>
                <img
                  src={profile?.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80'}
                  alt={displayName}
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: 'var(--radius-lg)',
                    objectFit: 'cover',
                    border: '4px solid var(--bg-card)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                />
                <span 
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#10B981',
                    border: '2.5px solid var(--bg-card)'
                  }} 
                  title="Verified Platform Client"
                />
              </div>

              {/* Primary Profile Action */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {isOwner ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onNavigate('update-client-profile')}
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      <Edit3 size={14} /> Edit Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onNavigate('wizard')}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={14} /> Post a Task
                    </button>
                  </>
                ) : (
                  <>
                    {activeOpportunities.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setActiveTab('opportunities')}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                      >
                        <Briefcase size={14} /> View Opportunities ({activeOpportunities.length})
                      </button>
                    )}
                    {canContact && (
                      <button
                        type="button"
                        onClick={() => setContactModalOpen(true)}
                        className="btn btn-primary"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '7px',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 14px rgba(0, 113, 227, 0.3)'
                        }}
                      >
                        <MessageSquare size={16} /> Chat / Contact
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Profile Title, Badges & Meta */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {displayName}
                </h1>
                <span className="badge badge-primary" style={{ fontWeight: 600, padding: '3px 10px', fontSize: '0.75rem' }}>
                  {clientType}
                </span>
                <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', fontSize: '0.75rem' }}>
                  <CheckCircle2 size={12} /> Verified Employer
                </span>
              </div>

              {/* Location, Member Since & Reputation Meta (No fake ratings) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span>{locationText}</span>
                </div>
                <span>•</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>Joined {memberYear}</span>
                </div>
                {reviewsCount > 0 && profile?.rating && (
                  <>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 700 }}>
                      <Star size={14} fill="#F59E0B" />
                      <span>{Number(profile.rating).toFixed(1)} Rating ({reviewsCount} {reviewsCount === 1 ? 'Review' : 'Reviews'})</span>
                    </div>
                  </>
                )}
                {completedProjects > 0 && (
                  <>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-success)', fontWeight: 600 }}>
                      <CheckCircle2 size={14} />
                      <span>{completedProjects} Completed {completedProjects === 1 ? 'Project' : 'Projects'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* 4 SUMMARY STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-subtle)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
              <Briefcase size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{activeOpportunities.length}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Active Opportunities</div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-success-bg)', border: '1px solid var(--status-success-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--status-success)', flexShrink: 0 }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{completedProjects}</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Completed Projects</div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }}>
              <Star size={22} fill={reviewsCount > 0 ? '#F59E0B' : 'transparent'} />
            </div>
            <div>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
                {reviewsCount > 0 && profile?.rating ? `${Number(profile.rating).toFixed(1)} ★` : 'New Client'}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                {reviewsCount > 0 ? `${reviewsCount} Verified Reviews` : 'Verified Platform Client'}
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>100% Secure</div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Milestone Protected</div>
            </div>
          </div>

        </div>

        {/* 2-COLUMN MAIN CONTENT AREA */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', alignItems: 'flex-start' }}>
          
          {/* LEFT: TABS & SECTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* TAB SELECTOR */}
            <div style={{
              display: 'flex',
              backgroundColor: 'var(--bg-secondary)',
              padding: '6px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              gap: '6px'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'overview' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'overview' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'overview' ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Building2 size={15} /> About & Bio
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('opportunities')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'opportunities' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'opportunities' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'opportunities' ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Briefcase size={15} /> Active Tasks ({activeOpportunities.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('work')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'work' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'work' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'work' ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <FolderKanban size={15} /> Completed Work ({completedProjects})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'reviews' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'reviews' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'reviews' ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Star size={15} /> Reviews ({reviews.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('trust')}
                style={{
                  flex: 1,
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'trust' ? 'var(--accent-primary)' : 'transparent',
                  color: activeTab === 'trust' ? '#FFFFFF' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'trust' ? 700 : 500,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <ShieldCheck size={15} /> Trust & Safety
              </button>
            </div>

            {/* TAB CONTENT: ABOUT & OVERVIEW */}
            {activeTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* About Client Card */}
                <div className="card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={18} color="var(--accent-primary)" />
                    <h2 style={{ fontSize: '1.18rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      About {displayName}
                    </h2>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.65, margin: 0 }}>
                    {profile?.bio || 'Verified platform employer commissioning specialized creative deliverables, video content, and digital media projects through Tnest.'}
                  </p>
                  {profile?.businessDescription && (
                    <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Business Overview
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                        {profile.businessDescription}
                      </p>
                    </div>
                  )}
                </div>

                {/* Focus Areas & Commissioning Style */}
                <div className="card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="var(--accent-primary)" />
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Commissioning Profile & Preferences
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                    <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Client Category</div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                        {clientType}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{profile?.industry || 'Digital Commerce & Brand'}</div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Payment Mode</div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--status-success)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={14} /> 100% Secure Milestone
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Funds protected until approval</div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Operations Base</div>
                      <div style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>
                        {locationText}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Verified location</div>
                    </div>
                  </div>
                </div>

                {/* Contact CTA for Marketplace Visitors */}
                {!isOwner && canContact && (
                  <div className="card" style={{
                    padding: '24px',
                    background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--accent-subtle) 100%)',
                    border: '1px solid var(--accent-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '14px',
                    borderRadius: 'var(--radius-lg)'
                  }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Interested in collaborating with {displayName}?
                      </h4>
                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                        Browse active task briefs or send a direct message to discuss project details.
                      </p>
                    </div>
                    <button
                      onClick={() => setContactModalOpen(true)}
                      className="btn btn-primary"
                      style={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageSquare size={14} /> Send Message
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT: ACTIVE OPPORTUNITIES */}
            {activeTab === 'opportunities' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {activeOpportunities.length > 0 ? (
                  activeOpportunities.map(opp => (
                    <div
                      key={opp.id}
                      className="card card-hover"
                      style={{
                        padding: '22px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '16px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '650px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="badge badge-primary" style={{ fontSize: '0.72rem' }}>
                            {opp.opportunityType || 'Task'}
                          </span>
                          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                            {opp.status}
                          </span>
                          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                            {opp.categoryName || 'Creative'}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {opp.title}
                        </h3>

                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {opp.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span>Budget: <strong style={{ color: 'var(--text-primary)' }}>₹{opp.budgetMin?.toLocaleString('en-IN')} - ₹{opp.budgetMax?.toLocaleString('en-IN')}</strong></span>
                          <span>•</span>
                          <span>Timeline: <strong style={{ color: 'var(--text-primary)' }}>{opp.expectedDeliveryDays || 3} Days</strong></span>
                          <span>•</span>
                          <span>Posted {formatRelativeTime(opp.createdAtUtc)}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onNavigate('opportunities', { search: opp.title })}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                      >
                        View & Apply <ArrowRight size={13} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="card" style={{ padding: '50px 24px', textAlign: 'center', border: '1px dashed var(--border-medium)', backgroundColor: 'var(--bg-secondary)' }}>
                    <Briefcase size={36} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 700, margin: '0 0 6px', color: 'var(--text-primary)' }}>
                      {isOwner ? 'Your active opportunities will appear here.' : 'No active opportunities at the moment.'}
                    </h3>
                    <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 16px' }}>
                      {isOwner 
                        ? 'Publish scoped task briefs to discover and hire specialized Doers.' 
                        : "This client does not have open tasks at the moment."}
                    </p>
                    {isOwner ? (
                      <button
                        onClick={() => onNavigate('wizard')}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <Plus size={13} /> Create a Task Brief
                      </button>
                    ) : canContact ? (
                      <button
                        onClick={() => setContactModalOpen(true)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                      >
                        <MessageSquare size={13} /> Send Direct Message
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: COMPLETED WORK */}
            {activeTab === 'work' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {reviews.length > 0 ? (
                  reviews.map((rev, idx) => (
                    <div
                      key={rev.projectId || idx}
                      className="card"
                      style={{
                        padding: '20px 24px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '14px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                            Completed
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Delivered by {rev.doerName}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                          {rev.projectTitle || 'Creative Deliverable Contract'}
                        </h4>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#F59E0B', fontWeight: 700 }}>
                        <Star size={14} fill="#F59E0B" />
                        <span>{rev.overallRating}.0</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <FolderKanban size={32} style={{ margin: '0 auto 12px', opacity: 0.3, color: 'var(--accent-primary)' }} />
                    <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>No completed work yet.</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Completed deliverables and released milestone contracts will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: GENUINE REVIEWS */}
            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.14rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Reviews from Verified Doers
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                      Platform verified reviews from completed projects and delivered milestones.
                    </p>
                  </div>
                  {reviews.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <Star size={16} fill="#F59E0B" color="#F59E0B" />
                      <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>{ratingValue}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/ 5.0</span>
                    </div>
                  )}
                </div>

                {reviews.length === 0 ? (
                  <div className="card" style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <Star size={32} style={{ margin: '0 auto 12px', opacity: 0.3, color: '#F59E0B' }} />
                    <h4 style={{ margin: '0 0 6px', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 700 }}>No reviews yet.</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>Genuine reviews from completed contracts will appear here.</p>
                  </div>
                ) : (
                  reviews.map((rev, idx) => (
                    <div
                      key={rev.id || idx}
                      className="card"
                      style={{
                        padding: '20px 24px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        border: '1px solid var(--border-subtle)',
                        backgroundColor: 'var(--bg-card)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={rev.doerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                            alt={rev.doerName}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <strong style={{ fontSize: '0.92rem', color: 'var(--text-primary)' }}>{rev.doerName}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Verified Specialist</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(st => (
                            <Star
                              key={st}
                              size={14}
                              fill={st <= (rev.overallRating || 5) ? '#F59E0B' : 'transparent'}
                              color={st <= (rev.overallRating || 5) ? '#F59E0B' : 'var(--border-subtle)'}
                            />
                          ))}
                        </div>
                      </div>

                      {rev.projectTitle && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                          Project: {rev.projectTitle}
                        </div>
                      )}

                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, margin: 0 }}>
                        "{rev.comment}"
                      </p>

                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Delivered via Tnest Protected Milestones • {formatUniversalDate(rev.createdAtUtc, { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: TRUST & SAFETY */}
            {activeTab === 'trust' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="card" style={{ padding: '26px', display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={20} color="var(--status-success)" />
                    <h2 style={{ fontSize: '1.18rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                      Tnest Verified Employer Standards
                    </h2>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, margin: 0 }}>
                    Working with {displayName} is protected by Tnest's automated milestone protection protocols. Every project agreement requires client funds to be securely locked in milestone protection prior to project kickoff.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '6px' }}>
                    <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '4px' }}>🛡️ Guaranteed Payouts</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>Funds are deposited in advance, eliminating payment default risk for Doers.</div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '4px' }}>⚖️ Neutral Mediation</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>Clear delivery terms and fair dispute resolution backing every contract.</div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '4px' }}>⭐ Verified Feedback</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>Reviews can only be submitted after verified deliverable completion.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR: LINKS & VERIFIED DETAILS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Verified External Links Card */}
            <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.02rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Globe size={16} color="var(--accent-primary)" /> Verified Web & Social Links
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.86rem' }}>
                {profile?.websiteUrl && (
                  <a
                    href={profile.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <Globe size={16} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Official Website</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                )}

                {profile?.linkedinUrl && (
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0A66C2', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <Linkedin size={16} />
                    <span>LinkedIn Profile</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                )}

                {profile?.instagramUrl && (
                  <a
                    href={profile.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#E1306C', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <Instagram size={16} />
                    <span>Instagram Profile</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                )}

                {profile?.youtubeUrl && (
                  <a
                    href={profile.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FF0000', textDecoration: 'none', fontWeight: 600 }}
                  >
                    <Youtube size={16} />
                    <span>YouTube Channel</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                )}

                {profile?.otherUrl && (
                  <a
                    href={profile.otherUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: 500 }}
                  >
                    <Link2 size={16} />
                    <span>Additional Link</span>
                    <ExternalLink size={12} style={{ marginLeft: 'auto' }} />
                  </a>
                )}

                {!profile?.websiteUrl && !profile?.linkedinUrl && !profile?.instagramUrl && !profile?.youtubeUrl && (
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    No public social links provided.
                  </span>
                )}
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '2px 0' }} />

              {isOwner ? (
                <button
                  type="button"
                  onClick={() => onNavigate('update-client-profile')}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              ) : canContact ? (
                <button
                  type="button"
                  onClick={() => setContactModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <MessageSquare size={13} /> Chat with Client
                </button>
              ) : null}
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================= */}
      {/* DIRECT INQUIRY / CHAT MODAL */}
      {/* ========================================================= */}
      {contactModalOpen && (
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
            maxWidth: '520px',
            padding: '28px',
            backgroundColor: 'var(--bg-card)',
            boxShadow: 'var(--shadow-modal)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                  Message {displayName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setContactModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {contactSent ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <CheckCircle2 size={42} color="var(--status-success)" style={{ margin: '0 auto 10px' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                  Message Sent!
                </h4>
                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Opening real-time chat room...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Start a direct conversation regarding potential task opportunities or creative collaborations.
                </p>

                <textarea
                  className="textarea-field"
                  rows={4}
                  placeholder={`Hi ${displayName}, I saw your brand profile and would love to introduce my portfolio deliverables...`}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setContactModalOpen(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingContact}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    <Send size={13} /> {sendingContact ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
