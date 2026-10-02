import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_OPPORTUNITIES, V1_CATEGORIES } from '../data/mockData';
import { Requirement, OpportunityType } from '../types';
import { TaskDetailModal } from './TaskDetailModal';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Filter, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Layers, 
  Send, 
  Bookmark, 
  CheckCircle2, 
  X, 
  Building2, 
  Users,
  ChevronDown,
  Calendar,
  ArrowUpDown,
  RefreshCw,
  Plus
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { formatRelativeTime } from '../utils/timeAgo';

interface BrowseOpportunitiesProps {
  initialSearchQuery?: string;
  initialCategorySlug?: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const BrowseOpportunities: React.FC<BrowseOpportunitiesProps> = ({
  initialSearchQuery = '',
  initialCategorySlug = '',
  onNavigate,
  onOpenAuth
}) => {
  const { user, isAuthenticated } = useAuth();
  const [allOpportunities, setAllOpportunities] = useState<Requirement[]>(MOCK_OPPORTUNITIES);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | OpportunityType>('All');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategorySlug);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [minBudget, setMinBudget] = useState<number>(0);
  const [dateFilter, setDateFilter] = useState<'all' | '24h' | '3d' | '7d' | '30d'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'budget-high' | 'budget-low' | 'delivery-fast' | 'popular'>('recent');

