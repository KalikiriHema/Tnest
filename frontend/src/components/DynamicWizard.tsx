import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { V1_CATEGORIES } from '../data/mockData';
import { OpportunityType, LocationType } from '../types';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Clock, 
  DollarSign, 
  Briefcase, 
  CheckCircle2,
  Users,
  MapPin,
  FileText,
  Plus,
  Trash2,
  UploadCloud,
  Layers,
  Sparkles,
  Building2,
  Link2,
  Calendar,
  Truck,
  Award,
  ExternalLink,
  ShieldCheck,
  Edit2
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';

interface DynamicWizardProps {
  onRequirementCreated: (reqId: string) => void;
  onOpenAuth: () => void;
  onNavigate?: (view: string, params?: any) => void;
}

interface CategoryPreset {
  title: string;
  description: string;
  responsibilities: string[];
  skills: string[];
  experienceLevel: string;
  budgetMin: number;
  budgetMax: number;
  compensationType: 'Fixed' | 'Hourly' | 'Monthly';
  expectedDeliveryDays: number;
  requiresProductShipment?: boolean;
}

const CATEGORY_PRESETS: Record<string, CategoryPreset> = {
  'design': {
    title: 'High-CTR YouTube Thumbnails & Brand Identity Assets',
    description: 'Looking for a skilled graphic / thumbnail designer to craft high-converting, eye-catching YouTube thumbnails and brand graphic assets in Figma & Photoshop.',
    responsibilities: [
      '5 High-CTR YouTube Thumbnails (1920x1080 PSD / PNG)',
      'Editable Figma source components & brand style guide',
      'Social media banner templates & font pairing guide'
    ],
    skills: ['Figma', 'Photoshop', 'Illustrator', 'Visual Design'],
    experienceLevel: 'Intermediate',
    budgetMin: 5000,
    budgetMax: 10000,
    compensationType: 'Fixed',
    expectedDeliveryDays: 4,
    requiresProductShipment: false
  },
  'marketing-advertising': {
    title: 'Performance Marketing & Meta Ad Campaigns Setup',
    description: 'Need a performance marketing specialist to manage and optimize Meta (Facebook/Instagram) and Google Ads with target ROAS > 3.5x, custom audiences, and conversion tracking.',
    responsibilities: [
      'Full Meta & Google Ads campaign audit & structure setup',
      'Audience research, pixel & conversion API verification',
      'Weekly performance analytics report & ROAS optimization'
    ],
    skills: ['Meta Ads Manager', 'Google Analytics 4', 'Direct Response Copy', 'ROAS Optimization'],
    experienceLevel: 'Expert / Senior',
    budgetMin: 15000,
    budgetMax: 30000,
    compensationType: 'Monthly',
    expectedDeliveryDays: 30,
    requiresProductShipment: false
  },
  'writing-content': {
    title: 'High-Retention Video Scriptwriting & SEO Content',
    description: 'Seeking an engaging content and script writer to craft 3 storytelling YouTube video scripts (8-10 mins) with strong retention hooks and call-to-actions.',
    responsibilities: [
      '3 Complete Video Scripts with visual cues & hook variations',
      'SEO keyword research summary & optimized video descriptions',
      'Thumbnail title suggestions and hook A/B ideas'
    ],
    skills: ['Script Writing', 'Storyboarding', 'SEO Writing', 'Copywriting'],
    experienceLevel: 'Intermediate',
    budgetMin: 6000,
    budgetMax: 12000,
    compensationType: 'Fixed',
    expectedDeliveryDays: 6,
    requiresProductShipment: false
  },
  'music-audio': {
    title: 'Podcast Audio Mastering & Professional Voiceover',
    description: 'Seeking an experienced audio engineer to edit, denoise, EQ, and master 4 podcast episodes to broadcast loudness standards (-16 LUFS) with intro/outro music mix.',
    responsibilities: [
      '4 Mastered Podcast Audio files (WAV / MP3 at -16 LUFS)',
      'Cleaned dialogue tracks with filler word & noise removal',
      'Stem tracks and project session files'
    ],
    skills: ['Pro Tools', 'Audacity', 'Sound Design', 'Audio Mastering'],
    experienceLevel: 'Intermediate',
    budgetMin: 5000,
    budgetMax: 12000,
    compensationType: 'Fixed',
    expectedDeliveryDays: 5,
    requiresProductShipment: false
  },
  'photography': {
    title: 'Studio E-Commerce Product Photography & Retouching',
    description: 'Looking for a professional product photographer to capture 10 high-resolution studio shots of our new physical product line on clean white & lifestyle backgrounds.',
    responsibilities: [
      '10 High-Resolution Retouched Studio Product Photos (TIFF / JPEG)',
      'Transparent PNG cutouts for e-commerce website listings',
      '3 Lifestyle flat-lay compositions'
    ],
    skills: ['Studio Lighting', 'Product Photography', 'Adobe Lightroom', 'Photoshop'],
    experienceLevel: 'Intermediate',
    budgetMin: 10000,
    budgetMax: 20000,
    compensationType: 'Fixed',
    expectedDeliveryDays: 8,
    requiresProductShipment: true
  },
  'video-content': {
    title: 'High-Retention Reels & Shorts Video Editor for Brand',
    description: 'Seeking an experienced video editor to cut 5 fast-paced reels from raw footage with animated kinetic typography, sound effects, and color grading.',
    responsibilities: [
      '5 Vertical 9:16 Reels/Shorts with animated captions',
      'Color graded DaVinci / Premiere project file',
      'Royalty-free background music and SFX mix'
    ],
    skills: ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'CapCut Pro'],
    experienceLevel: 'Intermediate',
    budgetMin: 12000,
    budgetMax: 20000,
    compensationType: 'Fixed',
    expectedDeliveryDays: 4,
    requiresProductShipment: false
  },
  'ugc-creators': {
    title: 'Authentic UGC Unboxing & Routine Videos for D2C Brand',
    description: 'Looking for a charismatic creator to record 3 relatable vertical unboxing and routine demo reels. Product kit will be shipped to your location.',
    responsibilities: [
      '3 High-Resolution (4K) Raw UGC Creator Videos',
      '3 Hook variations for A/B ad testing',
      'Full commercial organic and paid usage rights'
    ],
    skills: ['Hook Scripting', 'Unboxing & Demo', 'On-Camera Acting', 'Relatable Delivery'],
    experienceLevel: 'Entry Level',
    budgetMin: 15000,
    budgetMax: 25000,
    compensationType: 'Fixed',
    expectedDeliveryDays: 7,
    requiresProductShipment: true
  },
  'technology': {
    title: 'Full Stack Development - Web Application & APIs',
    description: 'End-to-end development of a web application from frontend (React) to backend (.NET / Node.js) with database integration, responsive UI, and secure API endpoints.',
    responsibilities: [
      'Complete React / TypeScript + Backend Source Code Repository',
      'Database migration scripts and API endpoints documentation',
      'Docker Compose deployment configuration'
    ],
    skills: ['React', 'TypeScript', 'C# / .NET', 'Node.js', 'PostgreSQL', 'REST APIs'],
    experienceLevel: 'Expert / Senior',
    budgetMin: 20000,
    budgetMax: 45000,
    compensationType: 'Fixed',
    expectedDeliveryDays: 14,
    requiresProductShipment: false
  },
  'other': {
    title: 'Specialized Project Assistance & Operations Support',
    description: 'Need dedicated assistance for specialized operational execution and domain-specific project requirements.',
    responsibilities: [
      'Execution of agreed operational deliverables',
      'Documentation and progress summaries',
      'Final milestone handover and assets'
    ],
    skills: ['Operations', 'Communication', 'Project Management'],
    experienceLevel: 'Intermediate',
    budgetMin: 5000,
    budgetMax: 15000,
    compensationType: 'Fixed',
    expectedDeliveryDays: 7,
    requiresProductShipment: false
  }
};

