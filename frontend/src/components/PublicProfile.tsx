import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ProfessionalProfile, PortfolioItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Star, CheckCircle, Clock, Video, Package, Globe, Send, Play, X, MessageSquare, ShieldCheck, ArrowLeft } from 'lucide-react';

interface PublicProfileProps {
  slug: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const PublicProfile: React.FC<PublicProfileProps> = ({ slug, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'about'>('portfolio');

  // Video / Media Lightbox Modal
  const [activeMedia, setActiveMedia] = useState<PortfolioItem | null>(null);

  // Inquiry State
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySending, setInquirySending] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.getProfessionalBySlug(slug)
      .then(p => { setProfile(p); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, [slug]);

  const handleSendDirectInquiry = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }
    if (!profile) return;
    setInquirySending(true);
    try {
      const clientProfileId = user?.clientProfileId || '00000000-0000-0000-0000-000000000000';
      const res = await api.createInquiry({
        clientProfileId,
        professionalProfileId: profile.id,
        initialMessage: inquiryMessage || `Hi ${profile.displayName}, I would love to hire you for our upcoming creative campaign.`
      });
      alert('Message sent! Opening negotiation room...');
      onNavigate('messages', { conversationId: res.conversationId });
    } catch (err: any) {
      alert(err.message || 'Error sending inquiry');
    } finally {
      setInquirySending(false);
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <h2>Creator profile not found</h2>
        <button onClick={() => onNavigate('browse')} className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '60px' }}>
      
