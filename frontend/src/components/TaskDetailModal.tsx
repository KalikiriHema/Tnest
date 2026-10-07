import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Briefcase, 
  FileText, 
  Paperclip, 
  ShieldCheck, 
  MessageSquare, 
  Check, 
  UploadCloud, 
  Link as LinkIcon, 
  Trash2, 
  Building2,
  Calendar,
  CheckCircle2,
  Bookmark,
  Sparkles,
  DollarSign,
  Users,
  MapPin,
  Send,
  Star,
  ArrowRight,
  ArrowLeft,
  Eye,
  Plus,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Requirement } from '../types';
import { formatRelativeTime } from '../utils/timeAgo';

export interface TaskDetailModalProps {
  opportunity: any;
  isOpen?: boolean;
  isApplied?: boolean;
  onClose: () => void;
  onApply: (opportunity: any, applicationData?: any) => void;
  onNavigateToPoster?: (posterName: string) => void;
  onNavigateToApplications?: () => void;
  onNavigateToOpportunities?: () => void;
  onNavigateToClientProfile?: (clientId?: string) => void;
  onStartChat?: (clientName: string, title: string) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  opportunity,
  isOpen = true,
  isApplied = false,
  onClose,
  onApply,
  onNavigateToPoster,
  onNavigateToApplications,
  onNavigateToOpportunities,
  onNavigateToClientProfile,
  onStartChat
}) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  
  // Application Wizard Steps: 'view' | 'apply_form' | 'apply_review' | 'apply_submitted'
  const [modalMode, setModalMode] = useState<'view' | 'apply_form' | 'apply_review' | 'apply_submitted'>('view');

  // Application Form State
  const [fitReason, setFitReason] = useState('');
  const [proposedPrice, setProposedPrice] = useState<number>(opportunity?.budgetMin || 10000);
  const [priceType, setPriceType] = useState<'Per Project' | 'Per Task' | 'Per Hour'>('Per Project');
  const [estimatedDays, setEstimatedDays] = useState<string>(
    opportunity?.expectedDeliveryDays ? `${opportunity.expectedDeliveryDays} days` : '5 days'
  );
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<string[]>(['port-1', 'port-2']);
  const [additionalMessage, setAdditionalMessage] = useState('');
  const [customAttachments, setCustomAttachments] = useState<Array<{ id: string; name: string; size: string; type: 'file' | 'link' }>>([]);
  const [submitting, setSubmitting] = useState(false);

  // Close on Escape or step back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (modalMode === 'apply_form') setModalMode('view');
        else if (modalMode === 'apply_review') setModalMode('apply_form');
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, modalMode, onClose]);

  if (!isOpen || !opportunity) return null;

  const budgetDisplay = opportunity.budgetMax && opportunity.budgetMax > opportunity.budgetMin 
    ? `₹${opportunity.budgetMin.toLocaleString()} – ₹${opportunity.budgetMax.toLocaleString()}`
    : `₹${(opportunity.budgetMin || 10000).toLocaleString()}`;

  const startedDate = formatRelativeTime(opportunity.createdAtUtc || opportunity.createdAt);
  const posterName = opportunity.clientCompany || opportunity.clientName || 'Studio Bloom';
  const vacancies = opportunity.vacanciesCount || 3;
  const oppType = opportunity.opportunityType || 'Freelance';
  const locationText = opportunity.locationType === 'Remote' ? 'Remote' : (opportunity.city || 'Remote');
  const roleName = opportunity.rolesNeeded?.[0] || opportunity.selectedRole || 'Reels / Shorts Editor';
  const categoryName = opportunity.categoryName || 'Video & Content';

  // Doer Portfolio Items for selection
  const userPortfolio = [
    { 
      id: 'port-1', 
      title: 'Viral UGC Product Ad Demo', 
      type: 'Video (9:16)',
      thumb: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&auto=format&fit=crop&q=80'
    },
    { 
      id: 'port-2', 
      title: 'High-Retention Explainer Reel', 
      type: 'Editing & Effects',
      thumb: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=300&auto=format&fit=crop&q=80'
    },
    { 
      id: 'port-3', 
      title: 'Brand Identity & Social Kit', 
      type: 'Design & Assets',
      thumb: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80'
    }
  ];

  const handleTogglePortfolio = (id: string) => {
    setSelectedPortfolioIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newItems = files.map(file => ({
        id: Math.random().toString(36).substring(7),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: 'file' as const
      }));
      setCustomAttachments(prev => [...prev, ...newItems]);
    }
  };

  const handleConfirmSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      onApply(opportunity, {
        fitReason,
        proposedPrice,
        priceType,
        estimatedDays,
        selectedPortfolioIds,
        additionalMessage,
        customAttachments
      });
      setSubmitting(false);
      setModalMode('apply_submitted');
    }, 600);
  };

  // Prevent applying to own task
  const isOwner = user?.id && opportunity.clientUserId === user.id;

  return (
    <div 
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '20px'
      }}
    >
      <div 
        className="modal-content"
        style={{
          maxWidth: modalMode === 'view' ? '920px' : '780px',
          width: '100%',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--bg-card)',
          border: '1.5px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
          maxHeight: '92vh',
          overflow: 'hidden',
          transition: 'max-width 0.25s ease'
        }}
      >
        
        {/* TOP BAR / BREADCRUMB HEADER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          {/* Breadcrumbs Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <button 
              onClick={() => {
                if (modalMode === 'apply_form') setModalMode('view');
                else if (modalMode === 'apply_review') setModalMode('apply_form');
                else onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 600,
                padding: '2px 4px',
                borderRadius: '4px'
              }}
            >
              <ArrowLeft size={14} /> Back
            </button>
            <span>•</span>
            <span style={{ cursor: 'pointer' }} onClick={onClose}>Opportunities</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {opportunity.title}
            </span>
            {modalMode !== 'view' && (
              <>
                <ChevronRight size={12} />
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>
                  {modalMode === 'apply_form' ? 'Apply' : modalMode === 'apply_review' ? 'Review' : 'Submitted'}
                </span>
              </>
            )}
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: 'var(--radius-sm)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* SCROLLABLE BODY */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* ------------------------------------------------------------- */}
          {/* 1. SCREEN 3: OPPORTUNITY DETAIL VIEW                          */}
          {/* ------------------------------------------------------------- */}
          {modalMode === 'view' && (
            <div className="responsive-modal-grid">
              
              {/* Left Column: Opportunity Details */}
              <div>
                {/* Title & Type Badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    {opportunity.title}
                  </h1>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                    {oppType}
                  </span>
                </div>

                {/* Subtitle / Meta */}
                <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  {categoryName} • {roleName} • {startedDate}
                </div>

                {/* Key Highlight Bar */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '16px 20px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  marginBottom: '20px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                      Budget / Salary
                    </span>
                    <strong style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {budgetDisplay}
                    </strong>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '20px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                      Vacancies
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {vacancies} {vacancies > 1 ? 'Vacancies' : 'Vacancy'}
                    </span>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '20px' }}>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', fontWeight: 600 }}>
                      Location
                    </span>
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {locationText}
                    </span>
                  </div>
                </div>

                {/* Required Skills Tag List */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '22px' }}>
                  {(opportunity.requiredSkills || ['Premiere Pro', 'CapCut', 'Editing', 'Sound Design']).map((skill: string, idx: number) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Action Buttons Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <button 
                    onClick={() => {
                      if (!isOwner) setModalMode('apply_form');
                    }}
                    disabled={Boolean(isOwner)}
                    className="btn btn-primary"
                    style={{ fontWeight: 700, padding: '0 28px', height: '42px', fontSize: '0.92rem' }}
                  >
                    {isOwner ? 'Your Posted Task' : isApplied ? 'Application Submitted' : 'Apply Now'}
                  </button>

                  <button 
                    onClick={() => {
                      if (onStartChat) onStartChat(posterName, opportunity.title);
                      else if (onNavigateToPoster) onNavigateToPoster(posterName);
                    }}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '42px', fontWeight: 600 }}
                  >
                    <MessageSquare size={15} /> Chat
                  </button>

                  <button 
                    onClick={() => setIsSaved(!isSaved)}
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '42px', fontWeight: 600 }}
                  >
                    <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>

                {/* About the Task */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                    About the Task
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                    {opportunity.description || 'We are looking for a creative video editor to work on short-form content for our brand. The content will include product showcases, trends, and promotional reels.'}
                  </p>
                </div>

                {/* Responsibilities */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                    Responsibilities
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      'Edit short-form videos for Instagram Reels and TikTok',
                      'Add transitions, effects, and captions',
                      'Work with provided raw footage and brand guidelines',
                      'Deliver high-quality, engaging content with fast turnaround'
                    ].map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Skills & Tools */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                    Required Skills
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {(opportunity.requiredSkills || ['Premiere Pro', 'CapCut', 'After Effects', 'Editing']).map((skill: string, idx: number) => (
                      <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    Experience Level
                  </h3>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {opportunity.experienceLevel || 'Intermediate (1–3 years)'}
                  </span>
                </div>

                {/* Deliverables */}
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
                    Deliverables
                  </h3>
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    {opportunity.deliverables?.[0] || '10 reels per month'}
                  </span>
                </div>

                {/* Timeline */}
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                    Timeline
                  </h3>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>• Start Date: Immediately (Oct 1, 2026)</div>
                    <div>• Deadline: Ongoing (Monthly)</div>
                  </div>
                </div>

              </div>

              {/* Right Column: Posted By Client Card */}
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  Posted by
                </span>

                <div 
                  onClick={() => {
                    onClose();
                    if (onNavigateToClientProfile) onNavigateToClientProfile(opportunity.clientProfileId || opportunity.clientId || opportunity.clientCompany || posterName);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--accent-subtle)',
                    color: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.1rem'
                  }}>
                    {posterName.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {posterName}
                    </h4>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Business
                    </span>
                  </div>
                </div>

                {/* Client Stats & Rating */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={13} fill="#F59E0B" color="#F59E0B" />
                    <strong style={{ color: 'var(--text-primary)' }}>4.7</strong>
                    <span style={{ color: 'var(--text-muted)' }}>(28 reviews)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <MapPin size={13} />
                    <span>Hyderabad, Telangana</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
                    <Calendar size={13} />
                    <span>Joined Sep 2024</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onClose();
                    if (onNavigateToClientProfile) onNavigateToClientProfile(opportunity.clientProfileId || opportunity.clientId || opportunity.clientCompany || posterName);
                  }}
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', fontWeight: 600, justifyContent: 'center' }}
                >
                  View Profile
                </button>

                {/* About the Client */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <h5 style={{ margin: '0 0 6px', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    About the Client
                  </h5>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    A creative studio working with brands, creators, and businesses to produce high-quality video content.
                  </p>
                </div>

                {/* Client Industry Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['Video', 'Design', 'Marketing'].map((t, idx) => (
                    <span key={idx} className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 2. SCREEN 4 (STEP 1): APPLICATION FORM                         */}
          {/* ------------------------------------------------------------- */}
          {modalMode === 'apply_form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Progress Steps Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                    1
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Application</span>
                </div>
                <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--border-subtle)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, border: '1px solid var(--border-subtle)' }}>
                    2
                  </div>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 500 }}>Review</span>
                </div>
                <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--border-subtle)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, border: '1px solid var(--border-subtle)' }}>
                    3
                  </div>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 500 }}>Submitted</span>
                </div>
              </div>

              {/* Form Title */}
              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Apply for {opportunity.title}
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Tell the client why you're a great fit for this opportunity.
                </p>
              </div>

              {/* Field 1: Why are you a good fit? */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Why are you a good fit? *
                  </label>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {fitReason.length}/1000
                  </span>
                </div>
                <textarea 
                  className="textarea-field"
                  rows={4}
                  maxLength={1000}
                  placeholder="Write a short message about your experience and why you're interested in this task..."
                  value={fitReason}
                  onChange={(e) => setFitReason(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              {/* Field 2: Relevant Portfolio */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Relevant Portfolio *
                  </label>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Select portfolio items from your profile
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  {userPortfolio.map((p) => {
                    const isSelected = selectedPortfolioIds.includes(p.id);
                    return (
                      <div 
                        key={p.id}
                        onClick={() => handleTogglePortfolio(p.id)}
                        style={{
                          position: 'relative',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          backgroundColor: 'var(--bg-secondary)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ height: '90px', position: 'relative' }}>
                          <img src={p.thumb} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          {isSelected && (
                            <div style={{
                              position: 'absolute',
                              top: '6px',
                              right: '6px',
                              backgroundColor: 'var(--accent-primary)',
                              color: '#FFF',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <Check size={12} strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <div style={{ padding: '8px' }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.title}
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.type}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* Add More Button */}
                  <label style={{
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px dashed var(--border-medium)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    minHeight: '120px',
                    color: 'var(--text-muted)',
                    gap: '6px',
                    backgroundColor: 'var(--bg-secondary)',
                    transition: 'all 0.15s ease'
                  }}>
                    <Plus size={20} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-primary)' }}>Add More</span>
                    <input type="file" multiple onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>

              {/* Field 3: Proposed Price */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Proposed Price (Optional)
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontWeight: 600 }}>
                      ₹
                    </span>
                    <input 
                      type="number"
                      className="input-field"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(Number(e.target.value))}
                      style={{ paddingLeft: '28px', fontSize: '0.9rem' }}
                    />
                  </div>
                  <select 
                    className="select-field"
                    value={priceType}
                    onChange={(e: any) => setPriceType(e.target.value)}
                    style={{ width: '160px', fontSize: '0.85rem' }}
                  >
                    <option value="Per Project">Per Project</option>
                    <option value="Per Task">Per Task</option>
                    <option value="Per Hour">Per Hour</option>
                  </select>
                </div>
              </div>

              {/* Field 4: Estimated Delivery Time */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Estimated Delivery Time *
                </label>
                <input 
                  type="text"
                  className="input-field"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="e.g. 5 days"
                  style={{ fontSize: '0.9rem' }}
                />
              </div>

              {/* Field 5: Additional Message */}
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Additional Message (Optional)
                </label>
                <input 
                  type="text"
                  className="input-field"
                  placeholder="Any other details you want to share with the client..."
                  value={additionalMessage}
                  onChange={(e) => setAdditionalMessage(e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  type="button" 
                  onClick={() => setModalMode('view')} 
                  className="btn btn-secondary"
                  style={{ fontWeight: 600 }}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={() => setModalMode('apply_review')} 
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '0 24px' }}
                >
                  Review Application <ArrowRight size={14} />
                </button>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 3. SCREEN 4 (STEP 2): REVIEW APPLICATION                      */}
          {/* ------------------------------------------------------------- */}
          {modalMode === 'apply_review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              
              {/* Progress Steps Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '32px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--status-success)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                    ✓
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Application</span>
                </div>
                <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--accent-primary)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700 }}>
                    2
                  </div>
                  <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-primary)' }}>Review</span>
                </div>
                <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--border-subtle)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem', fontWeight: 700, border: '1px solid var(--border-subtle)' }}>
                    3
                  </div>
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 500 }}>Submitted</span>
                </div>
              </div>

              <div>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  Review Your Application
                </h2>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Review your proposal before submitting it to {posterName}.
                </p>
              </div>

              {/* Review Card */}
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Fit & Statement
                  </span>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                    {fitReason || 'Experienced creative professional ready to deliver top tier assets for this requirement.'}
                  </p>
                </div>

                <div className="responsive-2col" style={{ gap: '14px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Proposed Rate
                    </span>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                      ₹{proposedPrice.toLocaleString()} ({priceType})
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Estimated Delivery
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {estimatedDays}
                    </span>
                  </div>
                </div>

                {selectedPortfolioIds.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      Attached Work Samples ({selectedPortfolioIds.length})
                    </span>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {userPortfolio.filter(p => selectedPortfolioIds.includes(p.id)).map(p => (
                        <span key={p.id} className="badge badge-primary" style={{ fontSize: '0.76rem' }}>
                          {p.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {additionalMessage && (
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Additional Notes
                    </span>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {additionalMessage}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <button 
                  type="button" 
                  onClick={() => setModalMode('apply_form')} 
                  className="btn btn-secondary"
                  style={{ fontWeight: 600 }}
                >
                  <ArrowLeft size={14} /> Back & Edit
                </button>
                <button 
                  type="button" 
                  onClick={handleConfirmSubmit} 
                  disabled={submitting}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '0 28px' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* 4. SCREEN 4 (STEP 3): APPLICATION SUBMITTED                   */}
          {/* ------------------------------------------------------------- */}
          {modalMode === 'apply_submitted' && (
            <div style={{ textAlign: 'center', padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '18px'
              }}>
                <CheckCircle2 size={36} strokeWidth={2.5} />
              </div>

              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px', color: 'var(--text-primary)' }}>
                Application Submitted Successfully!
              </h2>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.6, margin: '0 0 28px' }}>
                Your proposal has been submitted to <strong>{posterName}</strong>. You'll receive real-time notifications and chat updates when the client reviews your application.
              </p>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button 
                  onClick={() => {
                    onClose();
                    if (onNavigateToApplications) onNavigateToApplications();
                  }}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, padding: '0 22px' }}
                >
                  View My Applications
                </button>

                <button 
                  onClick={() => {
                    onClose();
                    if (onNavigateToOpportunities) onNavigateToOpportunities();
                  }}
                  className="btn btn-secondary"
                  style={{ fontWeight: 600 }}
                >
                  Browse More Opportunities
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
