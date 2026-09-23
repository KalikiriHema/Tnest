import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Proposal } from '../types';
import { useAuth } from '../context/AuthContext';
import { Briefcase, MessageSquare, Star, ArrowRight, Sparkles, Send } from 'lucide-react';

interface ProDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ProDashboard: React.FC<ProDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.professionalProfileId) {
      api.getProProposals(user.professionalProfileId).then(data => {
        setProposals(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1100px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>Creator Dashboard</span>
          <h1 style={{ fontSize: '2rem' }}>Welcome, {user?.fullName}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track submitted pitches, active client agreements, and explore new job opportunities.
          </p>
        </div>

        <button onClick={() => onNavigate('opportunities')} className="btn btn-primary">
          <Briefcase size={16} /> Explore Opportunity Feed
        </button>
      </div>

      {/* Submitted Proposals */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Your Submitted Pitches & Proposals</h2>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading pitches...</p>
        ) : proposals.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            You haven't submitted any pitches yet. Check the Opportunity Feed to find briefs matching your skills!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {proposals.map((prop) => (
              <div 
                key={prop.id}
                className="glass-panel"
                style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-indigo">{prop.categoryName}</span>
                    <span className={`badge ${prop.status === 'Accepted' ? 'badge-emerald' : 'badge-amber'}`}>
                      Status: {prop.status}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Client: {prop.clientCompany}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem' }}>{prop.requirementTitle}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Pitched: ₹{prop.proposedPrice?.toLocaleString()} • Turnaround: {prop.estimatedDays} Days
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => onNavigate('messages')}
                    className="btn btn-secondary btn-sm"
                  >
                    <MessageSquare size={14} /> Open Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