      {/* Hero Banner */}
      <div style={{
        height: '220px',
        width: '100%',
        backgroundImage: `linear-gradient(180deg, rgba(8,12,20,0.3) 0%, rgba(8,12,20,0.95) 100%), url(${profile.bannerUrl || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&auto=format&fit=crop&q=80'})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        <div className="container" style={{ paddingTop: '20px' }}>
          <button 
            onClick={() => onNavigate('browse')} 
            className="btn btn-secondary btn-sm"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
          >
            <ArrowLeft size={14} /> Back to Directory
          </button>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1200px', marginTop: '-60px' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
          
          {/* Main Profile Info & Portfolio */}
          <div>
            
            {/* Header info */}
            <div className="glass-panel" style={{ padding: '32px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <img
                  src={profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={profile.displayName}
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent-primary)', boxShadow: 'var(--shadow-glow)' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h1 style={{ fontSize: '1.75rem' }}>{profile.displayName}</h1>
                    {profile.isVerified && (
                      <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={14} /> Verified Pro
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '10px' }}>
                    {profile.headline}
                  </p>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <div style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Star size={16} fill="#fbbf24" />
                      <strong>{profile.averageRating.toFixed(1)}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>({profile.reviews?.length || 0} reviews)</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      • <strong>{profile.completedProjectsCount}</strong> completed projects
                    </div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      • <strong>{profile.yearsOfExperience}</strong> years experience
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills and Languages Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                {profile.languages.map((lang) => (
                  <span key={lang} className="badge badge-indigo">
                    <Globe size={12} /> {lang}
                  </span>
                ))}
                {profile.appearsOnCamera && (
                  <span className="badge badge-rose">
                    <Video size={12} /> On-Camera Ready
                  </span>
                )}
                {profile.acceptsProductShipments && (
                  <span className="badge badge-amber">
                    <Package size={12} /> Accepts Physical Products
                  </span>
                )}
                {profile.skills?.map((s) => (
                  <span key={s.id} className="badge badge-emerald">{s.name}</span>
                ))}
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`btn ${activeTab === 'portfolio' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                Portfolio Gallery ({profile.portfolio?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                Verified Client Reviews ({profile.reviews?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`btn ${activeTab === 'about' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                About & Bio
              </button>
            </div>

            {/* TAB CONTENT: PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <div className="grid-cols-2" style={{ gap: '20px' }}>
                {profile.portfolio?.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveMedia(item)}
                    className="glass-panel glass-panel-interactive"
                    style={{ overflow: 'hidden', cursor: 'pointer' }}
                  >
                    <div style={{ position: 'relative', height: '180px' }}>
                      <img
                        src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=500&auto=format&fit=crop&q=80'}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#000'
                        }}>
                          <Play size={20} fill="#000" />
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{item.title}</h3>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.rolePerformed}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB CONTENT: REVIEWS */}
            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(!profile.reviews || profile.reviews.length === 0) ? (
                  <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No reviews yet for this creator.
                  </div>
                ) : (
                  profile.reviews.map((rev) => (
                    <div key={rev.id} className="glass-panel" style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div>
                          <h4 style={{ fontSize: '1rem' }}>{rev.clientName}</h4>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.clientCompany || 'Verified Brand'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24' }}>
                          <Star size={16} fill="#fbbf24" />
                          <strong>{rev.overallRating} / 5</strong>
                        </div>
                      </div>

                      {/* 3-Dimension Rating Score Breakdown */}
                      <div style={{ display: 'flex', gap: '16px', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.78rem' }}>
                        <div>Communication: <strong style={{ color: 'var(--accent-cyan)' }}>{rev.communicationRating}/5</strong></div>
                        <div>Quality: <strong style={{ color: 'var(--accent-emerald)' }}>{rev.qualityRating}/5</strong></div>
                        <div>Timeliness: <strong style={{ color: '#fbbf24' }}>{rev.timelinessRating}/5</strong></div>
                      </div>

                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        "{rev.comment}"
                      </p>

                      {rev.professionalResponse && (
                        <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(99,102,241,0.08)', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.8rem' }}>
                          <strong style={{ display: 'block', color: '#a5b4fc', marginBottom: '2px' }}>Creator Response:</strong>
                          {rev.professionalResponse}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: ABOUT */}
            {activeTab === 'about' && (
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Creative Background & Workflow</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.925rem' }}>
                  {profile.bio}
                </p>
              </div>
            )}

          </div>

          {/* Sticky Hire / Inquiry Sidebar */}
          <div>
            <div className="glass-panel" style={{ padding: '28px', position: 'sticky', top: '90px' }}>
              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Standard Rate</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '4px 0' }}>
                  ₹{profile.hourlyRate.toLocaleString()} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ project unit</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--accent-emerald)' }}>
                  <Clock size={14} /> Turnaround SLA: {profile.turnaroundDays} Business Days
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', marginBottom: '10px' }}>Send Direct Inquiry</h4>
                <textarea
                  rows={4}
                  placeholder={`Hi ${profile.displayName}, we have a campaign and would like to collaborate...`}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  className="textarea-field"
                  style={{ marginBottom: '14px', fontSize: '0.875rem' }}
                />

                <button
                  onClick={handleSendDirectInquiry}
                  disabled={inquirySending}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  <Send size={16} /> {inquirySending ? 'Sending...' : 'Send Inquiry & Start Chat'}
                </button>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={16} color="var(--accent-emerald)" />
                Direct 1-on-1 negotiation with verified delivery milestones.
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* LIGHTBOX MEDIA PLAYER MODAL */}
      {activeMedia && (
        <div className="modal-overlay" onClick={() => setActiveMedia(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', padding: '0', overflow: 'hidden' }}>
            <div style={{ position: 'relative', backgroundColor: '#000' }}>
              <video
                src={activeMedia.mediaUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                controls
                autoPlay
                style={{ width: '100%', maxHeight: '480px' }}
              />
              <button 
                onClick={() => setActiveMedia(null)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '6px' }}>{activeMedia.title}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '12px' }}>{activeMedia.description}</p>
              <div style={{ display: 'flex', gap: '8px' }}>
                {activeMedia.toolsUsed?.map((t) => (
                  <span key={t} className="badge badge-indigo">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