  // Selected opportunity for detail modal
  const [detailOpportunity, setDetailOpportunity] = useState<Requirement | null>(null);
  const [applyModalOpp, setApplyModalOpp] = useState<Requirement | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [proposedPrice, setProposedPrice] = useState<number>(15000);
  const [estimatedDays, setEstimatedDays] = useState<number>(3);
  const [appliedSuccess, setAppliedSuccess] = useState(false);
  const [appliedOppIds, setAppliedOppIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('tnest_applied_opps');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Fetch live opportunities from backend
  const loadOpportunities = async () => {
    setIsLoading(true);
    try {
      const liveOpps = await api.getOpportunities({
        categorySlug: selectedCategory || undefined
      });

      if (liveOpps && liveOpps.length > 0) {
        const normalizedLive: Requirement[] = liveOpps.map((o: any) => {
          let dynamicAttr: any = {};
          try {
            if (o.dynamicAttributesJson) dynamicAttr = JSON.parse(o.dynamicAttributesJson);
          } catch {
            dynamicAttr = {};
          }

          return {
            ...o,
            opportunityType: (dynamicAttr.opportunityType as OpportunityType) || o.opportunityType || 'Task',
            rolesNeeded: dynamicAttr.selectedRole ? [dynamicAttr.selectedRole] : (o.rolesNeeded || []),
            requiredSkills: dynamicAttr.selectedSkills || o.requiredSkills || [],
            deliverables: dynamicAttr.deliverables || o.deliverables || [],
            locationType: dynamicAttr.locationType || o.locationType || 'Remote',
            city: dynamicAttr.city || o.city || '',
            budgetMin: o.budgetMin || 0,
            budgetMax: o.budgetMax || o.budgetMin || 0,
            expectedDeliveryDays: o.expectedDeliveryDays || 5,
            clientCompany: o.clientCompany || 'Verified Client',
            createdAtUtc: o.createdAtUtc || o.createdAt || new Date().toISOString()
          };
        });

        const liveIds = new Set(normalizedLive.map((n) => n.id));
        const filteredMock = MOCK_OPPORTUNITIES.filter((m) => !liveIds.has(m.id));
        setAllOpportunities([...normalizedLive, ...filteredMock]);
      } else {
        setAllOpportunities(MOCK_OPPORTUNITIES);
      }
    } catch (err) {
      console.warn('Falling back to mock dataset:', err);
      setAllOpportunities(MOCK_OPPORTUNITIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities();
  }, [selectedCategory]);

  const activeCategoryObj = useMemo(() => {
    return V1_CATEGORIES.find((c) => c.slug === selectedCategory);
  }, [selectedCategory]);

  const toggleRole = (roleName: string) => {
    setSelectedRoles((prev) => 
      prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]
    );
  };

  const toggleSkill = (skillName: string) => {
    setSelectedSkills((prev) => 
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  const filteredOpportunities = useMemo(() => {
    const now = Date.now();

    const filtered = allOpportunities.filter((opp) => {
      // Tab filter
      if (activeTab !== 'All' && opp.opportunityType !== activeTab) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesDesc = opp.description.toLowerCase().includes(q);
        const matchesClient = (opp.clientCompany || opp.clientName || '').toLowerCase().includes(q);
        const matchesCategory = (opp.categoryName || '').toLowerCase().includes(q);
        const matchesRoles = (opp.rolesNeeded || []).some((r) => r.toLowerCase().includes(q));
        const matchesSkills = (opp.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesClient && !matchesCategory && !matchesRoles && !matchesSkills) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && selectedCategory !== 'all') {
        const cat = V1_CATEGORIES.find((c) => c.slug === selectedCategory);
        if (cat && opp.categoryName !== cat.name && opp.categoryId !== cat.id) {
          return false;
        }
      }

      // Roles filter
      if (selectedRoles.length > 0) {
        const matchesRole = (opp.rolesNeeded || []).some((r) => selectedRoles.includes(r));
        if (!matchesRole) return false;
      }

      // Skills filter
      if (selectedSkills.length > 0) {
        const matchesSkill = (opp.requiredSkills || []).some((s) => selectedSkills.includes(s));
        if (!matchesSkill) return false;
      }

      // Remote filter
      if (remoteOnly && opp.locationType !== 'Remote') {
        return false;
      }

      // Min Budget filter
      if (minBudget > 0 && (opp.budgetMax || opp.budgetMin) < minBudget) {
        return false;
      }

      // Date Recency filter
      if (dateFilter !== 'all') {
        const createdMs = new Date(opp.createdAtUtc || '').getTime();
        if (!isNaN(createdMs)) {
          const ageMs = now - createdMs;
          if (dateFilter === '24h' && ageMs > 24 * 60 * 60 * 1000) return false;
          if (dateFilter === '3d' && ageMs > 3 * 24 * 60 * 60 * 1000) return false;
          if (dateFilter === '7d' && ageMs > 7 * 24 * 60 * 60 * 1000) return false;
          if (dateFilter === '30d' && ageMs > 30 * 24 * 60 * 60 * 1000) return false;
        }
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAtUtc || '').getTime() - new Date(a.createdAtUtc || '').getTime();
      }
      if (sortBy === 'budget-high') {
        return (b.budgetMax || b.budgetMin) - (a.budgetMax || a.budgetMin);
      }
      if (sortBy === 'budget-low') {
        return (a.budgetMin || 0) - (b.budgetMin || 0);
      }
      if (sortBy === 'delivery-fast') {
        return (a.expectedDeliveryDays || 99) - (b.expectedDeliveryDays || 99);
      }
      if (sortBy === 'popular') {
        return (b.proposalsCount || 0) - (a.proposalsCount || 0);
      }
      return 0;
    });
  }, [allOpportunities, activeTab, searchQuery, selectedCategory, selectedRoles, selectedSkills, remoteOnly, minBudget, dateFilter, sortBy]);

  const handleOpenApplyModal = (opp: Requirement) => {
    setApplyModalOpp(opp);
    setProposedPrice(opp.budgetMin || 15000);
    setEstimatedDays(opp.expectedDeliveryDays || 3);
    setCoverLetter('');
    setAppliedSuccess(false);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyModalOpp) return;

    setAppliedSuccess(true);
    const updated = new Set(appliedOppIds);
    updated.add(applyModalOpp.id);
    setAppliedOppIds(updated);
    try {
      localStorage.setItem('tnest_applied_opps', JSON.stringify(Array.from(updated)));
    } catch {}

    setTimeout(() => {
      setAppliedSuccess(false);
      setApplyModalOpp(null);
    }, 800);
  };

