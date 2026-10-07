import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { MOCK_DOERS, V1_CATEGORIES } from '../data/mockData';
import { ProfessionalProfile } from '../types';
import { api } from '../api';
import { 
  Search, 
  Filter, 
  Star, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Eye, 
  Users, 
  X, 
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
  Plus
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';

interface FindDoersProps {
  initialCategory?: string;
  initialSearchQuery?: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const FindDoers: React.FC<FindDoersProps> = ({
  initialCategory = '',
  initialSearchQuery = '',
  onNavigate,
  onOpenAuth
}) => {
  const { user, isAuthenticated } = useAuth();
  const [allDoers, setAllDoers] = useState<ProfessionalProfile[]>(MOCK_DOERS);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedExperience, setSelectedExperience] = useState<string>('');
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(0);
  const [minRating, setMinRating] = useState<number>(0);
  const [availableNowOnly, setAvailableNowOnly] = useState(false);
  const [onCameraOnly, setOnCameraOnly] = useState(false);
  const [productShipmentOnly, setProductShipmentOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'recent' | 'rate-low' | 'projects'>('rating');

  React.useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Load live professionals from database
  const loadProfessionals = async () => {
    setIsLoading(true);
    try {
      const livePros = await api.getProfessionals();

      if (livePros && livePros.length > 0) {
        const normalized: ProfessionalProfile[] = livePros.map((p: any) => ({
          ...p,
          reviewCount: p.reviewCount !== undefined ? p.reviewCount : (p.reviews ? p.reviews.length : 0),
          averageRating: p.averageRating !== undefined ? p.averageRating : 0.0,
          completedProjectsCount: p.completedProjectsCount || 0,
          roles: p.roles || [],
          skills: p.skills || [],
          portfolio: p.portfolio || []
        }));

        const liveIds = new Set(normalized.map((n) => n.id));
        const filteredMock = MOCK_DOERS.filter((m) => !liveIds.has(m.id));
        setAllDoers([...normalized, ...filteredMock]);
      } else {
        setAllDoers(MOCK_DOERS);
      }
    } catch (err) {
      console.warn('Falling back to mock doers dataset:', err);
      setAllDoers(MOCK_DOERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfessionals();
  }, []);

  // Inquiry Modal State
  const [inquiryDoer, setInquiryDoer] = useState<ProfessionalProfile | null>(null);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const activeCategoryObj = useMemo(() => {
    return V1_CATEGORIES.find((c) => c.slug === selectedCategory);
  }, [selectedCategory]);

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) => 
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
  };

  const filteredDoers = useMemo(() => {
    const filtered = allDoers.filter((doer) => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = doer.displayName.toLowerCase().includes(q);
        const matchesHeadline = (doer.headline || '').toLowerCase().includes(q);
        const matchesBio = (doer.bio || '').toLowerCase().includes(q);
        const matchesRole = (doer.roles || []).some((r) => (typeof r === 'string' ? r : r.name).toLowerCase().includes(q));
        const matchesSkill = (doer.skills || []).some((s) => (typeof s === 'string' ? s : s.name).toLowerCase().includes(q));
        if (!matchesName && !matchesHeadline && !matchesBio && !matchesRole && !matchesSkill) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory) {
        const inCat = (doer.roles || []).some((r) => (typeof r === 'object' && (r.categorySlug === selectedCategory || r.name?.toLowerCase().includes(selectedCategory.replace('-', ' ')))));
        const matchDirect = (doer as any).categorySlug === selectedCategory || (doer.headline || '').toLowerCase().includes(selectedCategory.replace('-', ' '));
        if (!inCat && !matchDirect) return false;
      }

      // Role filter
      if (selectedRoles.length > 0) {
        const matchesAnyRole = (doer.roles || []).some((r) => selectedRoles.includes(typeof r === 'string' ? r : r.name));
        if (!matchesAnyRole) return false;
      }

      // Experience Level
      if (selectedExperience) {
        const exp = (doer.experienceLevel || '').toLowerCase();
        if (selectedExperience === 'Junior' && !exp.includes('junior') && (doer.yearsOfExperience || 0) > 2) return false;
        if (selectedExperience === 'Mid' && !exp.includes('mid') && ((doer.yearsOfExperience || 0) < 2 || (doer.yearsOfExperience || 0) > 5)) return false;
        if (selectedExperience === 'Senior' && !exp.includes('senior') && (doer.yearsOfExperience || 0) < 5) return false;
      }

      // Max Hourly Rate
      if (maxHourlyRate > 0 && (doer.hourlyRate || 0) > maxHourlyRate) {
        return false;
      }

      // Language
      if (selectedLanguage && !(doer.languages || []).includes(selectedLanguage)) {
        return false;
      }

      // Rating
      if (minRating > 0 && (doer.averageRating || 0) < minRating) {
        return false;
      }

      // On-camera presence
      if (onCameraOnly && !doer.appearsOnCamera) {
        return false;
      }

      // Product shipments
      if (productShipmentOnly && !doer.acceptsProductShipments) {
        return false;
      }

      // Available now
      if (availableNowOnly && doer.availabilityStatus !== 'AvailableNow') {
        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.averageRating || 0) - (a.averageRating || 0);
      }
      if (sortBy === 'recent' || sortBy === 'projects') {
        return (b.completedProjectsCount || 0) - (a.completedProjectsCount || 0);
      }
      if (sortBy === 'rate-low') {
        return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      }
      return 0;
    });
  }, [allDoers, searchQuery, selectedCategory, selectedRoles, selectedExperience, maxHourlyRate, selectedLanguage, minRating, availableNowOnly, onCameraOnly, productShipmentOnly, sortBy]);

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    if (!inquiryDoer) return;
    setSendingInquiry(true);
    try {
      const clientProfileId = user?.clientProfileId || user?.id || '00000000-0000-0000-0000-000000000000';
      const res = await api.createInquiry({
        clientProfileId,
        professionalProfileId: inquiryDoer.id,
        initialMessage: inquiryMessage || `Hi ${inquiryDoer.displayName}, I came across your profile and would like to discuss an opportunity.`
      });
      setInquiryDoer(null);
      setInquiryMessage('');
      onNavigate('messages', { conversationId: res.conversationId });
    } catch (err: any) {
      alert(err.message || 'Error sending inquiry');
    } finally {
      setSendingInquiry(false);
    }
  };

  const handleStartDirectChat = async (doer: ProfessionalProfile) => {
    if (!isAuthenticated) {
      onOpenAuth('login');
      return;
    }
    try {
      const clientProfileId = user?.clientProfileId || user?.id || '00000000-0000-0000-0000-000000000000';
      const res = await api.createInquiry({
        clientProfileId,
        professionalProfileId: doer.id,
        initialMessage: `Hi ${doer.displayName}, starting a direct conversation regarding our upcoming project.`
      });
      onNavigate('messages', { conversationId: res.conversationId });
    } catch (err) {
      onNavigate('messages');
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px 80px' }}>
      
      {/* Top Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: 'Find Doers', active: !selectedCategory, onClick: selectedCategory ? () => setSelectedCategory('') : undefined },
          ...(selectedCategory ? [{ label: V1_CATEGORIES.find(c => c.slug === selectedCategory)?.name || selectedCategory, active: true }] : [])
        ]}
        backLabel="Back"
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          Find Capable Doers
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '680px' }}>
          Discover verified specialists, creators, and freelancers. Inspect verified ratings, completed tasks, and past portfolio samples.
        </p>
      </div>

      {/* Search Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border-medium)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '8px 14px', 
        marginBottom: '28px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input 
          type="text"
          placeholder="Search by name, skill, role, or discipline (e.g. React, Video Editor, Copywriting)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', fontSize: '0.95rem', width: '100%', outline: 'none' }}
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}>
            <X size={16} />
          </button>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="responsive-grid-sidebar-left">
        
        {/* Sidebar Filters */}
        <div 
          className="card responsive-sticky-sidebar" 
          style={{ 
            padding: '20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              <Filter size={15} color="var(--text-muted)" /> Filters
            </div>
            {(selectedCategory || selectedRoles.length > 0 || selectedLanguage || selectedExperience || maxHourlyRate > 0 || minRating > 0 || availableNowOnly || onCameraOnly || productShipmentOnly) && (
              <button 
                onClick={() => { 
                  setSelectedCategory(''); 
                  setSelectedRoles([]); 
                  setSelectedLanguage(''); 
                  setSelectedExperience('');
                  setMaxHourlyRate(0); 
                  setMinRating(0); 
                  setAvailableNowOnly(false); 
                  setOnCameraOnly(false);
                  setProductShipmentOnly(false);
                }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
              >
                Reset All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Discipline / Category
            </label>
            <select
              className="select-field"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setSelectedRoles([]); }}
              style={{ fontSize: '0.85rem', padding: '6px 10px' }}
            >
              <option value="">All Categories</option>
              {V1_CATEGORIES.map((c) => (
                <option key={c.id} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Roles Filter (if category selected) */}
          {activeCategoryObj && (
            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
                Roles in {activeCategoryObj.name}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '140px', overflowY: 'auto' }}>
                {activeCategoryObj.roles.map((role) => {
                  const isChecked = selectedRoles.includes(role.name);
                  return (
                    <label key={role.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: isChecked ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer' }}>
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => toggleRole(role.name)}
                        style={{ accentColor: 'var(--accent-primary)' }}
                      />
                      <span>{role.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Experience Level */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Experience Level
            </label>
            <select
              className="select-field"
              value={selectedExperience}
              onChange={(e) => setSelectedExperience(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '6px 10px' }}
            >
              <option value="">All Experience Tiers</option>
              <option value="Junior">Junior Tier (&lt; 2 yrs)</option>
              <option value="Mid">Mid-Level (2 - 5 yrs)</option>
              <option value="Senior">Senior Specialist (5+ yrs)</option>
            </select>
          </div>

          {/* Max Hourly Rate Filter */}
          <div style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Max Rate (₹/hr)
              </label>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {maxHourlyRate > 0 ? `₹${maxHourlyRate.toLocaleString()}` : 'Any Rate'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10000"
              step="500"
              value={maxHourlyRate}
              onChange={(e) => setMaxHourlyRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>

          {/* Language Preference */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Language
            </label>
            <select
              className="select-field"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '6px 10px' }}
            >
              <option value="">Any Language</option>
              <option value="English">English</option>
              <option value="Telugu">Telugu</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Malayalam">Malayalam</option>
            </select>
          </div>

          {/* Deliverable Capabilities & Availability */}
          <div style={{ marginBottom: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block' }}>
              Availability
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={availableNowOnly} 
                onChange={(e) => setAvailableNowOnly(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>⚡ Available for Work Now</span>
            </label>

            {/* Media & Physical Capabilities (Shown only for relevant creator / video disciplines) */}
            {(selectedCategory === 'ugc-creators' || selectedCategory === 'video-editing' || (activeCategoryObj && activeCategoryObj.slug.includes('creator'))) && (
              <>
                <label style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: '6px', display: 'block' }}>
                  Creator Specific
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={onCameraOnly} 
                    onChange={(e) => setOnCameraOnly(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>🎥 On-Camera Presenter</span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={productShipmentOnly} 
                    onChange={(e) => setProductShipmentOnly(e.target.checked)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>📦 Accepts Product Shipments</span>
                </label>
              </>
            )}
          </div>

          {/* Minimum Rating */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Minimum Rating
            </label>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 4.5, 4.8, 4.9].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(r)}
                  className={`btn btn-sm ${minRating === r ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '4px 8px', flex: 1 }}
                >
                  {r === 0 ? 'All' : `${r}★+`}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Doer Cards Stream */}
        <div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredDoers.length}</strong> verified Doers
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="select-field"
                style={{ padding: '5px 10px', fontSize: '0.82rem', width: 'auto' }}
              >
                <option value="rating">Top Rated</option>
                <option value="recent">Most Tasks Completed</option>
                <option value="rate-low">Lowest Hourly Rate</option>
              </select>

              <button
                onClick={loadProfessionals}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '5px 8px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Refresh"
              >
                <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredDoers.map((doer) => (
              <div 
                key={doer.id}
                className="card card-hover"
                style={{ padding: '24px' }}
              >
                
                {/* Header profile row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '14px' }}>
                  
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <img 
                      src={doer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                      alt={doer.displayName} 
                      style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-sm)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <h2 
                          onClick={() => onNavigate('profile', { slug: doer.slug })}
                          style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                        >
                          {doer.displayName}
                        </h2>
                        {doer.isVerified && (
                          <span className="badge badge-emerald" style={{ padding: '1px 5px', fontSize: '0.7rem' }}>Verified</span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {doer.headline}
                      </p>
                    </div>
                  </div>

                  {/* Hourly Rate */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ₹{doer.hourlyRate.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>/ hr</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                      Turnaround: ~{doer.turnaroundDays} Days
                    </span>
                  </div>

                </div>

                {/* Reputation & Stats line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '14px', flexWrap: 'wrap' }}>
                  {doer.averageRating && doer.averageRating > 0 ? (
                    <span style={{ color: 'var(--status-warning)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                      <Star size={13} fill="currentColor" /> {doer.averageRating.toFixed(1)} ({doer.reviewCount || doer.reviews?.length || 0} reviews)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>New Doer</span>
                  )}
                  <span>•</span>
                  <span>{doer.completedProjectsCount || 0} Tasks Completed</span>
                  <span>•</span>
                  <span style={{ color: 'var(--status-success)', fontWeight: 500 }}>
                    {doer.availabilityStatus === 'AvailableNow' ? 'Available for Tasks' : 'Partially Booked'}
                  </span>
                  {doer.languages && doer.languages.length > 0 && (
                    <>
                      <span>•</span>
                      <span>Languages: {doer.languages.join(', ')}</span>
                    </>
                  )}
                </div>

                {/* Bio snippet */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.55, marginBottom: '16px' }}>
                  {doer.bio}
                </p>

                {/* Roles & Skills Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                  {doer.roles.map((r) => (
                    <span key={r.id} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', fontWeight: 500 }}>
                      Role: {r.name}
                    </span>
                  ))}
                  {doer.skills.map((s) => (
                    <span key={s.id} style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                      {s.name}
                    </span>
                  ))}
                </div>

                {/* Portfolio Previews */}
                {doer.portfolio && doer.portfolio.length > 0 && (
                  <div style={{ marginBottom: '18px', padding: '12px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                      Portfolio Samples
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                      {doer.portfolio.slice(0, 3).map((item) => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {item.thumbnailUrl && (
                            <img src={item.thumbnailUrl} alt={item.title} style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-xs)', objectFit: 'cover', border: '1px solid var(--border-subtle)' }} />
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <strong style={{ fontSize: '0.8rem', color: 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.title}</strong>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.rolePerformed}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button 
                    onClick={() => onNavigate('profile', { slug: doer.slug })}
                    className="btn btn-secondary btn-sm"
                  >
                    <Eye size={13} /> View Profile
                  </button>
                  <button 
                    onClick={() => handleStartDirectChat(doer)}
                    className="btn btn-secondary btn-sm"
                  >
                    <MessageSquare size={13} /> Chat
                  </button>
                  <button 
                    onClick={() => setInquiryDoer(doer)}
                    className="btn btn-primary btn-sm"
                  >
                    <Send size={13} /> Send Inquiry
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>

      </div>

      {/* Inquiry Modal */}
      {inquiryDoer && (
        <div className="modal-overlay" onClick={() => setInquiryDoer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '4px' }}>Direct Inquiry</span>
                <h3 style={{ fontSize: '1.15rem' }}>Send Inquiry to {inquiryDoer.displayName}</h3>
              </div>
              <button onClick={() => setInquiryDoer(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendInquiry} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Your Message or Task Requirements
                </label>
                <textarea 
                  className="textarea-field" 
                  rows={4}
                  placeholder={`Hi ${inquiryDoer.displayName}, I came across your profile and would like to hire you for...`}
                  value={inquiryMessage}
                  onChange={(e) => setInquiryMessage(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setInquiryDoer(null)} className="btn btn-secondary btn-sm">Cancel</button>
                <button type="submit" disabled={sendingInquiry} className="btn btn-primary btn-sm">
                  {sendingInquiry ? 'Sending...' : 'Send Inquiry'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
