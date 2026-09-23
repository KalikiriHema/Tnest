import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { Category, DynamicFormField } from '../types';
import { Sparkles, Film, Image as ImageIcon, Feather, ArrowRight, ArrowLeft, Check, Globe, Clock, DollarSign, Package, Video } from 'lucide-react';

interface DynamicWizardProps {
  onRequirementCreated: (reqId: string) => void;
  onOpenAuth: () => void;
}

export const DynamicWizard: React.FC<DynamicWizardProps> = ({ onRequirementCreated, onOpenAuth }) => {
  const { user, isAuthenticated } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, any>>({});
  
  // Scoping Specs
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budgetMin, setBudgetMin] = useState(10000);
  const [budgetMax, setBudgetMax] = useState(25000);
  const [currency, setCurrency] = useState('INR');
  const [expectedDeliveryDays, setExpectedDeliveryDays] = useState(5);
  const [requiredLanguages, setRequiredLanguages] = useState<string[]>(['English']);
  const [requiresOnCamera, setRequiresOnCamera] = useState(false);
  const [requiresProductShipment, setRequiresProductShipment] = useState(false);
  const [isPublicListing, setIsPublicListing] = useState(true);

  useEffect(() => {
    api.getCategories().then(cats => {
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0]);
      }
    });
  }, []);

  // When category changes, preset sensible defaults
  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setDynamicAnswers({});
    if (cat.slug === 'ugc-creators') {
      setTitle('Need 3 Authentic UGC Reels for Skincare Product Launch');
      setDescription('Seeking an energetic on-camera creator to shoot 3 high-converting 9:16 reels showcasing our glow serum. We will ship 2 product bottles.');
      setRequiresOnCamera(true);
      setRequiresProductShipment(true);
      setRequiredLanguages(['Telugu', 'English']);
      setBudgetMin(15000);
      setBudgetMax(25000);
    } else if (cat.slug === 'video-editors') {
      setTitle('High-Retention YouTube Long-Form Video Editor');
      setDescription('Looking for a skilled editor experienced with Premiere Pro / DaVinci Resolve to edit a 12-minute documentary-style video with sound design and motion graphics.');
      setRequiresOnCamera(false);
      setRequiresProductShipment(false);
      setRequiredLanguages(['English']);
      setBudgetMin(8000);
      setBudgetMax(18000);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={24} color="#ec4899" />;
      case 'Film': return <Film size={24} color="#6366f1" />;
      case 'Image': return <ImageIcon size={24} color="#06b6d4" />;
      case 'Feather': return <Feather size={24} color="#f59e0b" />;
      default: return <Sparkles size={24} color="#6366f1" />;
    }
  };

  const parsedDynamicFields: DynamicFormField[] = selectedCategory?.dynamicSchemaJson 
    ? JSON.parse(selectedCategory.dynamicSchemaJson) 
    : [];

  const handleLanguageToggle = (lang: string) => {
    if (requiredLanguages.includes(lang)) {
      setRequiredLanguages(requiredLanguages.filter(l => l !== lang));
    } else {
      setRequiredLanguages([...requiredLanguages, lang]);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      onOpenAuth();
      return;
    }

    if (!selectedCategory) return;
    setLoading(true);

    try {
      const clientProfileId = user?.clientProfileId || '00000000-0000-0000-0000-000000000000';
      const newReq = await api.createRequirement({
        clientProfileId,
        categoryId: selectedCategory.id,
        title,
        description,
        budgetMin,
        budgetMax,
        currency,
        expectedDeliveryDays,
        requiredLanguages,
        requiresOnCamera,
        requiresProductShipment,
        dynamicAttributes: dynamicAnswers,
        isPublicListing
      });

      onRequirementCreated(newReq.id);
    } catch (err: any) {
      alert(err.message || 'Error creating requirement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 24px', maxWidth: '880px' }}>
      
      {/* Wizard Step Indicator */}
      <div style={{ marginBottom: '36px', textAlign: 'center' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '12px' }}>
          Dynamic Scoping Wizard
        </span>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '10px' }}>
          Define Your Creative Requirement
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Our deterministic engine adapts form schemas to eliminate ambiguous briefs and deliver transparent matches.
        </p>

        {/* Step Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '28px' }}>
          {[
            { num: 1, label: 'Select Category' },
            { num: 2, label: 'Dynamic Specs' },
            { num: 3, label: 'Budget & SLA' }
          ].map((s) => (
            <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                background: step === s.num ? 'var(--accent-primary)' : step > s.num ? 'var(--accent-emerald)' : 'rgba(255,255,255,0.06)',
                color: '#fff',
                border: `1px solid ${step >= s.num ? 'transparent' : 'var(--border-subtle)'}`
              }}>
                {step > s.num ? <Check size={16} /> : s.num}
              </div>
              <span style={{ fontSize: '0.875rem', color: step === s.num ? '#fff' : 'var(--text-muted)', fontWeight: step === s.num ? 600 : 400 }}>
                {s.label}
              </span>
              {s.num < 3 && <div style={{ width: '40px', height: '1px', background: 'var(--border-subtle)', marginLeft: '8px' }} />}
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '36px' }}>

        {/* STEP 1: CATEGORY SELECTION */}
        {step === 1 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Choose the Creative Category</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Each category loads a specialized questionnaire designed for that creative domain.
            </p>

            <div className="grid-cols-2" style={{ gap: '16px' }}>
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat)}
                    className="glass-panel"
                    style={{
                      padding: '20px',
                      cursor: 'pointer',
                      border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '16px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      padding: '12px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getCategoryIcon(cat.icon)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{cat.name}</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{cat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
              <button 
                onClick={() => setStep(2)}
                className="btn btn-primary"
                style={{ padding: '12px 24px' }}
              >
                Continue to Dynamic Specs <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CATEGORY-ADAPTIVE DYNAMIC QUESTIONS */}
        {step === 2 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span className="badge badge-emerald">{selectedCategory?.name}</span>
              <h2 style={{ fontSize: '1.35rem' }}>Dynamic Domain Specs</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Answer category-specific questions to ensure creators receive complete instructions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Dynamic Questions Rendered from Schema */}
              {parsedDynamicFields.map((field) => (
                <div key={field.fieldId}>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--accent-secondary)' }}>*</span>}
                  </label>

                  {field.type === 'select' && (
                    <select
                      className="select-field"
                      value={dynamicAnswers[field.fieldId] || ''}
                      onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [field.fieldId]: e.target.value })}
                    >
                      <option value="">Select option...</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {field.type === 'number' && (
                    <input
                      type="number"
                      className="input-field"
                      placeholder="e.g. 15"
                      value={dynamicAnswers[field.fieldId] || ''}
                      onChange={(e) => setDynamicAnswers({ ...dynamicAnswers, [field.fieldId]: e.target.value })}
                    />
                  )}

                  {field.type === 'boolean' && (
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="button"
                        onClick={() => setDynamicAnswers({ ...dynamicAnswers, [field.fieldId]: true })}
                        className={`btn btn-sm ${dynamicAnswers[field.fieldId] === true ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDynamicAnswers({ ...dynamicAnswers, [field.fieldId]: false })}
                        className={`btn btn-sm ${dynamicAnswers[field.fieldId] === false ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        No
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Physical Product Shipment & On-Camera Toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                <div 
                  onClick={() => setRequiresOnCamera(!requiresOnCamera)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${requiresOnCamera ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    background: requiresOnCamera ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Video size={20} color={requiresOnCamera ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>On-Camera Talent Required</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Face & voice direct presentation</span>
                  </div>
                </div>

                <div 
                  onClick={() => setRequiresProductShipment(!requiresProductShipment)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${requiresProductShipment ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    background: requiresProductShipment ? 'rgba(99, 102, 241, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <Package size={20} color={requiresProductShipment ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <div>
                    <strong style={{ fontSize: '0.9rem', display: 'block' }}>Physical Product Shipment</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Product shipped to creator address</span>
                  </div>
                </div>
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={() => setStep(1)} className="btn btn-secondary">
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={() => setStep(3)} className="btn btn-primary">
                Continue to Budget & SLA <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: BRIEF DETAILS, BUDGET, LANGUAGES & SLA */}
        {step === 3 && (
          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>Project Title, Budget & Scope</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Finalize brief parameters for matching calculations and public listing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 High-Energy Skincare UGC Reels for Product Launch"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Detailed Description & Brief *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide context, hook ideas, visual guidelines, or reference links..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="textarea-field"
                />
              </div>

              {/* Language Selection */}
              <div>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  Required Languages for Delivery
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Spanish', 'French'].map((lang) => {
                    const isSelected = requiredLanguages.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleLanguageToggle(lang)}
                        className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ borderRadius: 'var(--radius-full)' }}
                      >
                        <Globe size={14} /> {lang}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Budget Range & Delivery Days */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Min Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(Number(e.target.value))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                    Turnaround SLA (Days)
                  </label>
                  <input
                    type="number"
                    value={expectedDeliveryDays}
                    onChange={(e) => setExpectedDeliveryDays(Number(e.target.value))}
                    className="input-field"
                  />
                </div>
              </div>

              {/* Two-Way Listing Toggle */}
              <div style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <strong style={{ fontSize: '0.925rem', display: 'block' }}>Publish to Open Opportunity Feed</strong>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Allow verified creators matching your criteria to review the brief and submit custom pitches.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isPublicListing}
                  onChange={(e) => setIsPublicListing(e.target.checked)}
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                />
              </div>

            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button onClick={() => setStep(2)} className="btn btn-secondary">
                <ArrowLeft size={18} /> Back
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={loading || !title || !description}
                className="btn btn-primary btn-lg"
              >
                {loading ? 'Calculating Matches...' : 'Publish Brief & View Matches'} <Sparkles size={18} />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
