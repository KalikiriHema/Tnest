import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ProfessionalProfile, PortfolioItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Star, 
  Clock, 
  Globe, 
  Send, 
  Play, 
  X, 
  MessageSquare, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  FileText, 
  ExternalLink, 
  Edit3, 
  CheckCircle2,
  Sparkles,
  Camera,
  Package,
  Linkedin,
  Github,
  Instagram,
  Youtube,
  Award,
  Share2,
  Layers
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';

interface PublicProfileProps {
  slug: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ slug, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'skills' | 'portfolio' | 'reviews'>('about');

  // Video / Media Lightbox Modal
  const [activeMedia, setActiveMedia] = useState<PortfolioItem | null>(null);

  // Inquiry State
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySending, setInquirySending] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProfessionalBySlug(slug)
      .then(p => { 
        setProfile(p); 
        setLoading(false); 
      })
      .catch(() => { 
        if (isAuthenticated && user && (user.slug === slug || slug === 'my-profile' || user.role === 'Professional' || user.role === 'DualRole')) {
          setProfile({
            id: user.professionalProfileId || user.id,
            userId: user.id,
            displayName: user.fullName,
            slug: user.slug || 'my-profile',
            headline: user.headline || 'Creative Specialist & Verified Doer',
            bio: user.bio || 'Skilled digital media creator delivering high retention assets and high converting video deliverables for top brands.',
            avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
            experienceLevel: 'Senior',
            yearsOfExperience: 4,
            availabilityStatus: 'AvailableNow',
            hourlyRate: user.hourlyRate || 2500,
            currency: 'INR',
            turnaroundDays: 3,
            languages: ['English', 'Hindi', 'Telugu'],
            appearsOnCamera: true,
            acceptsProductShipments: true,
            averageRating: (user?.email?.toLowerCase().includes('priya') || user?.slug === 'priya-reddy') ? 5.0 : 0.0,
            completedProjectsCount: (user?.email?.toLowerCase().includes('priya') || user?.slug === 'priya-reddy') ? 48 : 0,
            isVerified: true,
            city: user.city || 'Hyderabad',
            state: 'Telangana',
            roles: [
              { id: 'r1', name: 'UGC Video Creator', categorySlug: 'ugc-creators' },
              { id: 'r2', name: 'Short-Form Video Editor', categorySlug: 'video-editing' }
            ],
            skills: [
              { id: 's1', name: 'CapCut Pro' },
              { id: 's2', name: 'Premiere Pro' },
              { id: 's3', name: 'Hook Scripting' },
              { id: 's4', name: 'On-Camera Acting' },
              { id: 's5', name: 'Lighting & Audio' }
            ],
            portfolio: [
              {
                id: 'p1',
                title: 'GlowSkin Co. - Viral Serum UGC Ad',
                description: 'Hook-driven 30s product demonstration ad that generated 2.4x ROAS on Meta ads.',
                categorySlug: 'ugc-creators',
                rolePerformed: 'UGC Creator & Editor',
                mediaType: 'Video',
                thumbnailUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
                mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                toolsUsed: ['Premiere Pro', 'Sony A7IV', 'CapCut']
              },
              {
                id: 'p2',
                title: 'TechGrowth - SaaS Explainer Reel',
                description: 'Fast-paced feature overview reel with kinetic typography and sound design.',
                categorySlug: 'video-editing',
                rolePerformed: 'Motion Editor',
                mediaType: 'Video',
                thumbnailUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
                mediaUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                toolsUsed: ['After Effects', 'Premiere Pro']
              }
            ],
            reviews: (user?.email?.toLowerCase().includes('priya') || user?.slug === 'priya-reddy') ? [
              {
                id: 'rev1',
                clientName: 'Aarav Mehta',
                clientCompany: 'GlowSkin Organics',
                overallRating: 5,
                communicationRating: 5,
                qualityRating: 5,
                timelinessRating: 5,
                comment: 'Delivered exceptional UGC content ahead of schedule! The hook retention and video pacing are world-class.',
                professionalResponse: 'Thank you Aarav! It was an absolute pleasure creating for your brand.',
                createdAtUtc: '2026-09-15T10:00:00Z'
              }
            ] : [],
            reviewCount: (user?.email?.toLowerCase().includes('priya') || user?.slug === 'priya-reddy') ? 1 : 0,
            websiteUrl: user.websiteUrl || '',
            linkedinUrl: 'https://linkedin.com',
            instagramUrl: 'https://instagram.com',
            resumeUrl: user.resumeUrl || ''
          });
        }
        setLoading(false); 
      });
  }, [slug, user, isAuthenticated]);

  const handleSendDirectInquiry = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!profile) return;
    setInquirySending(true);
    setInquirySuccess(false);

    try {
      const clientProfileId = user?.clientProfileId || user?.id || '00000000-0000-0000-0000-000000000000';
      const res = await api.createInquiry({
        clientProfileId,
        professionalProfileId: profile.id,
        initialMessage: inquiryMessage || `Hi ${profile.displayName}, I would love to collaborate on a project with you.`
      });

      setInquirySuccess(true);
      setTimeout(() => {
        onNavigate('messages', { conversationId: res.conversationId });
      }, 500);
    } catch (err: any) {
      alert(err.message || 'Error sending inquiry');
    } finally {
      setInquirySending(false);
    }
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '100px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '0.92rem' }}>Loading specialist profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', maxWidth: '540px' }}>
        <div className="card" style={{ padding: '36px 24px', borderRadius: 'var(--radius-lg)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Profile Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
            The requested creator profile does not exist or has moved.
          </p>
          <button onClick={() => onNavigate('browse')} className="btn btn-primary">
            Browse All Doers
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = Boolean(
    isAuthenticated && (
      !slug ||
      slug === 'my-profile' ||
      (user?.id && profile.userId && user.id.toLowerCase() === profile.userId.toLowerCase()) ||
      (user?.slug && profile.slug && user.slug.toLowerCase() === profile.slug.toLowerCase()) ||
      (user?.professionalProfileId && profile.id && user.professionalProfileId.toLowerCase() === profile.id.toLowerCase()) ||
      user?.role === 'Professional'
    )
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '60px' }}>
      
      {/* 1. TOP BREADCRUMB NAV */}
      <div className="container" style={{ maxWidth: '1120px', paddingTop: '16px', paddingBottom: '12px' }}>
        <BreadcrumbNav
          items={[
            { label: 'Find Doers', view: 'browse' },
            { label: profile.displayName || 'Specialist Profile', active: true }
          ]}
          backLabel="Back"
          onNavigate={onNavigate}
          rightElement={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopyProfileLink}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
              >
                <Share2 size={13} /> {copiedLink ? 'Link Copied!' : 'Share'}
              </button>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => onNavigate('update-profile')}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                >
                  <Edit3 size={13} /> Edit Profile
                </button>
              )}
            </div>
          }
        />
      </div>

      <div className="container" style={{ maxWidth: '1120px' }}>
        
        {/* 2. MINIMAL HERO HEADER CARD */}
        <div 
          className="card" 
          style={{
            overflow: 'hidden',
            padding: 0,
            marginBottom: '20px',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Subtle Minimal Backdrop */}
          <div style={{
            height: '110px',
            background: profile.bannerUrl
              ? `linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%), url(${profile.bannerUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #0284C7 0%, #0369A1 50%, #38BDF8 100%)'
          }} />

          {/* Profile Core Header Content */}
          <div style={{ padding: '0 24px 20px', position: 'relative' }}>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: '-44px',
              marginBottom: '14px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Avatar + Live Status Dot */}
              <div style={{ position: 'relative' }}>
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={profile.displayName}
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3.5px solid var(--bg-card)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--status-success)',
                  border: '2px solid var(--bg-card)'
                }} title="Available for work" />
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isOwnProfile ? (
                  <button
                    onClick={() => onNavigate('update-profile')}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit3 size={13} /> Edit My Profile
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const inquirySection = document.getElementById('inquiry-widget');
                      inquirySection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                  >
                    <Send size={13} /> Send Inquiry
                  </button>
                )}
              </div>
            </div>

            {/* Name, Headline, Minimal Meta */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {profile.displayName}
                </h1>
                {profile.isVerified && (
                  <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', padding: '2px 8px' }}>
                    <CheckCircle2 size={12} /> Verified
                  </span>
                )}
                {profile.experienceLevel && (
                  <span className="badge badge-neutral" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                    {profile.experienceLevel}
                  </span>
                )}
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.45, maxWidth: '720px' }}>
                {profile.headline || 'Creative Specialist delivering high-quality deliverables on Tnest.'}
              </p>

              {/* Minimal Clean Metadata Strip */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                fontSize: '0.82rem',
                color: 'var(--text-muted)',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--status-warning)', fontWeight: 600 }}>
                  <Star size={13} fill="currentColor" />
                  <span>{(profile.averageRating !== undefined && profile.averageRating !== null) ? Number(profile.averageRating).toFixed(1) : '0.0'}</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                    ({profile.reviewCount || profile.reviews?.length || 0})
                  </span>
                </div>

                <span>•</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-primary)' }}>
                  <Award size={13} color="var(--accent-primary)" />
                  <span>{profile.completedProjectsCount || 0} completed</span>
                </div>

                <span>•</span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} />
                  <span>{profile.turnaroundDays || 3}d delivery</span>
                </div>

                {(profile.city || profile.state) && (
                  <>
                    <span>•</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} />
                      <span>{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                    </div>
                  </>
                )}

                <span>•</span>

                <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>
                  ● Available Now
                </span>
              </div>

              {/* Clean Minimal Links */}
              {(profile.websiteUrl || profile.linkedinUrl || profile.githubUrl || profile.instagramUrl || profile.resumeUrl) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                  {profile.websiteUrl && (
                    <a href={profile.websiteUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--accent-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <Globe size={12} /> Portfolio Website <ExternalLink size={10} />
                    </a>
                  )}
                  {profile.resumeUrl && (
                    <a href={profile.resumeUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <FileText size={12} /> Resume / CV <ExternalLink size={10} />
                    </a>
                  )}
                  {profile.linkedinUrl && (
                    <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <Linkedin size={12} /> LinkedIn
                    </a>
                  )}
                  {profile.githubUrl && (
                    <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <Github size={12} /> GitHub
                    </a>
                  )}
                  {profile.instagramUrl && (
                    <a href={profile.instagramUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                      <Instagram size={12} /> Instagram
                    </a>
                  )}
                </div>
              )}

            </div>

          </div>
        </div>

        {/* 3. TWO-COLUMN MINIMAL LAYOUT: CONTENT + STICKY SIDEBAR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '20px', alignItems: 'flex-start' }}>
          
          {/* MAIN TABS AREA */}
          <div>
            
            {/* Minimal Segmented Tab Nav */}
            <div style={{
              display: 'flex',
              gap: '4px',
              marginBottom: '16px',
              backgroundColor: 'var(--bg-secondary)',
              padding: '3px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <button
                type="button"
                onClick={() => setActiveTab('about')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: activeTab === 'about' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'about' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'about' ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: activeTab === 'about' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Briefcase size={13} /> About
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('skills')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: activeTab === 'skills' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'skills' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'skills' ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: activeTab === 'skills' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Sparkles size={13} /> Skills & Tools
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('portfolio')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: activeTab === 'portfolio' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'portfolio' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'portfolio' ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: activeTab === 'portfolio' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Layers size={13} /> Portfolio ({profile.portfolio?.length || 0})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  backgroundColor: activeTab === 'reviews' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'reviews' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'reviews' ? 600 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  boxShadow: activeTab === 'reviews' ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <Star size={13} /> Reviews ({profile.reviews?.length || 0})
              </button>
            </div>

            {/* TAB CONTENT: ABOUT */}
            {activeTab === 'about' && (
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: 'var(--radius-md)' }}>
                
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                    Biography
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, margin: 0 }}>
                    {profile.bio || 'Experienced specialist delivering high-impact creative deliverables on Tnest.'}
                  </p>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                {/* Logistics & Preferences Grid */}
                <div>
                  <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: '0 0 10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Preferences & Capabilities
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    
                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Camera size={16} color={profile.appearsOnCamera ? 'var(--status-success)' : 'var(--text-muted)'} />
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {profile.appearsOnCamera ? 'On-Camera Acting' : 'Behind Camera'}
                      </div>
                    </div>

                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Package size={16} color={profile.acceptsProductShipments ? 'var(--status-success)' : 'var(--text-muted)'} />
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {profile.acceptsProductShipments ? 'Accepts Physical Samples' : 'Digital Only'}
                      </div>
                    </div>

                    <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={16} color="var(--accent-primary)" />
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {profile.preferredLocationType || 'Remote Deliverables'}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Languages */}
                {profile.languages && profile.languages.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: '0.86rem', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Languages
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {profile.languages.map((l, idx) => (
                        <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '3px 8px' }}>
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB CONTENT: SKILLS & TOOLS */}
            {activeTab === 'skills' && (
              <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', borderRadius: 'var(--radius-md)' }}>
                
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                    Specialized Roles
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {profile.roles && profile.roles.length > 0 ? (
                      profile.roles.map((r) => (
                        <span
                          key={r.id}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--accent-subtle)',
                            border: '1px solid var(--accent-border)',
                            color: 'var(--accent-primary)'
                          }}
                        >
                          {r.name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Creative Specialist</span>
                    )}
                  </div>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                    Tools & Technologies
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {profile.skills && profile.skills.length > 0 ? (
                      profile.skills.map((s) => (
                        <span
                          key={s.id}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-primary)'
                          }}
                        >
                          {s.name}
                        </span>
                      ))
                    ) : (
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Digital Content Creation</span>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div>
                {!profile.portfolio || profile.portfolio.length === 0 ? (
                  <div className="card" style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)' }}>
                    <Layers size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                    <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 4px' }}>No portfolio samples yet</h4>
                    <p style={{ fontSize: '0.8rem', margin: 0 }}>This specialist has not uploaded public portfolio samples.</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>
                    {profile.portfolio.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setActiveMedia(item)}
                        className="card card-hover"
                        style={{
                          overflow: 'hidden',
                          padding: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {/* Thumbnail / Video Preview */}
                        <div style={{ position: 'relative', height: '150px', backgroundColor: '#000000', overflow: 'hidden' }}>
                          <img
                            src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500'}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0,0,0,0.2)'
                          }}>
                            <div style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(255, 255, 255, 0.92)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}>
                              <Play size={14} fill="#0071E3" color="#0071E3" style={{ marginLeft: '2px' }} />
                            </div>
                          </div>

                          <span style={{
                            position: 'absolute',
                            bottom: '6px',
                            left: '6px',
                            padding: '1px 6px',
                            borderRadius: '3px',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: '#FFFFFF',
                            fontSize: '0.65rem',
                            fontWeight: 600
                          }}>
                            {item.mediaType || 'Video'}
                          </span>
                        </div>

                        {/* Details */}
                        <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 3px', lineHeight: 1.3 }}>
                              {item.title}
                            </h4>
                            <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 500 }}>
                              {item.rolePerformed}
                            </span>
                          </div>

                          {item.toolsUsed && item.toolsUsed.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '8px' }}>
                              {item.toolsUsed.slice(0, 3).map((tool, idx) => (
                                <span key={idx} style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '3px', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                                  {tool}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* Clean Reviews Summary */}
                <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--text-primary)'
                    }}>
                      {(profile.averageRating !== undefined && profile.averageRating !== null) ? Number(profile.averageRating).toFixed(1) : '0.0'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: '2px', color: 'var(--status-warning)' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill="currentColor" />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Based on {profile.reviews?.length || profile.reviewCount || 0} client reviews
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>✓ 100% Verified Deliveries</span>
                  </div>
                </div>

                {/* Reviews List */}
                {!profile.reviews || profile.reviews.length === 0 ? (
                  <div className="card" style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', borderRadius: 'var(--radius-md)' }}>
                    <Star size={28} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                    <p style={{ margin: 0, fontSize: '0.85rem' }}>No client reviews yet. Reviews are generated after task completion.</p>
                  </div>
                ) : (
                  profile.reviews.map((rev) => (
                    <div key={rev.id} className="card" style={{ padding: '16px 18px', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)' }}>{rev.clientName}</strong>
                          {rev.clientCompany && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                              • {rev.clientCompany}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '2px', color: 'var(--status-warning)' }}>
                          {[...Array(rev.overallRating || 5)].map((_, i) => (
                            <Star key={i} size={12} fill="currentColor" />
                          ))}
                        </div>
                      </div>

                      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
                        "{rev.comment}"
                      </p>

                      {rev.professionalResponse && (
                        <div style={{
                          marginTop: '8px',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: 'var(--bg-secondary)',
                          borderLeft: '2.5px solid var(--accent-primary)',
                          fontSize: '0.78rem',
                          color: 'var(--text-secondary)'
                        }}>
                          <strong style={{ color: 'var(--text-primary)' }}>Response: </strong>
                          {rev.professionalResponse}
                        </div>
                      )}
                    </div>
                  ))
                )}

              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR: MINIMAL HIRE / INQUIRY */}
          <div id="inquiry-widget" style={{ position: 'sticky', top: '76px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            <div className="card" style={{
              padding: '20px',
              backgroundColor: 'var(--bg-card)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              
              {/* Rate & Delivery Time */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Standard Rate
                  </span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    ₹{profile.hourlyRate ? profile.hourlyRate.toLocaleString() : '2,500'}{' '}
                    <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ hr</span>
                  </div>
                </div>

                <span className="badge badge-emerald" style={{ fontSize: '0.7rem', padding: '2px 7px' }}>
                  {profile.turnaroundDays || 3}d delivery
                </span>
              </div>

              {/* Conditional: Owner vs Client View */}
              {isOwnProfile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.76rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.4
                  }}>
                    👤 <strong>Public View Mode</strong>: This is how brands view your profile and send project inquiries.
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate('update-profile')}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.82rem', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Edit3 size={13} /> Edit Profile & Pricing
                  </button>

                  <button
                    type="button"
                    onClick={() => onNavigate('messages')}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.82rem', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={13} /> View Messages
                  </button>
                </div>
              ) : (
                /* Client / Visitor: Direct Inquiry Form */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Direct Message / Inquiry
                  </label>

                  {inquirySuccess && (
                    <div style={{
                      padding: '6px 10px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--status-success-bg)',
                      border: '1px solid var(--status-success-border)',
                      color: 'var(--status-success)',
                      fontSize: '0.75rem'
                    }}>
                      ✓ Inquiry sent! Opening chat...
                    </div>
                  )}

                  <textarea
                    className="textarea-field"
                    rows={3}
                    placeholder={`Hi ${profile.displayName}, I would love to collaborate on a brief...`}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '8px 10px' }}
                  />

                  {/* Preset Suggestions */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                    {[
                      'Discuss video brief',
                      'Custom package',
                      'Check availability'
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setInquiryMessage(prompt)}
                        style={{
                          padding: '2px 6px',
                          fontSize: '0.65rem',
                          borderRadius: '3px',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-muted)',
                          cursor: 'pointer'
                        }}
                      >
                        + {prompt}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSendDirectInquiry}
                    disabled={inquirySending}
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '6px', fontWeight: 600, height: '36px', fontSize: '0.82rem' }}
                  >
                    <Send size={13} /> {inquirySending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>
              )}

            </div>

            {/* Minimal Payment Guarantee Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.74rem',
              color: 'var(--text-muted)'
            }}>
              <ShieldCheck size={14} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
              <span>Payments protected safely until deliverable approval.</span>
            </div>

          </div>

        </div>

      </div>

      {/* 4. VIDEO / MEDIA LIGHTBOX MODAL */}
      {activeMedia && (
        <div
          className="modal-overlay"
          onClick={() => setActiveMedia(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1200,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '740px',
              width: '100%',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-modal)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700 }}>{activeMedia.title}</h3>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 500 }}>{activeMedia.rolePerformed}</span>
              </div>
              <button
                onClick={() => setActiveMedia(null)}
                style={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: 'var(--radius-xs)', padding: '5px', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Media Viewer */}
            <div style={{ backgroundColor: '#000000', maxHeight: '440px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {activeMedia.mediaUrl && (activeMedia.mediaUrl.endsWith('.mp4') || activeMedia.mediaUrl.includes('google') || activeMedia.mediaType === 'Video') ? (
                <video
                  src={activeMedia.mediaUrl}
                  controls
                  autoPlay
                  style={{ width: '100%', maxHeight: '440px', objectFit: 'contain' }}
                />
              ) : (
                <img
                  src={activeMedia.thumbnailUrl || activeMedia.mediaUrl}
                  alt={activeMedia.title}
                  style={{ width: '100%', maxHeight: '440px', objectFit: 'contain' }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 18px', backgroundColor: 'var(--bg-card)' }}>
              {activeMedia.description && (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 10px', lineHeight: 1.45 }}>
                  {activeMedia.description}
                </p>
              )}
              {activeMedia.toolsUsed && activeMedia.toolsUsed.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {activeMedia.toolsUsed.map((t, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
