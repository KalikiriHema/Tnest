import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { MatchScoreResult, Requirement, Proposal } from '../types';
import { useAuth } from '../context/AuthContext';
import { Star, CheckCircle2, Clock, Send, MessageSquare, ArrowRight, ShieldCheck, X } from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';

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

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Finding matching Doers...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '32px 24px 80px', maxWidth: '1080px' }}>
      
      {/* Top Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: 'Client Workspace', view: 'client-dashboard' },
          { label: requirement?.title || 'Requirement Matches', active: true }
        ]}
        backLabel="Back"
        onNavigate={onNavigate}
      />

      {/* Requirement Header */}
      {requirement && (
        <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '6px' }}>{requirement.categoryName}</span>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 600 }}>{requirement.title}</h1>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Budget: ₹{requirement.budgetMin?.toLocaleString()} - ₹{requirement.budgetMax?.toLocaleString()} • Target: {requirement.expectedDeliveryDays} Days
              </div>
            </div>
            <button onClick={() => onNavigate('my-activity')} className="btn btn-secondary btn-sm">
              View Proposals
            </button>
          </div>
        </div>
      )}

      {/* Matched Doers List */}
      <div>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Matched Verified Doers ({matches.length})</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Ranked based on required role, verified skill match, and client rating.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No automatic matches found. Browse the talent directory to invite Doers directly.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {matches.map((m) => (
              <div key={m.professionalProfileId} className="card card-hover" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <img 
                      src={m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'} 
                      alt={m.displayName}
                      style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{m.displayName}</strong>
                        <span className="badge badge-primary">{m.totalScore}% Match</span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{m.headline}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>₹{m.hourlyRate?.toLocaleString()}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>/ hr</span>
                  </div>
                </div>

                {/* Score reasons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                  {m.breakdownPills && m.breakdownPills.map((pill, idx) => (
                    <span key={idx} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                      {pill}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button 
                    onClick={() => onNavigate('profile', { slug: m.slug || 'priya-reddy' })}
                    className="btn btn-secondary btn-sm"
                  >
                    View Profile
                  </button>
                  <button 
                    onClick={() => {
                      setInquirePro(m);
                      setInquireMessage(`Hi ${m.displayName}, I came across your profile on Tnest and would like to invite you to submit a proposal for our brief "${requirement?.title}".`);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <Send size={13} /> Invite / Inquire
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      {inquirePro && (
        <div className="modal-overlay" onClick={() => setInquirePro(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Invite {inquirePro.displayName}</h3>
              <button onClick={() => setInquirePro(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <textarea 
              className="textarea-field" 
              rows={4}
              value={inquireMessage}
              onChange={(e) => setInquireMessage(e.target.value)}
              style={{ marginBottom: '14px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setInquirePro(null)} className="btn btn-secondary btn-sm">Cancel</button>
              <button onClick={handleSendInquiry} disabled={inquireSending} className="btn btn-primary btn-sm">
                {inquireSending ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
