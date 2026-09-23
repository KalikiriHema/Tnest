import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { ProfessionalProfile, Category } from '../types';
import { Search, Star, CheckCircle, Video, Package, Clock, Sparkles, Filter, ChevronRight } from 'lucide-react';

interface TalentDirectoryProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: () => void;
}

export const TalentDirectory: React.FC<TalentDirectoryProps> = ({ onNavigate, onOpenAuth }) => {
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('');
  const [onCamera, setOnCamera] = useState(false);
  const [productShipment, setProductShipment] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getCategories(),
      api.getProfessionals()
    ]).then(([cats, pros]) => {
      setCategories(cats);
      setProfessionals(pros);
      setLoading(false);
    });
  }, []);

  const handleFilter = async () => {
    setLoading(true);
    try {
      const data = await api.getProfessionals({
        category: category || undefined,
        language: language || undefined,
        onCamera: onCamera || undefined,
        productShipment: productShipment || undefined,
        search: search || undefined
      });
      setProfessionals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFilter();
  }, [category, language, onCamera, productShipment]);

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '1200px' }}>
      
      {/* Title */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span className="badge badge-indigo">Talent Directory</span>
          <span className="badge badge-emerald">Verified Creatives</span>
        </div>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '8px' }}>
          Browse Digital Creative Specialists
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Filter by verified skillsets, on-camera readiness, language fluency, and turnaround times.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-panel" style={{ padding: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          
          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by name, skill, style (e.g. Telugu UGC, DaVinci, Shorts)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleFilter()}
              className="input-field"
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {/* Category Filter */}
          <select 
            className="select-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>{c.name}</option>
            ))}
          </select>

          {/* Language Filter */}
          <select 
            className="select-field"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="">All Languages</option>
            <option value="English">English</option>
            <option value="Telugu">Telugu</option>
            <option value="Hindi">Hindi</option>
            <option value="Tamil">Tamil</option>
          </select>

        </div>

        {/* Checkbox toggles */}
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={onCamera} 
              onChange={(e) => setOnCamera(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }} 
            />
            On-Camera Talent Only
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={productShipment} 
              onChange={(e) => setProductShipment(e.target.checked)}
              style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }} 
            />
            Accepts Product Shipments
          </label>

          <div style={{ marginLeft: 'auto' }}>
            <button onClick={handleFilter} className="btn btn-primary btn-sm">
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* TALENT GRID */}
      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading verified talent...</div>
      ) : professionals.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
          <h3>No creative professionals match your current filter.</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Try broadening your search query or reset filters.</p>
        </div>
      ) : (
        <div className="grid-cols-2" style={{ gap: '24px' }}>
          {professionals.map((pro) => (
            <div 
              key={pro.id}
              className="glass-panel glass-panel-interactive"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                {/* Pro Header */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '14px' }}>
                  <img
                    src={pro.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={pro.displayName}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-primary)' }}
                  />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3 style={{ fontSize: '1.15rem' }}>{pro.displayName}</h3>
                      {pro.isVerified && <CheckCircle size={16} color="var(--accent-cyan)" />}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {pro.headline}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', marginTop: '2px' }}>
                      <span style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={13} fill="#fbbf24" /> <strong>{pro.averageRating.toFixed(1)}</strong>
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>• {pro.completedProjectsCount} projects</span>
                      <span style={{ color: 'var(--text-muted)' }}>• {pro.yearsOfExperience} yrs exp</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
                  {pro.bio}
                </p>

                {/* Skills & Flags */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {pro.languages.map((l) => (
                    <span key={l} className="badge badge-indigo">{l}</span>
                  ))}
                  {pro.appearsOnCamera && <span className="badge badge-rose">On-Camera</span>}
                  {pro.acceptsProductShipments && <span className="badge badge-amber">Product Shipment</span>}
                  {pro.skills?.slice(0, 2).map((s) => (
                    <span key={s.id} className="badge badge-emerald">{s.name}</span>
                  ))}
                </div>

                {/* Top Portfolio Thumbnail Preview if available */}
                {pro.portfolio && pro.portfolio.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 600 }}>
                      Featured Asset:
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px', borderRadius: '8px' }}>
                      <img 
                        src={pro.portfolio[0].thumbnailUrl || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&auto=format&fit=crop&q=80'} 
                        alt="Portfolio" 
                        style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{pro.portfolio[0].title}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{pro.portfolio[0].rolePerformed}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '8px' }}>
                <div>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>₹{pro.hourlyRate.toLocaleString()}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> / project unit</span>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SLA: {pro.turnaroundDays} Days</div>
                </div>

                <button 
                  onClick={() => onNavigate('profile', { slug: pro.slug })}
                  className="btn btn-primary btn-sm"
                >
                  View Profile & Hire <ChevronRight size={14} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
