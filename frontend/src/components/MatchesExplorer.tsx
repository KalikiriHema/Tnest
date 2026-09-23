import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { MatchScoreResult, Requirement, Proposal } from '../types';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Star, CheckCircle, Clock, Send, MessageSquare, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

interface MatchesExplorerProps {
  requirementId: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const MatchesExplorer: React.FC<MatchesExplorerProps> = ({ requirementId, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [requirement, setRequirement] = useState<Requirement | null>(null);
  const [matches, setMatches] = useState<MatchScoreResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Inquire Modal State
  const [inquirePro, setInquirePro] = useState<MatchScoreResult | null>(null);
  const [inquireMessage, setInquireMessage] = useState('');
  const [inquireSending, setInquireSending] = useState(false);

  // Tab: Matches vs Received Proposals
  const [activeTab, setActiveTab] = useState<'matches' | 'proposals'>('matches');

  useEffect(() => {
    loadData();
  }, [requirementId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqData, matchData] = await Promise.all([
        api.getRequirementById(requirementId),
        api.getRequirementMatches(requirementId)
      ]);
      setRequirement(reqData);
      setMatches(matchData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInquiry = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!inquirePro || !requirement) return;
    setInquireSending(true);
    try {
      const clientProfileId = user?.clientProfileId || '00000000-0000-0000-0000-000000000000';
      const result = await api.createInquiry({
        clientProfileId,
        professionalProfileId: inquirePro.professionalProfileId,
        requirementId: requirement.id,
        initialMessage: inquireMessage || `Hi ${inquirePro.displayName}, I'd like to discuss our brief "${requirement.title}".`
      });
      setInquirePro(null);
      setInquireMessage('');
      onNavigate('messages', { conversationId: result.conversationId });
    } catch (err: any) {
      alert(err.message || 'Error sending inquiry');
    } finally {
      setInquireSending(false);
    }
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      const result = await api.acceptProposal(proposalId);
      alert('🎉 Proposal accepted! Project Agreement created.');
      onNavigate('project-tracker', { projectId: result.project.id });
    } catch (err: any) {
      alert(err.message || 'Error accepting proposal');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Calculating transparent rule matches...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1100px' }}>
      
      {/* Header Context Brief */}
      {requirement && (
        <div className="glass-panel" style={{ padding: '24px 32px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-indigo">{requirement.categoryName}</span>
                <span className="badge badge-emerald">Listing Status: {requirement.status}</span>
                {requirement.requiresOnCamera && <span className="badge badge-rose">On-Camera Required</span>}
                {requirement.requiresProductShipment && <span className="badge badge-amber">Product Shipment</span>}
              </div>
              <h1 style={{ fontSize: '1.65rem', marginBottom: '6px' }}>{requirement.title}</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '780px' }}>{requirement.description}</p>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
                ₹{requirement.budgetMin.toLocaleString()} - ₹{requirement.budgetMax.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                SLA: {requirement.expectedDeliveryDays} Days • {requirement.requiredLanguages.join(', ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Matched Recommendations vs Proposals */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setActiveTab('matches')}
            className={`btn ${activeTab === 'matches' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <Sparkles size={16} /> Matched Talent ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('proposals')}
            className={`btn ${activeTab === 'proposals' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            <MessageSquare size={16} /> Creator Pitches / Proposals ({requirement?.proposals?.length || 0})
          </button>
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck size={16} color="var(--accent-emerald)" />
          Zero-AI Deterministic Scoring Engine
        </div>
      </div>

      {/* MATCHED TALENT LIST */}
      {activeTab === 'matches' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {matches.map((pro) => (
            <div 
              key={pro.professionalProfileId}
              className="glass-panel glass-panel-interactive"
              style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}
            >
              {/* Creator Avatar & Score Ring */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '240px' }}>
                <img
                  src={pro.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={pro.displayName}
                  style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h3 
                      onClick={() => onNavigate('profile', { slug: pro.slug })}
                      style={{ fontSize: '1.15rem', cursor: 'pointer' }}
                    >
                      {pro.displayName}
                    </h3>
                    <CheckCircle size={16} color="var(--accent-cyan)" />
                  </div>
                  <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: '2px 0' }}>
                    {pro.headline}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#fbbf24' }}>
                    <Star size={14} fill="#fbbf24" />
                    <strong>{pro.averageRating.toFixed(1)}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>({pro.completedProjectsCount} completed)</span>
                  </div>
                </div>
              </div>

              {/* Match Breakdown & Pills */}
              <div style={{ flex: 1, minWidth: '280px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: pro.totalScore >= 80 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                    border: `1px solid ${pro.totalScore >= 80 ? 'var(--accent-emerald)' : 'var(--accent-primary)'}`,
                    color: pro.totalScore >= 80 ? '#6ee7b7' : '#a5b4fc',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}>
                    {pro.totalScore}% Match Score
                  </div>
                  {pro.isRecommended && (
                    <span className="badge badge-emerald">
                      ★ Highly Recommended
                    </span>
                  )}
                </div>

                {/* Score Breakdown Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {pro.breakdownPills.map((pill, i) => (
                    <span key={i} className="badge badge-indigo" style={{ fontSize: '0.725rem' }}>
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Pricing & CTA */}
              <div style={{ textAlign: 'right', minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                  ₹{pro.hourlyRate.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ project unit</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Turnaround SLA: {pro.turnaroundDays} Days
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '4px' }}>
                  <button 
                    onClick={() => onNavigate('profile', { slug: pro.slug })}
                    className="btn btn-secondary btn-sm"
                  >
                    View Portfolio
                  </button>
                  <button
                    onClick={() => {
                      setInquirePro(pro);
                      setInquireMessage(`Hi ${pro.displayName}, I saw your profile on our brief "${requirement?.title}". We'd love to work with you.`);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Send size={14} /> Send Inquiry
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* RECEIVED PROPOSALS / PITCHES */}
      {activeTab === 'proposals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(!requirement?.proposals || requirement.proposals.length === 0) ? (
            <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No proposals submitted yet on this public brief.</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Creative professionals can browse this in the Opportunity Feed and submit custom pitches.
              </p>
            </div>
          ) : (
            requirement.proposals.map((prop) => (
              <div key={prop.id} className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem' }}>Pitch from {prop.professionalName}</h3>
                    <span className="badge badge-indigo" style={{ marginTop: '4px' }}>Status: {prop.status}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>₹{prop.proposedPrice.toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Delivery in {prop.estimatedDays} days</div>
                  </div>
                </div>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.25)', padding: '16px', borderRadius: '8px', lineHeight: 1.5, marginBottom: '16px' }}>
                  "{prop.coverLetter}"
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  {prop.status === 'Submitted' && (
                    <button 
                      onClick={() => handleAcceptProposal(prop.id)}
                      className="btn btn-emerald btn-sm"
                    >
                      Accept Proposal & Activate Project <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SEND INQUIRY MODAL */}
      {inquirePro && (
        <div className="modal-overlay" onClick={() => setInquirePro(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>Send Direct Inquiry to {inquirePro.displayName}</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Start a 1-on-1 negotiation thread directly connected to your brief.
            </p>

            <textarea
              rows={4}
              value={inquireMessage}
              onChange={(e) => setInquireMessage(e.target.value)}
              className="textarea-field"
              placeholder="Write your custom outreach message..."
              style={{ marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setInquirePro(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSendInquiry} disabled={inquireSending} className="btn btn-primary">
                {inquireSending ? 'Sending...' : 'Send Inquiry & Open Chat'} <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
