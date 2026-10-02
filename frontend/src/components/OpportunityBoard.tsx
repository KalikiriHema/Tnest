import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Requirement, Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Clock, DollarSign, Globe, Send, Package, Video, Sparkles, Filter, CheckCircle2, Calendar } from 'lucide-react';
import { formatRelativeTime } from '../utils/timeAgo';

interface OpportunityBoardProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const OpportunityBoard: React.FC<OpportunityBoardProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState<Requirement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Pitch Modal State
  const [pitchingReq, setPitchingReq] = useState<Requirement | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState<number>(15000);
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);
  const [appliedReqIds, setAppliedReqIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('tnest_applied_opps');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getOpportunities()
    ]).then(([cats, opps]) => {
      setCategories(cats);
      setOpportunities(opps);
      setLoading(false);
    });
  }, []);

  const handleFilter = async (catSlug?: string, lang?: string) => {
    setLoading(true);
    try {
      const opps = await api.getOpportunities({
        categorySlug: catSlug || selectedCategory || undefined,
        language: lang || selectedLanguage || undefined
      });
      setOpportunities(opps);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPitch = (req: Requirement) => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    setPitchingReq(req);
    setProposedPrice(req.budgetMin || 15000);
    setEstimatedDays(req.expectedDeliveryDays || 3);
    setCoverLetter(`Hi ${req.clientCompany}, I have extensive experience in ${req.categoryName} and would love to deliver top-quality assets for this requirement.`);
  };

  const handleSubmitPitch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pitchingReq) return;
    setSubmitting(true);
    const reqId = pitchingReq.id;
    try {
      const proProfileId = user?.professionalProfileId || '00000000-0000-0000-0000-000000000000';
      await api.submitProposal({
        requirementId: reqId,
        professionalProfileId: proProfileId,
        coverLetter,
        proposedPrice,
        estimatedDays
      });
      setAppliedReqIds((prev) => {
        const next = new Set(prev);
        next.add(reqId);
        try {
          localStorage.setItem('tnest_applied_opps', JSON.stringify(Array.from(next)));
        } catch {}
        return next;
      });
      setPitchingReq(null);
      // Reload
      handleFilter();
    } catch (err: any) {
      alert(err.message || 'Error submitting proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1100px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-indigo">Creator Opportunity Board</span>
          <span className="badge badge-emerald">Live Verified Briefs</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '10px' }}>
          Open Client Requirements & Pitches
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Review structured client briefs with explicit dynamic requirements and submit your tailored proposals.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '28px' }}>
        <Filter size={18} color="var(--accent-primary)" />
        
        <select 
          className="select-field" 
          style={{ width: '220px' }}
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); handleFilter(e.target.value, selectedLanguage); }}
        >
          <option value="">All Creative Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>

        <select 
          className="select-field" 
          style={{ width: '180px' }}
          value={selectedLanguage}
          onChange={(e) => { setSelectedLanguage(e.target.value); handleFilter(selectedCategory, e.target.value); }}
        >
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Telugu">Telugu</option>
          <option value="Hindi">Hindi</option>
          <option value="Tamil">Tamil</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{opportunities.length}</strong> opportunities
        </div>
      </div>

      {/* OPPORTUNITIES LIST */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading briefs...</div>
      ) : opportunities.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <h3>No open opportunities found for this filter.</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Try switching category or language filters above.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {opportunities.map((opp) => {
            let dynamicAttrs: Record<string, any> = {};
            try {
              dynamicAttrs = JSON.parse(opp.dynamicAttributesJson || '{}');
            } catch {}

            return (
              <div 
                key={opp.id} 
                className="glass-panel glass-panel-interactive"
                style={{ padding: '28px' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      {appliedReqIds.has(opp.id) && (
                        <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.35)', fontWeight: 700 }}>
                          <CheckCircle2 size={11} /> Applied
                        </span>
                      )}
                      <span className="badge badge-indigo">{opp.categoryName}</span>
                      <span 
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate('client-profile', { clientId: opp.clientProfileId || opp.clientCompany });
                        }}
                        style={{ fontSize: '0.8rem', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Posted by {opp.clientCompany}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        • <Calendar size={12} /> {formatRelativeTime(opp.createdAtUtc)}
                      </span>
                      {opp.requiresOnCamera && <span className="badge badge-rose">On-Camera</span>}
                      {opp.requiresProductShipment && <span className="badge badge-amber">Shipment Required</span>}
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{opp.title}</h2>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{opp.budgetMin?.toLocaleString()} - ₹{opp.budgetMax?.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Target SLA: {opp.expectedDeliveryDays} Days
                    </div>
                  </div>
                </div>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, marginBottom: '20px' }}>
                  {opp.description}
                </p>

                {/* Structured Dynamic Specs Pills */}
                {Object.keys(dynamicAttrs).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: '10px', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
                    {Object.entries(dynamicAttrs).map(([key, val]) => (
                      <span key={key} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</strong> {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : String(val)}
                        <span style={{ marginLeft: '8px', color: 'var(--border-subtle)' }}>•</span>
                      </span>
                    ))}
                    {opp.requiredLanguages && opp.requiredLanguages.length > 0 && (
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Languages:</strong> {opp.requiredLanguages.join(', ')}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {opp.proposalsCount || 0} Proposals submitted so far
                  </div>
                  {appliedReqIds.has(opp.id) ? (
                    <button
                      disabled
                      className="btn btn-sm"
                      style={{
                        background: 'rgba(16,185,129,0.15)',
                        color: '#34d399',
                        border: '1px solid rgba(52,211,153,0.35)',
                        cursor: 'default',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        padding: '8px 18px'
                      }}
                    >
                      <CheckCircle2 size={14} /> Applied
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenPitch(opp)}
                      className="btn btn-primary btn-sm"
                      style={{ padding: '8px 18px' }}
                    >
                      <Send size={14} /> Apply Now
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* PITCH MODAL */}
      {pitchingReq && (
        <div className="modal-overlay" onClick={() => setPitchingReq(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '32px', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>Submit Pitch Proposal</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Brief: <strong>{pitchingReq.title}</strong> ({pitchingReq.clientCompany})
            </p>

            <form onSubmit={handleSubmitPitch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Cover Letter / Creative Pitch *
                </label>
                <textarea
                  rows={4}
                  required
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  className="textarea-field"
                  placeholder="Explain how you will approach this project, your tools, and creative angle..."
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Proposed Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Estimated Delivery (Days) *
                  </label>
                  <input
                    type="number"
                    required
                    value={estimatedDays}
                    onChange={(e) => setEstimatedDays(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setPitchingReq(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Submitting...' : 'Submit Pitch'} <Send size={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