export const DynamicWizard: React.FC<DynamicWizardProps> = ({ onRequirementCreated, onOpenAuth, onNavigate }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // STEP 1: Opportunity Type, Category & Multiple Roles
  const [mainOpportunityType, setMainOpportunityType] = useState<'Task' | 'Freelance' | 'Job'>('Task');
  const [jobSubType, setJobSubType] = useState<'Full-time' | 'Part-time' | 'Contract' | 'Internship'>('Full-time');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('technology');
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['Full Stack Developer']);

  // STEP 2: Title, Description, Responsibilities, Skills, Experience, Attachments & Links
  const [title, setTitle] = useState(CATEGORY_PRESETS['technology'].title);
  const [description, setDescription] = useState(CATEGORY_PRESETS['technology'].description);
  const [responsibilities, setResponsibilities] = useState<string[]>(CATEGORY_PRESETS['technology'].responsibilities);
  const [newResponsibilityInput, setNewResponsibilityInput] = useState('');
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>(CATEGORY_PRESETS['technology'].skills);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<string>(CATEGORY_PRESETS['technology'].experienceLevel);
  
  // Reference Links & Attachments
  const [referenceLinks, setReferenceLinks] = useState<Array<{ label: string; url: string }>>([
    { label: 'Reference Guidelines / Moodboard', url: 'https://figma.com/@reference' }
  ]);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [attachments, setAttachments] = useState<Array<{ name: string; size: string }>>([]);

  // STEP 3: Compensation, Budget, Start Date, Deadline, Vacancies & Location
  const [compensationType, setCompensationType] = useState<'Fixed' | 'Hourly' | 'Monthly'>('Fixed');
  const [budgetMin, setBudgetMin] = useState(CATEGORY_PRESETS['technology'].budgetMin);
  const [budgetMax, setBudgetMax] = useState(CATEGORY_PRESETS['technology'].budgetMax);
  
  const [startDateType, setStartDateType] = useState<'Immediate' | 'SpecificDate'>('Immediate');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDays, setExpectedDeliveryDays] = useState(CATEGORY_PRESETS['technology'].expectedDeliveryDays);
  const [vacanciesCount, setVacanciesCount] = useState(1);
  
  const [locationType, setLocationType] = useState<LocationType>('Remote');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');
  const [requiresProductShipment, setRequiresProductShipment] = useState(false);

  // STEP 4: Review Agreement Checkbox
  const [agreedGuidelines, setAgreedGuidelines] = useState(true);

  const currentCategory = V1_CATEGORIES.find((c) => c.slug === selectedCategorySlug) || V1_CATEGORIES[0];

  const handleCategorySelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    const cat = V1_CATEGORIES.find((c) => c.slug === slug);
    const firstRole = cat && cat.roles && cat.roles.length > 0 ? cat.roles[0].name : 'General Specialist';
    setSelectedRoles([firstRole]);
    
    // Apply category preset
    const preset = CATEGORY_PRESETS[slug] || CATEGORY_PRESETS['other'];
    setTitle(preset.title);
    setDescription(preset.description);
    setResponsibilities([...preset.responsibilities]);
    setSelectedSkills(cat && cat.skills && cat.skills.length > 0 ? cat.skills.map((s) => s.name) : [...preset.skills]);
    setExperienceLevel(preset.experienceLevel);
    setBudgetMin(preset.budgetMin);
    setBudgetMax(preset.budgetMax);
    setCompensationType(preset.compensationType);
    setExpectedDeliveryDays(preset.expectedDeliveryDays);
    setRequiresProductShipment(Boolean(preset.requiresProductShipment));
  };

  const handleToggleRole = (roleName: string) => {
    if (selectedRoles.includes(roleName)) {
      if (selectedRoles.length > 1) {
        setSelectedRoles(selectedRoles.filter((r) => r !== roleName));
      }
    } else {
      setSelectedRoles([...selectedRoles, roleName]);
    }
  };

  const handleAddResponsibility = (e: React.FormEvent) => {
    e.preventDefault();
    if (newResponsibilityInput.trim()) {
      setResponsibilities([...responsibilities, newResponsibilityInput.trim()]);
      setNewResponsibilityInput('');
    }
  };

  const handleRemoveResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const handleToggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillInput.trim() && !selectedSkills.includes(newSkillInput.trim())) {
      setSelectedSkills([...selectedSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleAddReferenceLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLinkUrl.trim()) {
      setReferenceLinks([
        ...referenceLinks,
        {
          label: newLinkLabel.trim() || 'Reference Link',
          url: newLinkUrl.trim().startsWith('http') ? newLinkUrl.trim() : `https://${newLinkUrl.trim()}`
        }
      ]);
      setNewLinkLabel('');
      setNewLinkUrl('');
    }
  };

  const handleRemoveReferenceLink = (index: number) => {
    setReferenceLinks(referenceLinks.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`
      }));
      setAttachments([...attachments, ...files]);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const effectiveOpportunityType: OpportunityType = 
    mainOpportunityType === 'Job' 
      ? (jobSubType === 'Internship' ? 'Internship' : 'Job') 
      : mainOpportunityType;

  const handleSubmitRequirement = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    setLoading(true);
    try {
      const clientProfileId = user?.clientProfileId || user?.id || '00000000-0000-0000-0000-000000000000';
      const fullLocationString = locationType === 'Remote' ? 'Remote' : `${city}${stateName ? `, ${stateName}` : ''}`;

      const dynamicAttributes = {
        opportunityTypeCategory: mainOpportunityType,
        jobSubType: mainOpportunityType === 'Job' ? jobSubType : null,
        rolesNeeded: selectedRoles,
        responsibilities,
        selectedSkills,
        experienceLevel,
        compensationType,
        startDateType,
        startDate: startDateType === 'Immediate' ? 'Immediate' : startDate,
        vacanciesCount,
        locationType,
        city,
        state: stateName,
        referenceLinks,
        attachmentsCount: attachments.length
      };

      const payload = {
        clientProfileId,
        categoryId: currentCategory.id,
        categorySlug: currentCategory.slug,
        title,
        description,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax || budgetMin),
        currency: 'INR',
        expectedDeliveryDays: Number(expectedDeliveryDays),
        requiresProductShipment,
        requiresOnCamera: currentCategory.slug === 'ugc-creators' || currentCategory.slug === 'photography',
        dynamicAttributes,
        isPublicListing: true
      };

      const res = await api.createRequirement(payload);
      if (res && res.id) {
        onRequirementCreated(res.id);
      } else {
        onRequirementCreated('req-created-success');
      }
    } catch (err: any) {
      console.warn('API error during creation, redirecting safely:', err);
      onRequirementCreated('demo-req-created');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '32px 24px 80px', maxWidth: '860px' }}>
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNav
        items={[
          { label: 'Post Opportunity', active: step === 1, onClick: step > 1 ? () => setStep(1) : undefined },
          ...(step > 1 ? [{ 
            label: step === 2 ? 'Details & Scope' : step === 3 ? 'Budget & Logistics' : 'Review & Publish', 
            active: true 
          }] : [])
        ]}
        backLabel={step > 1 ? 'Previous Step' : 'Back to Workspace'}
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
        onNavigate={onNavigate || (() => {})}
      />

      {/* Page Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.15rem', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Post a Task or Opportunity
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Define the role, requirements, budget, and timeline in 4 simple guided steps.
        </p>
      </div>

      {/* 4-Step Visual Flow Progress Bar */}
      <div className="responsive-4col" style={{ marginBottom: '32px' }}>
        {[
          { num: 1, label: '1. Type & Roles' },
          { num: 2, label: '2. Scope & Skills' },
          { num: 3, label: '3. Budget & Terms' },
          { num: 4, label: '4. Live Review' }
        ].map((s) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div 
              key={s.num}
              onClick={() => { if (step > s.num) setStep(s.num); }}
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'var(--accent-subtle)' : isDone ? 'var(--status-success-bg)' : 'var(--bg-secondary)',
                border: '1px solid',
                borderColor: isActive ? 'var(--accent-border)' : isDone ? 'var(--status-success-border)' : 'var(--border-subtle)',
                cursor: isDone ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                backgroundColor: isActive ? 'var(--accent-primary)' : isDone ? 'var(--status-success)' : 'var(--border-medium)',
                color: '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {isDone ? <Check size={13} /> : s.num}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: Opportunity Type → Category → Multiple Roles                     */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Step 1 of 4</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Opportunity Type & Category</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Specify the engagement format, domain discipline, and the specific specialist roles you need.
            </p>
          </div>

          {/* 1. Main Opportunity Type */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
              1. What type of opportunity is this?
            </label>
            <div className="responsive-3col" style={{ gap: '12px' }}>
              {[
                { type: 'Task' as const, label: 'Task / Gig', desc: 'Short-term deliverable with clear scope' },
                { type: 'Freelance' as const, label: 'Freelance Project', desc: 'Milestone-based contract or recurring work' },
                { type: 'Job' as const, label: 'Job Opening', desc: 'Full-time, Part-time, Contract, or Internship' }
              ].map((item) => {
                const isSelected = mainOpportunityType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setMainOpportunityType(item.type)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      border: '2px solid',
                      borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>{item.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* If Job is selected: show Sub-type pill selector */}
            {mainOpportunityType === 'Job' && (
              <div style={{ marginTop: '14px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                  Select Employment Sub-Type:
                </span>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(['Full-time', 'Part-time', 'Contract', 'Internship'] as const).map((sub) => (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => setJobSubType(sub)}
                      className={`btn btn-sm ${jobSubType === sub ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontWeight: jobSubType === sub ? 700 : 500 }}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Category Selection (9 categories) */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
              2. Select Discipline / Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
              {V1_CATEGORIES.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{cat.name}</span>
                    {isSelected && <Check size={14} color="var(--accent-primary)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Multiple Roles Selection */}
          {currentCategory && currentCategory.roles && currentCategory.roles.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  3. Select Role(s) in {currentCategory.name}
                </label>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  (Select one or multiple roles)
                </span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentCategory.roles.map((r) => {
                  const isSelected = selectedRoles.includes(r.name);
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleToggleRole(r.name)}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid',
                        borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                        color: isSelected ? '#FFFFFF' : 'var(--text-primary)',
                        fontSize: '0.84rem',
                        fontWeight: isSelected ? 700 : 500,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{r.name}</span>
                      {isSelected && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setStep(2)}
              className="btn btn-primary"
              style={{ padding: '0 24px', height: '42px', fontWeight: 700 }}
            >
              Next: Scope & Skills <ArrowRight size={15} />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: Title, Description, Responsibilities, Skills, Experience, Links   */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Step 2 of 4</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Title, Description & Scope</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Give clear details about the work, key responsibilities, required skills, and reference materials.
            </p>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Opportunity Title *
            </label>
            <input 
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. High-Retention Reels Video Editor for D2C Brand"
              required
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Detailed Description *
            </label>
            <textarea 
              className="textarea-field"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be done, brand background, and what great work looks like..."
              required
            />
          </div>

          {/* Responsibilities & Deliverables */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Key Responsibilities & Deliverables
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {responsibilities.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', fontSize: '0.88rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={15} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveResponsibility(idx)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: '2px' }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddResponsibility} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Add a responsibility / deliverable item..." 
                value={newResponsibilityInput} 
                onChange={(e) => setNewResponsibilityInput(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ flexShrink: 0, padding: '0 16px' }}>
                <Plus size={14} /> Add Item
              </button>
            </form>
          </div>

          {/* Required Skills */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
              Required Skills
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
              {selectedSkills.map((s) => (
                <span 
                  key={s} 
                  onClick={() => handleToggleSkill(s)}
                  style={{ 
                    fontSize: '0.8rem', 
                    padding: '4px 10px', 
                    borderRadius: 'var(--radius-xs)', 
                    backgroundColor: 'var(--accent-subtle)', 
                    border: '1px solid var(--accent-border)', 
                    color: 'var(--accent-primary)', 
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {s} ✕
                </span>
              ))}
            </div>

            <form onSubmit={handleAddCustomSkill} style={{ display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Add custom skill (e.g. Next.js, Figma, CapCut, Adobe Premiere)..." 
                value={newSkillInput} 
                onChange={(e) => setNewSkillInput(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ flexShrink: 0, padding: '0 16px' }}>
                <Plus size={14} /> Add Skill
              </button>
            </form>
          </div>

          {/* Experience Level */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
              Required Experience Level
            </label>
            <div className="responsive-3col" style={{ gap: '10px' }}>
              {['Entry Level', 'Intermediate', 'Expert / Senior'].map((lvl) => {
                const isSelected = experienceLevel === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setExperienceLevel(lvl)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.86rem', padding: '10px' }}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reference Links & Attachments */}
          <div style={{ marginBottom: '28px', padding: '18px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--text-primary)' }}>
              <Link2 size={16} color="var(--accent-primary)" /> Reference Links & Attachments
            </label>

            {/* Reference Links list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
              {referenceLinks.map((link, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', fontSize: '0.84rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <ExternalLink size={13} color="var(--accent-primary)" />
                    <strong>{link.label}:</strong>
                    <span style={{ color: 'var(--accent-primary)', textDecoration: 'underline', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.url}</span>
                  </div>
                  <button type="button" onClick={() => handleRemoveReferenceLink(idx)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Link Form */}
            <form onSubmit={handleAddReferenceLink} style={{ display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: '8px', marginBottom: '16px' }}>
              <input 
                type="text"
                className="input-field"
                placeholder="Label (e.g. Moodboard)"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
              />
              <input 
                type="text"
                className="input-field"
                placeholder="URL (e.g. figma.com/... or drive.google.com/...)"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ padding: '0 14px' }}>
                <Plus size={13} /> Add Link
              </button>
            </form>

            {/* Attachments Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>Files / Brief Documents</span>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', padding: '4px 12px', fontSize: '0.76rem' }}>
                  <UploadCloud size={13} /> Upload File
                  <input type="file" onChange={handleFileUpload} multiple style={{ display: 'none' }} />
                </label>
              </div>

              {attachments.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {attachments.map((att, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                      <FileText size={12} color="var(--accent-primary)" />
                      <span>{att.name} ({att.size})</span>
                      <button type="button" onClick={() => handleRemoveAttachment(idx)} style={{ background: 'none', border: 'none', color: 'var(--status-danger)', cursor: 'pointer', padding: 0 }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setStep(1)} className="btn btn-secondary" style={{ padding: '0 20px', height: '42px' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(3)} className="btn btn-primary" style={{ padding: '0 24px', height: '42px', fontWeight: 700 }}>
              Next: Budget & Logistics <ArrowRight size={14} />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: Budget/Compensation, Start Date, Deadline, Vacancies, Location    */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          
          <div style={{ marginBottom: '24px' }}>
            <span className="badge badge-primary" style={{ marginBottom: '6px' }}>Step 3 of 4</span>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Budget, Logistics & Vacancies</h2>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Define compensation structure, work mode location, start date, and vacancies.
            </p>
          </div>

          {/* 1. Compensation Structure */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
              1. Compensation Type
            </label>
            <div className="responsive-3col" style={{ gap: '10px' }}>
              {[
                { type: 'Fixed' as const, label: 'Fixed Project Budget (₹)' },
                { type: 'Hourly' as const, label: 'Hourly Rate (₹/hr)' },
                { type: 'Monthly' as const, label: 'Monthly Stipend / Salary (₹/mo)' }
              ].map((item) => {
                const isSelected = compensationType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setCompensationType(item.type)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.84rem', padding: '10px 12px' }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Budget Range */}
          <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '22px' }}>
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Minimum Budget (₹) *
              </label>
              <input 
                type="number" 
                className="input-field" 
                value={budgetMin} 
                onChange={(e) => setBudgetMin(Number(e.target.value))}
                required 
              />
            </div>

            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Maximum Budget (₹) *
              </label>
              <input 
                type="number" 
                className="input-field" 
                value={budgetMax} 
                onChange={(e) => setBudgetMax(Number(e.target.value))}
                required 
              />
            </div>
          </div>

          {/* 3. Start Date & Delivery Deadline */}
          <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '22px' }}>
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Start Date
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select 
                  className="input-field" 
                  value={startDateType} 
                  onChange={(e) => setStartDateType(e.target.value as any)}
                  style={{ width: '150px' }}
                >
                  <option value="Immediate">Immediate</option>
                  <option value="SpecificDate">Specific Date</option>
                </select>

                {startDateType === 'SpecificDate' && (
                  <input 
                    type="date"
                    className="input-field"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Target Delivery / Duration (Days) *
              </label>
              <input 
                type="number" 
                min={1}
                className="input-field" 
                value={expectedDeliveryDays} 
                onChange={(e) => setExpectedDeliveryDays(Number(e.target.value))}
                required 
              />
            </div>
          </div>

          {/* 4. Vacancies & Work Mode */}
          <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '22px' }}>
            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Number of People Needed (Vacancies)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setVacanciesCount(Math.max(1, vacanciesCount - 1))}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '36px', height: '36px', padding: 0, fontWeight: 700 }}
                >
                  -
                </button>
                <input 
                  type="number" 
                  min={1} 
                  max={20}
                  className="input-field" 
                  value={vacanciesCount} 
                  onChange={(e) => setVacanciesCount(Math.max(1, Number(e.target.value)))}
                  style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem', width: '80px' }}
                  required 
                />
                <button
                  type="button"
                  onClick={() => setVacanciesCount(Math.min(20, vacanciesCount + 1))}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '36px', height: '36px', padding: 0, fontWeight: 700 }}
                >
                  +
                </button>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {vacanciesCount === 1 ? '1 Person' : `${vacanciesCount} People`}
                </span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.86rem', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                Work Mode
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['Remote', 'OnSite', 'Hybrid'] as const).map((mode) => {
                  const isSelected = locationType === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setLocationType(mode as LocationType)}
                      className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, fontWeight: isSelected ? 700 : 500 }}
                    >
                      {mode === 'OnSite' ? 'On-site' : mode}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Location fields if On-site or Hybrid */}
          {locationType !== 'Remote' && (
            <div className="grid-cols-2" style={{ gap: '16px', marginBottom: '22px', padding: '14px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  City *
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Hyderabad, Bangalore, Mumbai"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--text-primary)' }}>
                  State / Region
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Telangana, Karnataka"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Physical Product Shipment Checkbox */}
          <div style={{ marginBottom: '28px', padding: '14px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={requiresProductShipment} 
                onChange={(e) => setRequiresProductShipment(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }}
              />
              <div>
                <span style={{ fontWeight: 600 }}>This task requires physical product sample shipment</span>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Useful for UGC creators, photographers, and reviewers who receive physical product packages.
                </p>
              </div>
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <button onClick={() => setStep(2)} className="btn btn-secondary" style={{ padding: '0 20px', height: '42px' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <button onClick={() => setStep(4)} className="btn btn-primary" style={{ padding: '0 24px', height: '42px', fontWeight: 700 }}>
              Next: Live Review <ArrowRight size={14} />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: Complete Live Review & Publish Flow                               */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="card" style={{ padding: '32px', borderRadius: 'var(--radius-lg)' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>Step 4: Final Live Review</span>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Opportunity Card & Brief Preview</h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                This is exactly how your opportunity brief will be displayed to verified Doers:
              </p>
            </div>

            {/* Quick Edit Step Buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.76rem' }}>
                <Edit2 size={12} /> Edit Type/Role
              </button>
              <button onClick={() => setStep(2)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.76rem' }}>
                <Edit2 size={12} /> Edit Scope
              </button>
              <button onClick={() => setStep(3)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.76rem' }}>
                <Edit2 size={12} /> Edit Budget
              </button>
            </div>
          </div>

          {/* High-Fidelity Realistic Live Card Preview */}
          <div className="card" style={{ padding: '28px', marginBottom: '28px', backgroundColor: 'var(--bg-secondary)', border: '2px solid var(--accent-border)', borderRadius: 'var(--radius-md)' }}>
            
            {/* Metadata Tags Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">{currentCategory.name}</span>
                <span className="badge badge-neutral">{mainOpportunityType === 'Job' ? jobSubType : mainOpportunityType}</span>
                <span className="badge badge-emerald">
                  {locationType === 'Remote' ? 'Remote / Anywhere' : `${locationType} · ${city || 'City'}${stateName ? `, ${stateName}` : ''}`}
                </span>
                <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={12} /> {vacanciesCount} {vacanciesCount === 1 ? 'Vacancy' : 'Vacancies'}
                </span>
                {requiresProductShipment && (
                  <span className="badge badge-neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Truck size={12} /> Product Shipped
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Posting Date: Today
              </div>
            </div>

            {/* Title & Roles */}
            <h3 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', letterSpacing: '-0.01em' }}>
              {title}
            </h3>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {selectedRoles.map((r, i) => (
                <span key={i} style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', border: '1px solid var(--accent-border)', fontWeight: 700 }}>
                  Role: {r}
                </span>
              ))}
              <span style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                Experience: {experienceLevel}
              </span>
            </div>

            {/* Description */}
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              {description}
            </p>

            {/* Key Deliverables / Responsibilities Box */}
            <div style={{ marginBottom: '20px', padding: '16px 18px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
                Key Deliverables & Scope ({responsibilities.length})
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem', color: 'var(--text-primary)', padding: 0, margin: 0 }}>
                {responsibilities.map((d, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <CheckCircle2 size={15} color="var(--accent-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Skills Badges */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px' }}>
                Required Skills
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedSkills.map((s, idx) => (
                  <span key={idx} style={{ fontSize: '0.78rem', padding: '3px 10px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', fontWeight: 500 }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Reference Links Preview if any */}
            {referenceLinks.length > 0 && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Reference Links ({referenceLinks.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {referenceLinks.map((l, i) => (
                    <div key={i} style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Link2 size={13} color="var(--accent-primary)" />
                      <strong>{l.label}:</strong>
                      <a href={l.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-primary)', textDecoration: 'underline' }}>
                        {l.url}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Details: Budget & Terms */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Compensation ({compensationType})</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
                    {budgetMax ? `₹${budgetMin.toLocaleString()} - ₹${budgetMax.toLocaleString()}` : `₹${budgetMin.toLocaleString()}`}
                    {compensationType === 'Hourly' ? ' / hr' : compensationType === 'Monthly' ? ' / mo' : ''}
                  </div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Delivery Timeline</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{expectedDeliveryDays} Days</div>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '14px' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Start Date</div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {startDateType === 'Immediate' ? 'Immediate' : startDate}
                  </div>
                </div>
              </div>

              <button type="button" className="btn btn-primary btn-sm" disabled style={{ opacity: 0.8 }}>
                Apply Now (Doer View)
              </button>
            </div>

          </div>

          {/* Agreement Checkbox */}
          <div style={{ marginBottom: '24px', padding: '12px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={agreedGuidelines} 
                onChange={(e) => setAgreedGuidelines(e.target.checked)}
                style={{ accentColor: 'var(--accent-primary)', width: '18px', height: '18px' }}
              />
              <span>I confirm this brief complies with TNEST marketplace standards and free direct collaboration guidelines.</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(3)} className="btn btn-secondary" style={{ padding: '0 20px', height: '44px' }}>
              <ArrowLeft size={14} /> Back
            </button>
            <button 
              onClick={handleSubmitRequirement} 
              disabled={loading || !agreedGuidelines} 
              className="btn btn-primary"
              style={{ padding: '0 32px', height: '44px', fontWeight: 800, fontSize: '0.96rem' }}
            >
              {loading ? 'Publishing Opportunity...' : 'Publish Task Brief'}
            </button>
          </div>

        </div>
      )}

    </div>
  );
};
