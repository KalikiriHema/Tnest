import React from 'react';
import { Sparkles, Film, Image as ImageIcon, Feather, CheckCircle, ShieldCheck, ArrowRight, Zap, Star, Video, Layers, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const { isAuthenticated, quickSwitch } = useAuth();

  return (
    <div>
      
      {/* HERO SECTION */}
      <section style={{ padding: '80px 0 60px', textAlign: 'center', position: 'relative' }}>
        <div className="container" style={{ maxWidth: '980px' }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', borderRadius: 'var(--radius-full)', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid var(--border-glow)', marginBottom: '24px' }}>
            <Sparkles size={16} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#a5b4fc' }}>
              Requirement-Driven Creative Talent Marketplace
            </span>
          </div>

          <h1 style={{ fontSize: '3.6rem', lineHeight: 1.1, marginBottom: '20px' }}>
            Hire Digital Creators Through <span className="gradient-text">Structured Scoping</span> & Zero-AI Matching
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto 36px', lineHeight: 1.6 }}>
            Connect with verified UGC video creators, YouTube editors, thumbnail designers, and animators. Transparent 2-way discovery, direct SignalR chat, and gated verified reviews.
          </p>

          {/* Hero CTAs */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => onNavigate('wizard')}
              className="btn btn-primary btn-lg"
            >
              Post Dynamic Requirement <ArrowRight size={18} />
            </button>
            <button 
              onClick={() => onNavigate('browse')}
              className="btn btn-secondary btn-lg"
            >
              Browse Verified Creators
            </button>
          </div>

          {/* Quick Demo Personas Bar */}
          <div style={{ marginTop: '36px', padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quick 1-Click Persona:</span>
            <button onClick={() => quickSwitch('client')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
              👤 Brand Client (GlowSkin)
            </button>
            <button onClick={() => quickSwitch('ugc_pro')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
              ✨ UGC Pro (Priya Reddy)
            </button>
            <button onClick={() => quickSwitch('editor_pro')} className="btn btn-secondary btn-sm" style={{ fontSize: '0.78rem' }}>
              🎬 Video Editor (Arjun Verma)
            </button>
          </div>

        </div>
      </section>

      {/* CORE VALUE PILLARS */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="grid-cols-3">
            
            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Zap size={24} color="var(--accent-primary)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Dynamic Scoping Engine</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Say goodbye to ambiguous 1-line requests. Specialized form schemas adapt for video editing, UGC skincare, or thumbnail CTR goals.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <ShieldCheck size={24} color="var(--accent-emerald)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Transparent Deterministic Match</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Zero black-box AI algorithms. See exact match breakdowns: Role compatibility, Skills overlap, Languages, and Turnaround SLAs.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Users size={24} color="var(--accent-secondary)" />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Two-Way Marketplace Discovery</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                Clients can directly scout matched creatives, while verified creators browse open briefs in their Opportunity Feed to pitch directly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="badge badge-emerald" style={{ marginBottom: '8px' }}>Creative Taxonomy</span>
            <h2 style={{ fontSize: '2.2rem' }}>Specialized Creative Categories</h2>
          </div>

          <div className="grid-cols-4">
            {[
              { title: 'UGC Video Creation', slug: 'ugc-creators', icon: <Sparkles size={24} color="#ec4899" />, desc: 'Authentic product hooks, unboxings & reels' },
              { title: 'Video Editing & Motion', slug: 'video-editors', icon: <Film size={24} color="#6366f1" />, desc: 'High-retention cuts, captions & color grading' },
              { title: 'Thumbnails & Covers', slug: 'thumbnail-designers', icon: <ImageIcon size={24} color="#06b6d4" />, desc: 'CTR-optimized graphics & Photoshop art' },
              { title: 'Scriptwriting & Hooks', slug: 'scriptwriters', icon: <Feather size={24} color="#f59e0b" />, desc: 'Viral YouTube outlines & direct-response scripts' }
            ].map((c) => (
              <div 
                key={c.slug}
                onClick={() => onNavigate('browse', { category: c.slug })}
                className="glass-panel glass-panel-interactive"
                style={{ padding: '24px', cursor: 'pointer', textAlign: 'center' }}
              >
                <div style={{ margin: '0 auto 16px', width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {c.icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{c.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};
