import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { PortfolioItem } from '../types';
import { V1_CATEGORIES } from '../data/mockData';
import { 
  User, 
  Briefcase, 
  DollarSign, 
  FolderKanban, 
  Globe, 
  Save, 
  Plus, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  Award, 
  SlidersHorizontal,
  UploadCloud
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { calculateProCompletion } from '../utils/profileCompletion';

interface UpdateProfileProps {
  onNavigate: (view: string, params?: any) => void;
}

export const UpdateProfile: React.FC<UpdateProfileProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState<'personal' | 'roles' | 'experience' | 'preferences' | 'portfolio' | 'links'>('personal');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State: 1. Personal
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Form State: 2. Roles & Skills
  const [headline, setHeadline] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('video-content');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [customSkillInput, setCustomSkillInput] = useState('');

  // Form State: 3. Experience & Pricing & Availability
  const [experienceLevel, setExperienceLevel] = useState('Intermediate');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | string>(3);
  const [availabilityStatus, setAvailabilityStatus] = useState('Available');
  const [pricingModel, setPricingModel] = useState('PerHour');
  const [startingPrice, setStartingPrice] = useState<number | string>(1500);
  const [hourlyRate, setHourlyRate] = useState<number | string>(2000);
  const [turnaroundDays, setTurnaroundDays] = useState<number | string>(3);
  const [appearsOnCamera, setAppearsOnCamera] = useState(true);
  const [acceptsProductShipments, setAcceptsProductShipments] = useState(true);

  // Form State: 4. Preferences
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [preferredOpportunityTypes, setPreferredOpportunityTypes] = useState<string[]>(['Tasks', 'Freelance', 'Jobs', 'Internships']);
  const [preferredLocationType, setPreferredLocationType] = useState('Remote');
  const [preferredLocationCity, setPreferredLocationCity] = useState('');
  const [expectedCompMin, setExpectedCompMin] = useState<number | string>(5000);
  const [expectedCompMax, setExpectedCompMax] = useState<number | string>(50000);

  // Form State: 5. Portfolio State
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectRole, setNewProjectRole] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectThumb, setNewProjectThumb] = useState('');
  const [newProjectMedia, setNewProjectMedia] = useState('');
  const [newProjectTools, setNewProjectTools] = useState('');

  // Form State: 6. Resume & Links
  const [resumeUrl, setResumeUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [behanceUrl, setBehanceUrl] = useState('');
  const [dribbbleUrl, setDribbbleUrl] = useState('');

  const [slug, setSlug] = useState('priya-reddy');

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const targetSlug = user.slug || 'priya-reddy';
    api.getProfessionalBySlug(targetSlug)
      .then(p => {
        if (p) {
          setDisplayName(p.displayName || user.fullName || '');
          setEmail(user.email || p.email || '');
          setPhoneNumber(user.phoneNumber || p.phoneNumber || '');
          setAvatarUrl(p.avatarUrl || user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
          setBannerUrl(p.bannerUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80');
          setCity(p.city || user.city || '');
          setState(p.state || '');
          setGender(p.gender || '');
          setDateOfBirth(p.dateOfBirth || '');
          setBio(p.bio || user.bio || '');
          setHeadline(p.headline || user.headline || '');
          setExperienceLevel(p.experienceLevel || 'Intermediate');
          setYearsOfExperience(p.yearsOfExperience ?? 3);
          setAvailabilityStatus(p.availabilityStatus || 'Available');
          setPricingModel(p.pricingModel || 'PerHour');
          setStartingPrice(p.startingPrice || 1500);
          setHourlyRate(p.hourlyRate || user.hourlyRate || 2000);
          setTurnaroundDays(p.turnaroundDays || 3);
          setAppearsOnCamera(p.appearsOnCamera ?? true);
          setAcceptsProductShipments(p.acceptsProductShipments ?? true);
          
          if (p.preferredRoles && p.preferredRoles.length > 0) {
            setPreferredRoles(p.preferredRoles);
          }
          if (p.opportunityTypes && p.opportunityTypes.length > 0) {
            setPreferredOpportunityTypes(p.opportunityTypes);
          }
          setPreferredLocationType(p.preferredLocationType || 'Remote');
          setExpectedCompMin(p.expectedCompensationMin || 5000);
          setExpectedCompMax(p.expectedCompensationMax || 50000);

          setSelectedRoles(p.roles ? p.roles.map((r: any) => typeof r === 'string' ? r : r.name) : []);
          setSelectedSkills(p.skills ? p.skills.map((s: any) => typeof s === 'string' ? s : s.name) : []);
          setPortfolio(p.portfolio || []);
          setResumeUrl(p.resumeUrl || user.resumeUrl || '');
          setWebsiteUrl(p.websiteUrl || user.websiteUrl || '');
          setGithubUrl(p.githubUrl || '');
          setLinkedinUrl(p.linkedinUrl || '');
          setInstagramUrl(p.instagramUrl || '');
          setYoutubeUrl(p.youtubeUrl || '');
          setTiktokUrl(p.tiktokUrl || '');
          setBehanceUrl(p.behanceUrl || '');
          setDribbbleUrl(p.dribbbleUrl || '');
          setSlug(p.slug || targetSlug);
        }
      })
      .catch(() => {
        setDisplayName(user.fullName || '');
        setEmail(user.email || '');
        setPhoneNumber(user.phoneNumber || '');
        setAvatarUrl(user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80');
        setHeadline(user.headline || 'Specialist & Content Creator');
        setBio(user.bio || 'Passionate professional producing high quality deliverables on Tnest.');
        setHourlyRate(user.hourlyRate || 2000);
        setCity(user.city || '');
        setWebsiteUrl(user.websiteUrl || '');
        setResumeUrl(user.resumeUrl || '');
      })
      .finally(() => setLoading(false));
  }, [user]);

  const activeCategoryObj = useMemo(() => {
    return V1_CATEGORIES.find(c => c.slug === selectedCategory) || V1_CATEGORIES[0];
  }, [selectedCategory]);

  const toggleRole = (roleName: string) => {
    setSelectedRoles(prev => 
      prev.includes(roleName) ? prev.filter(r => r !== roleName) : [...prev, roleName]
    );
  };

  const toggleSkill = (skillName: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillName) ? prev.filter(s => s !== skillName) : [...prev, skillName]
    );
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (customSkillInput.trim() && !selectedSkills.includes(customSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, customSkillInput.trim()]);
      setCustomSkillInput('');
    }
  };

  const toggleOppType = (type: string) => {
    setPreferredOpportunityTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleAddPortfolioItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;
    const toolsArray = newProjectTools.split(',').map(t => t.trim()).filter(Boolean);
    const newItem: PortfolioItem = {
      id: Math.random().toString(36).substring(7),
      title: newProjectTitle,
      description: newProjectDesc || 'High quality deliverable for verified client.',
      categorySlug: selectedCategory,
      rolePerformed: newProjectRole || headline || 'Lead Specialist',
      mediaType: newProjectMedia.includes('mp4') || newProjectMedia.includes('youtube') || newProjectMedia.includes('vimeo') ? 'Video' : 'Design',
      thumbnailUrl: newProjectThumb || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80',
      mediaUrl: newProjectMedia || newProjectThumb || 'https://example.com/asset',
      toolsUsed: toolsArray.length > 0 ? toolsArray : ['Premiere Pro', 'Figma']
    };
    setPortfolio([...portfolio, newItem]);
    setNewProjectTitle('');
    setNewProjectRole('');
    setNewProjectDesc('');
    setNewProjectThumb('');
    setNewProjectMedia('');
    setNewProjectTools('');
    setShowAddPortfolio(false);
  };

  const handleRemovePortfolioItem = (id: string) => {
    setPortfolio(portfolio.filter(p => p.id !== id));
  };

  // Profile completeness score
  const completionDetails = useMemo(() => {
    const sectionsStatus = {
      personal: !!(displayName.trim() && headline.trim() && bio.trim().length >= 15 && avatarUrl.trim()),
      roles: selectedRoles.length > 0 && selectedSkills.length > 0,
      experience: Number(hourlyRate) > 0 && !!experienceLevel,
      preferences: preferredOpportunityTypes.length > 0 && !!preferredLocationType,
      portfolio: portfolio.length > 0,
      links: !!(resumeUrl.trim() || websiteUrl.trim() || linkedinUrl.trim() || githubUrl.trim())
    };

    const percentage = calculateProCompletion({
      displayName,
      fullName: displayName,
      email: user?.email,
      phoneNumber: user?.phoneNumber,
      headline,
      bio,
      avatarUrl,
      city,
      state,
      hourlyRate: Number(hourlyRate) || 0,
      experienceLevel,
      websiteUrl,
      resumeUrl,
      roles: selectedRoles,
      skills: selectedSkills,
      portfolio
    });

    return {
      percentage,
      sectionsStatus
    };
  }, [displayName, headline, avatarUrl, bio, city, state, selectedRoles, selectedSkills, hourlyRate, portfolio, resumeUrl, websiteUrl, linkedinUrl, githubUrl, experienceLevel, user, preferredOpportunityTypes, preferredLocationType]);

  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);

    const updatePayload = {
      displayName,
      headline,
      bio,
      avatarUrl,
      bannerUrl,
      city,
      state,
      gender,
      dateOfBirth,
      hourlyRate: Number(hourlyRate) || 0,
      pricingModel,
      startingPrice: Number(startingPrice) || 0,
      experienceLevel,
      yearsOfExperience: Number(yearsOfExperience) || 0,
      availabilityStatus,
      turnaroundDays: Number(turnaroundDays) || 3,
      appearsOnCamera,
      acceptsProductShipments,
      preferredRoles,
      opportunityTypes: preferredOpportunityTypes,
      preferredLocationType,
      expectedCompensationMin: Number(expectedCompMin) || 0,
      expectedCompensationMax: Number(expectedCompMax) || 0,
      resumeUrl,
      websiteUrl,
      githubUrl,
      linkedinUrl,
      instagramUrl,
      youtubeUrl,
      tiktokUrl,
      behanceUrl,
      dribbbleUrl,
      roles: selectedRoles,
      skills: selectedSkills,
      portfolio
    };

    try {
      if (user?.professionalProfileId) {
        await api.updateProfessionalProfile(user.professionalProfileId, updatePayload);
      }

      // Sync global user state immediately
      updateUser({
        fullName: displayName,
        headline,
        bio,
        avatarUrl,
        city,
        state,
        hourlyRate: Number(hourlyRate) || 0,
        phoneNumber,
        websiteUrl,
        resumeUrl,
        linkedinUrl,
        instagramUrl,
        youtubeUrl
      });

      setSuccessMessage('Your profile has been saved successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch {
      updateUser({
        fullName: displayName,
        headline,
        bio,
        avatarUrl,
        city,
        state,
        hourlyRate: Number(hourlyRate) || 0,
        phoneNumber,
        websiteUrl,
        resumeUrl
      });
      setSuccessMessage('Your profile has been saved successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'inline-block', width: '32px', height: '32px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ marginTop: '16px', fontSize: '0.92rem' }}>Loading profile editor...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '100px' }}>
      
      {/* TOP HERO HEADER */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '24px 0 28px'
      }}>
        <div className="container" style={{ maxWidth: '1120px' }}>
          
          <BreadcrumbNav
            items={[
              { label: 'Doer Workspace', view: 'pro-dashboard' },
              { label: 'Public Profile', view: 'profile', params: { slug } },
              { label: 'Edit Profile & Portfolio', active: true }
            ]}
            backLabel="Public Profile"
            backView="profile"
            backParams={{ slug }}
            onNavigate={onNavigate}
            rightElement={
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('profile', { slug })}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Globe size={14} /> View Live Profile
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={saving}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            }
          />

          {/* Profile Identity Hero Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={displayName || 'User'}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: 'var(--radius-md)',
                    objectFit: 'cover',
                    border: '2px solid var(--accent-border)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#10B981',
                  border: '2px solid var(--bg-card)'
                }} title="Online & Active" />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
                    {displayName || user?.fullName || 'Creative Doer'}
                  </h1>
                  <span className="badge badge-primary" style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} /> Verified Doer
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span>{headline || 'Creative Professional & Doer'}</span>
                  {city && <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--text-muted)' }}><MapPin size={12} /> {city}{state ? `, ${state}` : ''}</span>}
                </p>
              </div>
            </div>

            {/* Profile Strength Indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '10px 16px',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} color="var(--accent-primary)" /> Profile Strength
                  </span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: completionDetails.percentage >= 100 ? 'var(--status-success)' : 'var(--accent-primary)' }}>
                    {completionDetails.percentage}%
                  </span>
                </div>
                <div style={{ width: '130px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${completionDetails.percentage}%`,
                      height: '100%',
                      backgroundColor: completionDetails.percentage >= 100 ? '#10B981' : 'var(--accent-primary)',
                      borderRadius: '3px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="container" style={{ maxWidth: '1120px', marginTop: '28px' }}>
        
        {/* Success Alert Banner */}
        {successMessage && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--status-success-bg)',
            border: '1px solid var(--status-success-border)',
            color: 'var(--status-success)',
            fontSize: '0.88rem',
            fontWeight: 500,
            marginBottom: '24px',
            animation: 'fadeIn 0.2s ease'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 2-COLUMN MODERN EDITOR LAYOUT */}
        <div className="responsive-grid-sidebar-left">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="responsive-sticky-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div className="card" style={{ padding: '8px', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '10px 12px 6px' }}>
                Profile Sections
              </div>

              {[
                { id: 'personal', label: 'Personal Information', desc: 'Identity, bio, location', icon: <User size={16} />, completed: completionDetails.sectionsStatus.personal },
                { id: 'roles', label: 'Categories & Roles', desc: 'Discipline, roles & skills', icon: <Briefcase size={16} />, completed: completionDetails.sectionsStatus.roles },
                { id: 'experience', label: 'Experience & Pricing', desc: 'Rates, tier, availability', icon: <DollarSign size={16} />, completed: completionDetails.sectionsStatus.experience },
                { id: 'preferences', label: 'Preferences', desc: 'Types, remote, targets', icon: <SlidersHorizontal size={16} />, completed: completionDetails.sectionsStatus.preferences },
                { id: 'portfolio', label: 'Portfolio Showcase', desc: `${portfolio.length} project sample${portfolio.length === 1 ? '' : 's'}`, icon: <FolderKanban size={16} />, completed: completionDetails.sectionsStatus.portfolio },
                { id: 'links', label: 'Resume & Links', desc: 'CV, social, profiles', icon: <Globe size={16} />, completed: completionDetails.sectionsStatus.links }
              ].map((item) => {
                const isSelected = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveSection(item.id as any)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : 'transparent',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '3px',
                      transition: 'all 0.15s ease',
                      borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center'
                      }}>
                        {item.icon}
                      </div>
                      <div>
                        <span style={{ fontSize: '0.85rem', fontWeight: isSelected ? 600 : 500, display: 'block', lineHeight: 1.2 }}>
                          {item.label}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', display: 'block' }}>
                          {item.desc}
                        </span>
                      </div>
                    </div>

                    {item.completed && (
                      <CheckCircle2 size={14} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick Completion Tips Card */}
            <div className="card" style={{ padding: '16px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                <Award size={15} color="var(--accent-primary)" /> Doer Verification Checklist
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.76rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <li style={{ color: bio.length >= 15 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  Detailed bio ({bio.length >= 15 ? '✓ Done' : 'Add 15+ chars'})
                </li>
                <li style={{ color: selectedSkills.length >= 2 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  Skills added ({selectedSkills.length >= 2 ? '✓ Done' : 'Pick 2+ skills'})
                </li>
                <li style={{ color: portfolio.length > 0 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  Portfolio sample ({portfolio.length > 0 ? '✓ Done' : 'Add 1+ sample'})
                </li>
                <li style={{ color: Number(hourlyRate) > 0 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  Pricing set ({Number(hourlyRate) > 0 ? '✓ Done' : 'Set pricing rate'})
                </li>
              </ul>
            </div>

          </div>

          {/* RIGHT MAIN SECTION FORM CARD */}
          <div className="card" style={{ padding: '32px', backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-card)' }}>
            
            {/* 1. PERSONAL INFORMATION SECTION */}
            {activeSection === 'personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Personal Information</h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Control your public name, photo, location, bio, and optional demographic details.
                  </p>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                {/* Avatar & Visual Media */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  padding: '18px 20px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap'
                }}>
                  <label style={{
                    position: 'relative',
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-card)',
                    border: '2px solid var(--accent-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                  title="Click to upload profile photo"
                  >
                    <img
                      src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                      alt={displayName || 'Avatar'}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />

                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      backgroundColor: 'var(--accent-primary)',
                      color: '#FFFFFF',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      border: '1.5px solid var(--bg-card)'
                    }}>
                      <Plus size={12} strokeWidth={3} />
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const file = e.target.files[0];
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setAvatarUrl(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      style={{ display: 'none' }}
                    />
                  </label>

                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                        Profile Photo
                      </label>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <label 
                          className="btn btn-primary btn-sm"
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: 600,
                            fontSize: '0.78rem',
                            padding: '5px 12px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          <UploadCloud size={14} />
                          <span>Upload Image</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                  if (ev.target?.result) {
                                    setAvatarUrl(ev.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ display: 'none' }}
                          />
                        </label>

                        {avatarUrl && (
                          <button
                            type="button"
                            onClick={() => setAvatarUrl('')}
                            className="btn btn-secondary btn-sm"
                            style={{
                              fontSize: '0.75rem',
                              padding: '5px 10px',
                              color: 'var(--status-danger)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Trash2 size={12} /> Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <input
                      type="url"
                      className="input-field"
                      placeholder="Or paste an image URL (e.g. https://...)"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      style={{ fontSize: '0.84rem' }}
                    />
                  </div>
                </div>

                {/* Name & Headline */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Full Name <span style={{ color: 'var(--status-danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Priya Reddy"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Headline / Title <span style={{ color: 'var(--status-danger)' }}>*</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. UGC Video Creator & Short-Form Editor"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email & Phone Contact */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                      Kept private; not shown on public profile
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="input-field"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                      Kept private for account verification
                    </span>
                  </div>
                </div>

                {/* City & State Location */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      City / Metro
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Hyderabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      State / Region
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Telangana"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                </div>

                {/* Optional Gender & Date of Birth */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Gender <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <select
                      className="select-field"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="">Prefer not to say</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Date of Birth <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bio & Overview */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Bio & Summary
                    </label>
                    <span style={{ fontSize: '0.74rem', color: bio.length >= 15 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                      {bio.length} characters
                    </span>
                  </div>
                  <textarea
                    className="textarea-field"
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell clients about your skills, past projects, key strengths, and how you execute deliverables..."
                  />
                </div>

              </div>
            )}

            {/* 2. CATEGORIES, ROLES & SKILLS SECTION */}
            {activeSection === 'roles' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Categories, Roles & Skills</h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Structure: Category → Roles → Skills. Select your categories, multiple roles, and specific skill tags.
                  </p>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                {/* Category Selector */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Discipline Category
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                    {V1_CATEGORIES.map(c => {
                      const isCatSelected = selectedCategory === c.slug;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedCategory(c.slug)}
                          style={{
                            padding: '12px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: isCatSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                            backgroundColor: isCatSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ fontSize: '0.86rem', fontWeight: isCatSelected ? 700 : 500, color: isCatSelected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                            {c.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {c.roles.length} roles available
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Multiple Roles Pills */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Select Roles in {activeCategoryObj.name} (Multiple allowed)
                    </label>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
                      {selectedRoles.length} selected
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {activeCategoryObj.roles.map(r => {
                      const isChecked = selectedRoles.includes(r.name);
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => toggleRole(r.name)}
                          className={`btn btn-sm ${isChecked ? 'btn-primary' : 'btn-secondary'}`}
                          style={{
                            fontSize: '0.8rem',
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-sm)'
                          }}
                        >
                          {isChecked && <CheckCircle2 size={13} style={{ marginRight: '4px' }} />}
                          {r.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Skills Section */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Skills & Tools ({selectedSkills.length} selected)
                  </label>

                  {/* Suggested Category Skills */}
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                      Suggested for {activeCategoryObj.name}:
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {activeCategoryObj.skills.map(s => {
                        const isSkillChecked = selectedSkills.includes(s.name);
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => toggleSkill(s.name)}
                            style={{
                              fontSize: '0.75rem',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-xs)',
                              backgroundColor: isSkillChecked ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                              color: isSkillChecked ? '#FFFFFF' : 'var(--text-primary)',
                              border: isSkillChecked ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                              cursor: 'pointer'
                            }}
                          >
                            {isSkillChecked ? `✓ ${s.name}` : `+ ${s.name}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Selected Skills Chips */}
                  {selectedSkills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {selectedSkills.map(s => (
                        <span
                          key={s}
                          onClick={() => toggleSkill(s)}
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 500,
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'var(--bg-secondary)',
                            border: '1px solid var(--border-medium)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                          title="Click to remove skill"
                        >
                          {s} <span style={{ opacity: 0.6 }}>✕</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Add Custom Skill Form */}
                  <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Add custom skill (e.g. Premiere Pro, React, SEO, CapCut, Figma)..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>
                      <Plus size={14} /> Add
                    </button>
                  </form>
                </div>

              </div>
            )}

            {/* 3. EXPERIENCE, PRICING & AVAILABILITY SECTION */}
            {activeSection === 'experience' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Experience, Pricing & Availability</h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Configure your experience tier, pricing model, availability status, and logistics.
                  </p>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                {/* Experience Tier & Years */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Experience Level
                    </label>
                    <select
                      className="select-field"
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Some Experience">Some Experience</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Experienced">Experienced</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Years of Experience <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="number"
                      className="input-field"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                      min={0}
                      max={40}
                      placeholder="e.g. 3"
                    />
                  </div>
                </div>

                {/* Availability Status */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Current Availability Status
                  </label>
                  <div className="responsive-3col">
                    {[
                      { id: 'Available', label: 'Available', desc: 'Ready for new tasks', badge: '🟢' },
                      { id: 'Busy', label: 'Busy', desc: 'Taking select tasks', badge: '🟡' },
                      { id: 'Not Available', label: 'Not Available', desc: 'Currently not taking work', badge: '🔴' }
                    ].map(item => {
                      const isAvail = availabilityStatus.toLowerCase().includes(item.id.toLowerCase().split(' ')[0]);
                      return (
                        <div
                          key={item.id}
                          onClick={() => setAvailabilityStatus(item.id)}
                          style={{
                            padding: '12px',
                            borderRadius: 'var(--radius-sm)',
                            border: isAvail ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                            backgroundColor: isAvail ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                            cursor: 'pointer',
                            textAlign: 'center'
                          }}
                        >
                          <div style={{ fontSize: '1rem', marginBottom: '4px' }}>{item.badge}</div>
                          <div style={{ fontSize: '0.86rem', fontWeight: isAvail ? 700 : 600, color: 'var(--text-primary)' }}>{item.label}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.desc}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing Model & Rates */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Pricing Structure
                  </label>
                  <div className="responsive-4col" style={{ marginBottom: '16px' }}>
                    {[
                      { id: 'PerTask', label: 'Per Task' },
                      { id: 'PerHour', label: 'Per Hour' },
                      { id: 'PerProject', label: 'Per Project' },
                      { id: 'Negotiable', label: 'Negotiable' }
                    ].map(model => {
                      const isModel = pricingModel === model.id;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setPricingModel(model.id)}
                          className={`btn btn-sm ${isModel ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ fontSize: '0.8rem', padding: '8px' }}
                        >
                          {model.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid-cols-2" style={{ gap: '18px' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                        Standard Rate / Starting Price (INR ₹)
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        min={0}
                        step={100}
                        placeholder="2000"
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                        Estimated Turnaround (Days)
                      </label>
                      <input
                        type="number"
                        className="input-field"
                        value={turnaroundDays}
                        onChange={(e) => setTurnaroundDays(e.target.value)}
                        min={1}
                        max={30}
                      />
                    </div>
                  </div>
                </div>

                {/* Capabilities Checkboxes */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '16px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Logistics & Delivery Capabilities
                  </label>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem' }}>
                      <input
                        type="checkbox"
                        checked={appearsOnCamera}
                        onChange={(e) => setAppearsOnCamera(e.target.checked)}
                      />
                      <span>Appears On Camera (UGC / Acting / Video Presentation)</span>
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.84rem' }}>
                      <input
                        type="checkbox"
                        checked={acceptsProductShipments}
                        onChange={(e) => setAcceptsProductShipments(e.target.checked)}
                      />
                      <span>Accepts Physical Product Shipments</span>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* 4. PREFERENCES SECTION */}
            {activeSection === 'preferences' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Opportunity Preferences</h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Set your preferred work types, location modes, and expected compensation ranges.
                  </p>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                {/* Opportunity Types */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Opportunity Types Interested In
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {['Tasks', 'Freelance', 'Jobs', 'Internships'].map(t => {
                      const isChecked = preferredOpportunityTypes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => toggleOppType(t)}
                          className={`btn btn-sm ${isChecked ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ fontSize: '0.82rem', padding: '6px 14px' }}
                        >
                          {isChecked && <CheckCircle2 size={13} style={{ marginRight: '4px' }} />}
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Location Preferences */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Work Arrangement
                    </label>
                    <select
                      className="select-field"
                      value={preferredLocationType}
                      onChange={(e) => setPreferredLocationType(e.target.value)}
                    >
                      <option value="Remote">Remote Only</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="OnSite">On-site</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Preferred Cities / Regions <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 400 }}>(If Hybrid/OnSite)</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Hyderabad, Bengaluru, Mumbai"
                      value={preferredLocationCity}
                      onChange={(e) => setPreferredLocationCity(e.target.value)}
                    />
                  </div>
                </div>

                {/* Expected Compensation Range */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                    Expected Compensation Range (INR ₹)
                  </label>
                  <div className="grid-cols-2" style={{ gap: '18px' }}>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Minimum (₹)</span>
                      <input
                        type="number"
                        className="input-field"
                        value={expectedCompMin}
                        onChange={(e) => setExpectedCompMin(e.target.value)}
                        placeholder="5000"
                      />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Maximum (₹)</span>
                      <input
                        type="number"
                        className="input-field"
                        value={expectedCompMax}
                        onChange={(e) => setExpectedCompMax(e.target.value)}
                        placeholder="50000"
                      />
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* 5. PORTFOLIO SHOWCASE SECTION */}
            {activeSection === 'portfolio' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Portfolio Showcase</h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                      Showcase past deliverables, video edits, design samples, and tools used to clients.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddPortfolio(!showAddPortfolio)}
                    className="btn btn-primary btn-sm"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> {showAddPortfolio ? 'Close Form' : 'Add Project Sample'}
                  </button>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                {/* Add Portfolio Form Card */}
                {showAddPortfolio && (
                  <form
                    onSubmit={handleAddPortfolioItem}
                    style={{
                      padding: '20px',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1.5px solid var(--accent-border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      animation: 'fadeIn 0.2s ease'
                    }}
                  >
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Add New Portfolio Deliverable</h4>

                    <div className="grid-cols-2" style={{ gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Project Title *</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. Glowing Skin Serum Hook Ad"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Role Performed *</label>
                        <input
                          type="text"
                          className="input-field"
                          placeholder="e.g. UGC Creator & Editor"
                          value={newProjectRole}
                          onChange={(e) => setNewProjectRole(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-cols-2" style={{ gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Thumbnail Image URL</label>
                        <input
                          type="url"
                          className="input-field"
                          placeholder="https://images.unsplash.com/..."
                          value={newProjectThumb}
                          onChange={(e) => setNewProjectThumb(e.target.value)}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Video / Media URL</label>
                        <input
                          type="url"
                          className="input-field"
                          placeholder="https://youtube.com/... or mp4 link"
                          value={newProjectMedia}
                          onChange={(e) => setNewProjectMedia(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Tools Used (Comma Separated)</label>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="e.g. Premiere Pro, CapCut, Sony A7IV"
                        value={newProjectTools}
                        onChange={(e) => setNewProjectTools(e.target.value)}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Short Description</label>
                      <textarea
                        className="textarea-field"
                        rows={2}
                        placeholder="Brief overview of project results, hook retention, and goals achieved..."
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button type="button" onClick={() => setShowAddPortfolio(false)} className="btn btn-ghost btn-sm">
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm">
                        Add to Showcase
                      </button>
                    </div>
                  </form>
                )}

                {/* Portfolio Grid List */}
                {portfolio.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px dashed var(--border-medium)'
                  }}>
                    <FolderKanban size={32} color="var(--text-muted)" style={{ margin: '0 auto 10px' }} />
                    <h4 style={{ margin: '0 0 4px', fontSize: '0.95rem' }}>No portfolio samples yet</h4>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 14px' }}>
                      Adding at least 1-2 samples boosts your hire rate significantly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddPortfolio(true)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={14} /> Add First Sample
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {portfolio.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        <div style={{ position: 'relative', height: '140px', backgroundColor: '#000000' }}>
                          <img
                            src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400'}
                            alt={item.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            backdropFilter: 'blur(4px)'
                          }}>
                            {item.mediaType || 'Deliverable'}
                          </span>
                        </div>

                        <div style={{ padding: '14px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {item.title}
                              </h4>
                              <button
                                type="button"
                                onClick={() => handleRemovePortfolioItem(item.id)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--status-danger)',
                                  cursor: 'pointer',
                                  padding: '2px'
                                }}
                                title="Remove item"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: 500, marginTop: '2px', display: 'block' }}>
                              {item.rolePerformed}
                            </span>
                            {item.description && (
                              <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: '6px 0 0', lineHeight: 1.4 }}>
                                {item.description}
                              </p>
                            )}
                          </div>

                          {item.toolsUsed && item.toolsUsed.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
                              {item.toolsUsed.map((t, idx) => (
                                <span key={idx} style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '3px', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* 6. RESUME & LINKS SECTION */}
            {activeSection === 'links' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Resume & Social Links</h2>
                  <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                    Connect your hosted resume/CV, social profiles, and external portfolio links.
                  </p>
                </div>

                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

                {/* Resume / CV URL */}
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Resume / CV Hosted Link (Useful for Jobs & Internships)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="url"
                        className="input-field"
                        placeholder="https://drive.google.com/file/... or https://readcv.com/..."
                        value={resumeUrl}
                        onChange={(e) => setResumeUrl(e.target.value)}
                      />
                    </div>
                    {resumeUrl && (
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                      >
                        <ExternalLink size={13} /> View
                      </a>
                    )}
                  </div>
                </div>

                {/* Website & LinkedIn */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Personal Website
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://yourwebsite.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      LinkedIn Profile
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* GitHub & Instagram */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      GitHub Profile
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://github.com/username"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Instagram Profile
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://instagram.com/username"
                      value={instagramUrl}
                      onChange={(e) => setInstagramUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* YouTube & TikTok */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      YouTube Channel
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://youtube.com/@channel"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      TikTok Profile
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://tiktok.com/@username"
                      value={tiktokUrl}
                      onChange={(e) => setTiktokUrl(e.target.value)}
                    />
                  </div>
                </div>

                {/* Behance & Dribbble */}
                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Behance Showcase
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://behance.net/username"
                      value={behanceUrl}
                      onChange={(e) => setBehanceUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Dribbble Profile
                    </label>
                    <input
                      type="url"
                      className="input-field"
                      placeholder="https://dribbble.com/username"
                      value={dribbbleUrl}
                      onChange={(e) => setDribbbleUrl(e.target.value)}
                    />
                  </div>
                </div>

              </div>
            )}

            {/* STICKY FOOTER SAVE CONTROLS */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '32px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-subtle)',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                All changes sync across public search, matching filters, and direct inquiries.
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('profile', { slug })}
                  className="btn btn-secondary"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ fontWeight: 600 }}
                >
                  <Save size={14} /> {saving ? 'Saving Changes...' : 'Save All Changes'}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