  return (
    <div className="container" style={{ padding: '32px 24px 80px' }}>
      
      {/* Top Breadcrumbs */}
      <BreadcrumbNav
        items={[
          { label: 'Browse Opportunities', active: !selectedCategory, onClick: selectedCategory ? () => setSelectedCategory('') : undefined },
          ...(selectedCategory && selectedCategory !== 'all' ? [{ label: V1_CATEGORIES.find(c => c.slug === selectedCategory)?.name || selectedCategory, active: true }] : [])
        ]}
        backLabel="Back"
        onNavigate={onNavigate}
      />

      {/* Header Section */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '8px' }}>
          Browse Opportunities
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '680px' }}>
          Explore open tasks, jobs, freelance work, and internships. Filter by role, required skills, budget, and location.
        </p>
      </div>

      {/* Universal Search Bar */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '10px', 
        backgroundColor: 'var(--bg-secondary)', 
        border: '1px solid var(--border-medium)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '8px 14px', 
        marginBottom: '24px',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <Search size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
        <input 
          type="text"
          placeholder="Search tasks, jobs, skills, roles, or client companies..."
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

      {/* Opportunity Type Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
        {(['All', 'Tasks', 'Freelance', 'Jobs', 'Internships'] as const).map((tab) => {
          const tabKey = tab === 'Tasks' ? 'Task' : tab === 'Jobs' ? 'Job' : tab;
          const isSelected = activeTab === tab || (tab === 'Tasks' && activeTab === 'Task') || (tab === 'Jobs' && activeTab === 'Job');
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab === 'All' ? 'All' : (tabKey as OpportunityType))}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontWeight: isSelected ? 600 : 500 }}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Main Two-Column Discovery Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '28px', alignItems: 'flex-start' }}>
        
        {/* Sidebar Filters */}
        <div 
          className="card" 
          style={{ 
            padding: '20px', 
            position: 'sticky', 
            top: '76px',
            maxHeight: 'calc(100vh - 96px)',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '0.9rem' }}>
              <Filter size={15} color="var(--text-muted)" /> Filters
            </div>
            {(selectedCategory || selectedRoles.length > 0 || selectedSkills.length > 0 || remoteOnly || minBudget > 0 || dateFilter !== 'all') && (
              <button 
                onClick={() => { setSelectedCategory(''); setSelectedRoles([]); setSelectedSkills([]); setRemoteOnly(false); setMinBudget(0); setDateFilter('all'); }}
                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
              >
                Reset
              </button>
            )}
          </div>

          {/* Date Filter */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '8px' }}>
              Date Posted
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'all', label: 'All Time' },
                { id: '24h', label: 'Past 24 Hours' },
                { id: '3d', label: 'Past 3 Days' },
                { id: '7d', label: 'Past 1 Week' },
                { id: '30d', label: 'Past 1 Month' }
              ].map((item) => (
                <label key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', cursor: 'pointer', padding: '2px 0' }}>
                  <input 
                    type="radio" 
                    name="dateFilter" 
                    checked={dateFilter === item.id} 
                    onChange={() => setDateFilter(item.id as any)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Category Dropdown Filter */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Category
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

          {/* Remote Only */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={remoteOnly} 
                onChange={(e) => setRemoteOnly(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)' }}
              />
              <span>Remote Only</span>
            </label>
          </div>

          {/* Min Budget */}
          <div>
            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'block', marginBottom: '6px' }}>
              Min Budget
            </label>
            <select
              className="select-field"
              value={minBudget}
              onChange={(e) => setMinBudget(Number(e.target.value))}
              style={{ fontSize: '0.85rem', padding: '6px 10px' }}
            >
              <option value="0">Any Budget</option>
              <option value="5000">₹5,000+</option>
              <option value="10000">₹10,000+</option>
              <option value="25000">₹25,000+</option>
              <option value="50000">₹50,000+</option>
            </select>
          </div>

        </div>

        {/* Opportunity Cards Stream */}
        <div>
          
          {/* Stream Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{filteredOpportunities.length}</strong> opportunities
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="select-field"
                style={{ padding: '5px 10px', fontSize: '0.82rem', width: 'auto' }}
              >
                <option value="recent">Most Recent</option>
                <option value="budget-high">Budget: High to Low</option>
                <option value="budget-low">Budget: Low to High</option>
                <option value="delivery-fast">Fastest Delivery</option>
                <option value="popular">Most Applications</option>
              </select>

              <button
                onClick={loadOpportunities}
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

          {filteredOpportunities.length === 0 ? (
            <div className="card" style={{ padding: '48px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No opportunities found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Try relaxing filters or search terms to see more available briefs.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredOpportunities.map((opp) => (
                <div 
                  key={opp.id} 
                  className="card card-hover"
                  style={{ padding: '22px' }}
                >
                  
                  {/* Top metadata tags */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      {appliedOppIds.has(opp.id) && (
                        <span className="badge badge-emerald">
                          <CheckCircle2 size={11} /> Applied
                        </span>
                      )}
                      <span className="badge badge-primary">{opp.categoryName}</span>
                      <span className="badge badge-neutral">{opp.opportunityType || 'Task'}</span>
                      {opp.locationType === 'Remote' ? (
                        <span className="badge badge-emerald">Remote</span>
                      ) : (
                        <span className="badge badge-neutral">{opp.city || 'On-site'}</span>
                      )}
                      {opp.vacanciesCount && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          • {opp.vacanciesCount} {opp.vacanciesCount > 1 ? 'Vacancies' : 'Vacancy'}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {formatRelativeTime(opp.createdAtUtc)}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 
                    onClick={() => setDetailOpportunity(opp)}
                    style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', marginBottom: '8px' }}
                  >
                    {opp.title}
                  </h2>

                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {opp.description}
                  </p>

                  {/* Roles & Required Skills */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {(opp.rolesNeeded || []).map((role, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontWeight: 500 }}>
                        Role: {role}
                      </span>
                    ))}
                    {(opp.requiredSkills || []).map((skill, idx) => (
                      <span key={idx} style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Footer Details & Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '12px' }}>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                        {opp.budgetMax ? `₹${opp.budgetMin.toLocaleString()} - ₹${opp.budgetMax.toLocaleString()}` : `₹${opp.budgetMin.toLocaleString()}`}
                      </span>
                      <span>•</span>
                      <span>Delivery: {opp.expectedDeliveryDays} Days</span>
                      <span>•</span>
                      <span>{opp.clientCompany || opp.clientName}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setDetailOpportunity(opp)}
                        className="btn btn-secondary btn-sm"
                      >
                        View Brief
                      </button>
                      <button 
                        onClick={() => setDetailOpportunity(opp)}
                        className="btn btn-primary btn-sm"
                      >
                        {appliedOppIds.has(opp.id) ? 'Applied' : 'Apply Now'}
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Task Detail & 3-Step Apply Modal */}
      {detailOpportunity && (
        <TaskDetailModal
          opportunity={detailOpportunity}
          isOpen={Boolean(detailOpportunity)}
          isApplied={appliedOppIds.has(detailOpportunity.id)}
          onClose={() => setDetailOpportunity(null)}
          onApply={(opp) => {
            const updated = new Set(appliedOppIds);
            updated.add(opp.id);
            setAppliedOppIds(updated);
            try {
              localStorage.setItem('tnest_applied_opps', JSON.stringify(Array.from(updated)));
            } catch {}
          }}
          onNavigateToApplications={() => onNavigate('my-activity', { tab: 'applications' })}
          onNavigateToOpportunities={() => setDetailOpportunity(null)}
          onNavigateToClientProfile={(clientId) => {
            setDetailOpportunity(null);
            onNavigate('client-profile', { clientId });
          }}
          onNavigateToPoster={(poster) => {
            setDetailOpportunity(null);
            onNavigate('messages', {
              targetName: poster || detailOpportunity?.clientCompany,
              requirementTitle: detailOpportunity?.title,
              requirementId: detailOpportunity?.id,
              clientProfileId: detailOpportunity?.clientProfileId
            });
          }}
          onStartChat={(clientName, title) => {
            setDetailOpportunity(null);
            onNavigate('messages', {
              targetName: clientName || detailOpportunity?.clientCompany,
              requirementTitle: title || detailOpportunity?.title,
              requirementId: detailOpportunity?.id,
              clientProfileId: detailOpportunity?.clientProfileId,
              initialMessage: `Hi ${clientName || 'there'}! I saw your brief "${title || detailOpportunity?.title}". Let's discuss details.`
            });
          }}
        />
      )}

      {/* Quick Application Modal */}
      {applyModalOpp && (
        <div className="modal-overlay" onClick={() => setApplyModalOpp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', padding: '24px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: '4px' }}>Submit Proposal</span>
                <h3 style={{ fontSize: '1.15rem' }}>{applyModalOpp.title}</h3>
              </div>
              <button onClick={() => setApplyModalOpp(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {appliedSuccess ? (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Proposal Submitted!</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>The client will review your submission and contact you directly via chat.</p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                <div className="grid-cols-2" style={{ gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Proposed Price (₹)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={proposedPrice} 
                      onChange={(e) => setProposedPrice(Number(e.target.value))}
                      required 
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Delivery (Days)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={estimatedDays} 
                      onChange={(e) => setEstimatedDays(Number(e.target.value))}
                      required 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Cover Note / Relevant Experience</label>
                  <textarea 
                    className="textarea-field" 
                    rows={4} 
                    placeholder="Briefly introduce yourself and how you plan to complete this task..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button type="button" onClick={() => setApplyModalOpp(null)} className="btn btn-secondary btn-sm">Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Send Proposal</button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
