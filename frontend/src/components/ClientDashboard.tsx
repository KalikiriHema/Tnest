import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Requirement } from '../types';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Layers, ArrowRight, Clock, MessageSquare, Briefcase, Sparkles } from 'lucide-react';

interface ClientDashboardProps {
  onNavigate: (view: string, params?: any) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.clientProfileId) {
      api.getClientRequirements(user.clientProfileId).then(data => {
        setRequirements(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1100px' }}>
      
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>Client Dashboard</span>
          <h1 style={{ fontSize: '2rem' }}>Welcome, {user?.fullName}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage your dynamic briefs, matched talent recommendations, and active project agreements.
          </p>
        </div>

        <button onClick={() => onNavigate('wizard')} className="btn btn-primary">
          <PlusCircle size={16} /> Post New Requirement
        </button>
      </div>

      {/* Posted Requirements List */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '20px' }}>Your Posted Requirements</h2>

        {loading ? (
          <p style={{ color: 'var(--text-secondary)' }}>Loading requirements...</p>
        ) : requirements.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No requirements posted yet. Click "Post New Requirement" to create your first brief.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {requirements.map((req) => (
              <div 
                key={req.id}
                className="glass-panel"
                style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="badge badge-indigo">{req.categoryName}</span>
                    <span className="badge badge-emerald">Status: {req.status}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {req.proposalsCount || 0} Proposals received
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem' }}>{req.title}</h3>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Budget: ₹{req.budgetMin?.toLocaleString()} - ₹{req.budgetMax?.toLocaleString()} • Target: {req.expectedDeliveryDays} Days
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => onNavigate('matches', { requirementId: req.id })}
                    className="btn btn-primary btn-sm"
                  >
                    <Sparkles size={14} /> View Matches & Proposals <ArrowRight size={14} />
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
