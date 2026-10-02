import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { MOCK_APPLICATIONS, MOCK_MY_WORK, MOCK_OPPORTUNITIES } from '../data/mockData';
import { Requirement, RequirementApplicant, Proposal, MyWorkItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Send, 
  FolderKanban, 
  Clock, 
  Building2, 
  ArrowRight, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  Eye,
  Plus,
  Users,
  Star,
  Check,
  X,
  ArrowLeft,
  Truck,
  ShieldCheck,
  ExternalLink,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';

interface MyActivityProps {
  initialTab?: 'posted' | 'applications' | 'work' | 'saved';
  onNavigate: (view: string, params?: any) => void;
}

export const MyActivity: React.FC<MyActivityProps> = ({ initialTab, onNavigate }) => {
  const { user } = useAuth();
  
  // Strict, unambiguous role determination
  const roleLower = (user?.role || '').toLowerCase();
  const isDoerRole = roleLower === 'professional' || (roleLower !== 'client' && Boolean(user?.professionalProfileId && !user?.clientProfileId));
  const isClientRole = !isDoerRole;

  // Doer subtab state
  const [doerTab, setDoerTab] = useState<'applications' | 'work'>(initialTab === 'work' ? 'work' : 'applications');
  const activeTab: 'posted' | 'applications' | 'work' = isClientRole ? 'posted' : doerTab;

  const isDemoClient = Boolean(
    user?.email === 'client@tnest.com' ||
    user?.id === 'demo_client' ||
    user?.clientProfileId === '22222222-2222-2222-2222-222222222222'
  );

  const isDemoCreator = Boolean(
    user?.email === 'priya.reddy@example.com' ||
    user?.id === 'demo_creator' ||
    user?.slug === 'priya-reddy' ||
    user?.professionalProfileId === '11111111-1111-1111-1111-111111111111'
  );

  const [postedTasks, setPostedTasks] = useState<Requirement[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Requirement | null>(null);
  const [applicants, setApplicants] = useState<RequirementApplicant[]>([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [applicantFilter, setApplicantFilter] = useState<'all' | 'Submitted' | 'Shortlisted' | 'Accepted' | 'Declined'>('all');
  const [doerAppFilter, setDoerAppFilter] = useState<'All' | 'Pending' | 'Shortlisted' | 'Selected' | 'Rejected' | 'Withdrawn'>('All');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Applications Data for Doers
  const [applicationsList, setApplicationsList] = useState<any[]>(isDemoCreator ? MOCK_APPLICATIONS : []);
  const [workList, setWorkList] = useState<MyWorkItem[]>(isDemoCreator ? MOCK_MY_WORK : []);

  useEffect(() => {
    if (initialTab === 'work' || initialTab === 'applications') {
      setDoerTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (isClientRole) {
      const clientProfileId = user?.clientProfileId;
      if (clientProfileId) {
        setLoadingTasks(true);
        api.getClientRequirements(clientProfileId)
          .then(reqs => {
            if (reqs && reqs.length > 0) {
              setPostedTasks(reqs);
            } else if (isDemoClient) {
              setPostedTasks(MOCK_OPPORTUNITIES.slice(0, 3));
            } else {
              setPostedTasks([]);
            }
          })
          .catch(() => {
            if (isDemoClient) setPostedTasks(MOCK_OPPORTUNITIES.slice(0, 3));
            else setPostedTasks([]);
          })
          .finally(() => setLoadingTasks(false));
      } else if (isDemoClient) {
        setPostedTasks(MOCK_OPPORTUNITIES.slice(0, 3));
      } else {
        setPostedTasks([]);
      }
    }

    // Fetch pro proposals if available for Doers
    if (isDoerRole && user?.professionalProfileId) {
      api.getProProposals(user.professionalProfileId)
        .then(props => {
          if (props && props.length > 0) {
            const mapped = props.map((p: any) => ({
              id: p.id,
              requirementId: p.requirementId,
              requirementTitle: p.requirementTitle,
              categoryName: p.categoryName || 'Creative Task',
              clientName: p.clientCompany || 'Verified Client',
              proposedPrice: p.proposedPrice,
              estimatedDays: p.estimatedDays,
              status: p.status,
              createdAtUtc: p.createdAtUtc
            }));
            setApplicationsList(mapped);
          }
        })
        .catch(() => {});
    }
  }, [user, isDemoClient, isClientRole, isDoerRole]);

  const handleOpenApplicants = async (task: Requirement) => {
    setSelectedTask(task);
    setLoadingApplicants(true);
    setActionFeedback(null);
    try {
      const res = await api.getRequirementProposals(task.id);
      if (res && res.length > 0) {
        setApplicants(res);
      } else if (isDemoClient && String(task.id).startsWith('demo-req')) {
        // Only show mock proposals for pre-seeded test fixtures
        setApplicants([
          {
            id: 'prop-demo-1',
            requirementId: task.id,
            professionalProfileId: '11111111-1111-1111-1111-111111111111',
            proDisplayName: 'Priya Reddy',
            proHeadline: 'Top UGC Creator & On-Camera Specialist',
            proAvatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            proSlug: 'priya-reddy',
            proRating: 5.0,
            proExperienceLevel: 'Senior',
            proHourlyRate: 2000,
            proSkills: ['Telugu & English', 'Video Scripting', 'UGC Aesthetics'],
            proRoles: ['UGC Creator'],
            coverLetter: 'Hi! I have delivered 120+ high-retention video assets for top brands. I can deliver 3 authentic hook variations within 4 business days.',
            proposedPrice: task.budgetMin ? Math.round((task.budgetMin + task.budgetMax) / 2) : 15000,
            estimatedDays: task.expectedDeliveryDays || 4,
            status: 'Submitted',
            createdAtUtc: new Date().toISOString()
          },
          {
            id: 'prop-demo-2',
            requirementId: task.id,
            professionalProfileId: '22222222-2222-2222-2222-222222222222',
            proDisplayName: 'Arjun Mehta',
            proHeadline: 'Retention Video Editor (Premiere & DaVinci)',
            proAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
            proSlug: 'arjun-edits',
            proRating: 4.9,
            proExperienceLevel: 'Senior',
            proHourlyRate: 1800,
            proSkills: ['Premiere Pro', 'DaVinci Resolve', 'Sound Design'],
            proRoles: ['Video Editor'],
            coverLetter: 'Hello! I specialize in clean retention pacing, typography, and audio mastering. Ready to start immediately.',
            proposedPrice: task.budgetMin || 12000,
            estimatedDays: 3,
            status: 'Shortlisted',
            createdAtUtc: new Date(Date.now() - 86400000).toISOString()
          }
        ]);
      } else {
        // Real or newly posted tasks start with zero proposals
        setApplicants([]);
      }
    } catch {
      setApplicants([]);
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleShortlist = async (applicantId: string) => {
    try { await api.shortlistProposal(applicantId); } catch {}
    setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: 'Shortlisted' } : a));
    setActionFeedback('Applicant shortlisted.');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleReject = async (applicantId: string) => {
    try { await api.rejectProposal(applicantId); } catch {}
    setApplicants(prev => prev.map(a => a.id === applicantId ? { ...a, status: 'Declined' } : a));
    setActionFeedback('Applicant declined.');
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleAccept = async (applicant: RequirementApplicant) => {
    try { await api.acceptProposal(applicant.id); } catch {}
    setApplicants(prev => prev.map(a => a.id === applicant.id ? { ...a, status: 'Accepted' } : a));
    setActionFeedback(`Proposal accepted for ₹${applicant.proposedPrice.toLocaleString()}. Protected payment agreement activated.`);
    setTimeout(() => onNavigate('messages'), 1200);
  };

  const filteredApplicants = useMemo(() => {
    if (applicantFilter === 'all') return applicants;
    return applicants.filter(a => a.status.toLowerCase() === applicantFilter.toLowerCase());
  }, [applicants, applicantFilter]);

  const filteredDoerApplications = useMemo(() => {
    if (doerAppFilter === 'All') return applicationsList;
    return applicationsList.filter(a => a.status.toLowerCase() === doerAppFilter.toLowerCase());
  }, [applicationsList, doerAppFilter]);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'selected':
      case 'accepted':
      case 'completed':
        return <span className="badge badge-emerald">{status}</span>;
      case 'shortlisted':
      case 'inprogress':
      case 'in progress':
        return <span className="badge badge-primary">{status}</span>;
      case 'submitted':
      case 'pending':
      case 'assigned':
        return <span className="badge badge-amber">{status}</span>;
      case 'revision':
      case 'revisionrequested':
        return <span className="badge badge-amber">Revision Requested</span>;
      case 'rejected':
      case 'declined':
      case 'cancelled':
        return <span className="badge badge-danger">{status}</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px 80px', maxWidth: '1120px' }}>
      
      {/* Top Breadcrumb Nav */}
      <BreadcrumbNav
        items={[
          { label: isClientRole ? 'Client Workspace' : 'Doer Workspace', view: isClientRole ? 'client-dashboard' : 'pro-dashboard' },
          { label: isClientRole ? 'Posted Tasks & Activity' : 'Activity & Management', active: true }
        ]}
        backLabel="Dashboard"
        backView={isClientRole ? 'client-dashboard' : 'pro-dashboard'}
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {isClientRole ? 'My Posted Tasks & Proposals' : 'My Applications & Active Work'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', margin: 0 }}>
          {isClientRole
            ? 'Review incoming proposals from verified specialists, hire doers, and track task status.'
            : 'Track your submitted bids, review application statuses, and manage deliverable milestones.'}
        </p>
      </div>

      {actionFeedback && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--status-success-bg)',
          border: '1px solid var(--status-success-border)',
          color: 'var(--status-success)',
          marginBottom: '20px',
          fontSize: '0.88rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <CheckCircle2 size={16} />
          {actionFeedback}
        </div>
      )}

      {/* Tabs Header */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px', 
        borderBottom: '1px solid var(--border-subtle)', 
        paddingBottom: '8px', 
        overflowX: 'auto' 
      }}>
        {/* Doer Tabs */}
        {isDoerRole ? (
          <>
            <button
              onClick={() => { setDoerTab('applications'); setSelectedTask(null); }}
              className={`btn btn-sm ${doerTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontWeight: 600 }}
            >
              <Send size={14} /> My Applications ({applicationsList.length})
            </button>

            <button
              onClick={() => { setDoerTab('work'); setSelectedTask(null); }}
              className={`btn btn-sm ${doerTab === 'work' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontWeight: 600 }}
            >
              <FolderKanban size={14} /> My Work & Deliverables ({workList.length})
            </button>
          </>
        ) : (
          /* Client Tabs */
          <button
            onClick={() => { setSelectedTask(null); }}
            className="btn btn-sm btn-primary"
            style={{ fontWeight: 600 }}
          >
            <FileText size={14} /> Posted Tasks ({postedTasks.length})
          </button>
        )}
      </div>

      {/* =========================================
          TAB 1: MY APPLICATIONS (DOER VIEW)
      ========================================= */}
      {activeTab === 'applications' && (
        <div>
          {/* Sub-Filters for Applications */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['All', 'Pending', 'Shortlisted', 'Selected', 'Rejected', 'Withdrawn'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setDoerAppFilter(status)}
                  className={`btn btn-sm ${doerAppFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  {status}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Showing {filteredDoerApplications.length} applications
            </span>
          </div>

          {filteredDoerApplications.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <Send size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>No Applications Found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                {doerAppFilter !== 'All' ? `No applications with status "${doerAppFilter}".` : 'Browse open briefs and submit proposals to get hired.'}
              </p>
              <button onClick={() => onNavigate('opportunities')} className="btn btn-primary">
                Browse Opportunities
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredDoerApplications.map((app) => (
                <div 
                  key={app.id} 
                  className="card card-hover" 
                  style={{ 
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-medium)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        {app.categoryName && <span className="badge badge-primary">{app.categoryName}</span>}
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          Client: <strong style={{ color: 'var(--text-primary)' }}>{app.clientName}</strong>
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.12rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        {app.requirementTitle}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusBadge(app.status)}
                    </div>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingTop: '12px', 
                    borderTop: '1px solid var(--border-subtle)', 
                    fontSize: '0.84rem',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
                      <span>Proposed: <strong style={{ color: 'var(--text-primary)' }}>₹{app.proposedPrice?.toLocaleString()}</strong></span>
                      <span>•</span>
                      <span>Delivery SLA: <strong>{app.estimatedDays} Days</strong></span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => onNavigate('messages')} 
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MessageSquare size={13} /> Chat with Client
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================
          TAB 2: MY WORK & CONTRACTS (DOER VIEW)
      ========================================= */}
      {activeTab === 'work' && (
        <div>
          {/* Work Lifecycle Progression Guide */}
          <div style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            marginBottom: '20px',
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <ShieldCheck size={16} color="var(--status-success)" />
              Work Milestone Lifecycle:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
              <span className="badge badge-neutral">Assigned</span> →
              <span className="badge badge-primary">In Progress</span> →
              <span className="badge badge-neutral">Submitted</span> →
              <span className="badge badge-amber">Revision</span> →
              <span className="badge badge-emerald">Completed</span>
            </div>
          </div>

          {workList.length === 0 ? (
            <div className="card" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
              <FolderKanban size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>No Active Contracts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                When a client accepts your proposal, your active agreements and milestone submissions will appear here.
              </p>
              <button onClick={() => onNavigate('opportunities')} className="btn btn-primary">
                Browse Opportunities
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {workList.map((work) => (
                <div 
                  key={work.id} 
                  className="card" 
                  style={{ 
                    padding: '22px',
                    borderRadius: 'var(--radius-md)',
                    border: '1.5px solid var(--border-medium)',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={11} /> Project Active
                        </span>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Client: <strong style={{ color: 'var(--text-primary)' }}>{work.clientName}</strong>
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 4px' }}>
                        {work.title}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getStatusBadge(work.status)}
                    </div>
                  </div>

                  {/* Shipment Tracking if physical goods */}
                  {work.requiresShipment && (
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '14px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={14} color="var(--accent-primary)" />
                        <span>Product Sample Shipment: <strong>{work.courierName || 'BlueDart'}</strong> ({work.trackingNumber || 'TNST-849204'})</span>
                      </div>
                      <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Delivered for Demo</span>
                    </div>
                  )}

                  {/* Compensation & Actions */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    paddingTop: '14px', 
                    borderTop: '1px solid var(--border-subtle)', 
                    fontSize: '0.85rem',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block' }}>Contract Value</span>
                      <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>₹{work.agreedPrice?.toLocaleString()}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => onNavigate('messages')} 
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <MessageSquare size={13} /> Project Chat
                      </button>
                      <button 
                        onClick={() => onNavigate('project-tracker', { projectId: work.id })} 
                        className="btn btn-primary btn-sm"
                        style={{ fontWeight: 600 }}
                      >
                        Submit Deliverable / Milestone
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================
          TAB 3: POSTED TASKS (CLIENT VIEW)
      ========================================= */}
      {activeTab === 'posted' && (
        <div>
          {selectedTask ? (
            <div>
              {/* Task Header in Review Mode */}
              <div className="card" style={{ padding: '24px', marginBottom: '24px', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <span className="badge badge-primary" style={{ marginBottom: '6px' }}>{selectedTask.categoryName}</span>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{selectedTask.title}</h2>
                  </div>
                  <button onClick={() => setSelectedTask(null)} className="btn btn-secondary btn-sm">
                    <ArrowLeft size={13} /> Back to All Tasks
                  </button>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Budget: ₹{selectedTask.budgetMin?.toLocaleString()} - ₹{selectedTask.budgetMax?.toLocaleString()} • Target: {selectedTask.expectedDeliveryDays} Days
                </div>
              </div>

              {/* Proposals Filter & List */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Received Proposals ({applicants.length})</h3>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['all', 'Submitted', 'Shortlisted', 'Accepted', 'Declined'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setApplicantFilter(status)}
                      className={`btn btn-sm ${applicantFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      {status === 'all' ? 'All' : status}
                    </button>
                  ))}
                </div>
              </div>

              {loadingApplicants ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading proposals...</p>
              ) : filteredApplicants.length === 0 ? (
                applicants.length === 0 ? (
                  <div className="card" style={{ padding: '48px 24px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                    <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4, color: 'var(--text-muted)' }} />
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>No Proposals Received Yet</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', maxWidth: '440px', margin: '0 auto 18px' }}>
                      Verified creators and specialists are reviewing your task brief. As soon as proposals are submitted, they will appear here for your review.
                    </p>
                    <button onClick={() => onNavigate('browse', { category: selectedTask.categorySlug })} className="btn btn-primary btn-sm">
                      <Users size={14} /> Find & Invite Doers Directly
                    </button>
                  </div>
                ) : (
                  <div className="card" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No proposals found matching status filter "{applicantFilter}".
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {filteredApplicants.map((app) => (
                    <div key={app.id} className="card" style={{ padding: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <img 
                            src={app.proAvatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                            alt={app.proDisplayName} 
                            style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{app.proDisplayName}</strong>
                              {getStatusBadge(app.status)}
                            </div>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.proHeadline}</span>
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>₹{app.proposedPrice.toLocaleString()}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Est. Delivery: {app.estimatedDays} Days</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                        {app.coverLetter}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button 
                          onClick={() => onNavigate('public-profile', { slug: app.proSlug })}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={13} /> View Profile
                        </button>
                        <button 
                          onClick={() => onNavigate('messages')}
                          className="btn btn-secondary btn-sm"
                        >
                          <MessageSquare size={13} /> Message
                        </button>
                        {app.status !== 'Shortlisted' && app.status !== 'Accepted' && (
                          <button 
                            onClick={() => handleShortlist(app.id)}
                            className="btn btn-secondary btn-sm"
                          >
                            Shortlist
                          </button>
                        )}
                        {app.status !== 'Accepted' && app.status !== 'Declined' && (
                          <button 
                            onClick={() => handleReject(app.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--status-danger)' }}
                          >
                            Decline
                          </button>
                        )}
                        {app.status !== 'Accepted' && (
                          <button 
                            onClick={() => handleAccept(app)}
                            className="btn btn-primary btn-sm"
                            style={{ fontWeight: 600 }}
                          >
                            Accept Application
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Posted Tasks List */
            <div>
              {loadingTasks ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading posted tasks...</p>
              ) : postedTasks.length === 0 ? (
                <div className="card" style={{ padding: '48px', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
                  <FileText size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>No Tasks Posted Yet</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '20px' }}>
                    Post a brief to get matched with verified specialist talent.
                  </p>
                  <button onClick={() => onNavigate('wizard')} className="btn btn-primary">
                    <Plus size={14} /> Post Task
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {postedTasks.map((task) => (
                    <div 
                      key={task.id} 
                      className="card card-hover" 
                      style={{ 
                        padding: '20px',
                        borderRadius: 'var(--radius-md)',
                        border: '1.5px solid var(--border-medium)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <span className="badge badge-primary" style={{ marginBottom: '4px' }}>{task.categoryName}</span>
                          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 4px' }}>{task.title}</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            Budget: ₹{task.budgetMin?.toLocaleString()} - ₹{task.budgetMax?.toLocaleString()} • {task.expectedDeliveryDays} Days
                          </span>
                        </div>
                        <span className="badge badge-emerald">Open & Active</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>
                          Click to inspect matching applicants
                        </span>
                        <button 
                          onClick={() => handleOpenApplicants(task)}
                          className="btn btn-primary btn-sm"
                          style={{ fontWeight: 600 }}
                        >
                          Review Proposals <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
