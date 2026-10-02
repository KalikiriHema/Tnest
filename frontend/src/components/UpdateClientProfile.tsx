import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api';
import { ClientProfile } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  User, 
  Globe, 
  Save, 
  CheckCircle2, 
  Sparkles,
  ExternalLink,
  Eye,
  Linkedin,
  Instagram,
  Youtube,
  Link2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Camera,
  UploadCloud,
  Plus,
  Trash2
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { calculateClientCompletion } from '../utils/profileCompletion';

interface UpdateClientProfileProps {
  onNavigate: (view: string, params?: any) => void;
}

export const UpdateClientProfile: React.FC<UpdateClientProfileProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State - Only actual user signup data, no default fake data
  const [clientProfileId, setClientProfileId] = useState('');
  const [contactName, setContactName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Client Type
  const [clientType, setClientType] = useState<string>('Business');

  // Business Specific Info
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [businessDescription, setBusinessDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Social & Professional Links
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [otherUrl, setOtherUrl] = useState('');

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const loadClientProfile = async () => {
      try {
        let profile: ClientProfile;
        if (user.clientProfileId) {
          profile = await api.getClientProfile(user.clientProfileId);
        } else {
          profile = await api.getClientProfileByUserId(user.id);
        }

        setClientProfileId(profile.id || user.clientProfileId || user.id);
        setContactName(profile.contactName || user.fullName || '');
        setAvatarUrl(profile.avatarUrl || user.avatarUrl || '');
        setEmail(profile.email || user.email || '');
        setPhoneNumber(profile.phoneNumber || user.phoneNumber || '');
        setCity(profile.city || user.city || '');
        setState(profile.state || user.state || '');
        setBio(profile.bio || user.bio || '');
        setGender(profile.gender || '');
        setDateOfBirth(profile.dateOfBirth || '');

        setClientType(profile.clientType || 'Business');
        setCompanyName(profile.companyName || user.companyName || '');
        setIndustry(profile.industry || user.industry || '');
        setBusinessDescription(profile.businessDescription || '');
        setWebsiteUrl(profile.websiteUrl || user.websiteUrl || '');

        setLinkedinUrl(profile.linkedinUrl || user.linkedinUrl || '');
        setInstagramUrl(profile.instagramUrl || user.instagramUrl || '');
        setYoutubeUrl(profile.youtubeUrl || user.youtubeUrl || '');
        setOtherUrl(profile.otherUrl || user.otherUrl || '');
      } catch {
        // Only load data actually provided during signup
        setClientProfileId(user.clientProfileId || user.id);
        setContactName(user.fullName || '');
        setAvatarUrl(user.avatarUrl || '');
        setEmail(user.email || '');
        setPhoneNumber(user.phoneNumber || '');
        setCity(user.city || '');
        setState(user.state || '');
        setBio(user.bio || '');
        setClientType('Business');
        setCompanyName(user.companyName || '');
        setIndustry(user.industry || '');
        setBusinessDescription('');
        setWebsiteUrl(user.websiteUrl || '');
        setLinkedinUrl(user.linkedinUrl || '');
        setInstagramUrl(user.instagramUrl || '');
        setYoutubeUrl(user.youtubeUrl || '');
        setOtherUrl(user.otherUrl || '');
      } finally {
        setLoading(false);
      }
    };

    loadClientProfile();
  }, [user]);

  const isBusinessOrOrganization = useMemo(() => {
    return ['Business', 'Startup', 'Agency', 'Other'].includes(clientType);
  }, [clientType]);

  const completionPercentage = useMemo(() => {
    return calculateClientCompletion({
      contactName,
      fullName: contactName,
      email: email || user?.email,
      phoneNumber,
      companyName,
      avatarUrl,
      websiteUrl,
      bio
    });
  }, [companyName, contactName, bio, avatarUrl, websiteUrl, phoneNumber, email, user]);

  const validateUrls = () => {
    const newErrors: { [key: string]: string } = {};
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;

    if (!contactName.trim()) {
      newErrors.contactName = 'Full Name is required';
    }

    if (websiteUrl && !urlPattern.test(websiteUrl) && !websiteUrl.startsWith('http')) {
      newErrors.websiteUrl = 'Please enter a valid website URL (e.g. https://yourbrand.com)';
    }

    if (linkedinUrl && !urlPattern.test(linkedinUrl) && !linkedinUrl.includes('linkedin.com')) {
      newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL';
    }

    if (instagramUrl && !urlPattern.test(instagramUrl) && !instagramUrl.includes('instagram.com')) {
      newErrors.instagramUrl = 'Please enter a valid Instagram URL';
    }

    if (youtubeUrl && !urlPattern.test(youtubeUrl) && !youtubeUrl.includes('youtube.com')) {
      newErrors.youtubeUrl = 'Please enter a valid YouTube URL';
    }

    if (otherUrl && !urlPattern.test(otherUrl) && !otherUrl.startsWith('http')) {
      newErrors.otherUrl = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrls()) {
      return;
    }

    setSaving(true);
    setSuccessMessage(null);

    const updatePayload = {
      contactName,
      companyName: isBusinessOrOrganization ? (companyName || contactName) : contactName,
      avatarUrl,
      websiteUrl,
      industry,
      bio,
      businessDescription,
      clientType,
      city,
      state,
      gender,
      dateOfBirth,
      phoneNumber,
      linkedinUrl,
      instagramUrl,
      youtubeUrl,
      otherUrl
    };

    try {
      if (clientProfileId) {
        await api.updateClientProfile(clientProfileId, updatePayload);
      }

      updateUser({
        fullName: contactName,
        companyName: isBusinessOrOrganization ? (companyName || contactName) : contactName,
        clientType,
        phoneNumber,
        avatarUrl,
        websiteUrl,
        bio,
        businessDescription,
        city,
        state,
        gender,
        dateOfBirth,
        industry,
        linkedinUrl,
        instagramUrl,
        youtubeUrl,
        otherUrl
      });

      setSuccessMessage('Client profile updated successfully!');
      setTimeout(() => {
        setSuccessMessage(null);
      }, 4000);
    } catch {
      updateUser({
        fullName: contactName,
        companyName: isBusinessOrOrganization ? (companyName || contactName) : contactName,
        clientType,
        phoneNumber,
        avatarUrl,
        websiteUrl,
        bio,
        businessDescription,
        city,
        state,
        gender,
        dateOfBirth,
        industry,
        linkedinUrl,
        instagramUrl,
        youtubeUrl,
        otherUrl
      });
      setSuccessMessage('Client profile updated successfully!');
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
        <p style={{ marginTop: '16px', fontSize: '0.92rem' }}>Loading Client Profile Editor...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingBottom: '100px' }}>
      
      {/* TOP HEADER */}
      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '24px 0 28px'
      }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          
          <BreadcrumbNav
            items={[
              { label: 'Client Workspace', view: 'client-dashboard' },
              { label: 'Public Profile', view: 'client-profile' },
              { label: 'Edit Client Profile', active: true }
            ]}
            backLabel="Dashboard"
            backView="client-dashboard"
            onNavigate={onNavigate}
            rightElement={
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onNavigate('client-profile')}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Eye size={14} /> View Public Profile
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <Save size={14} /> {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            }
          />

          {/* Header Identity Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--accent-subtle)',
                border: '2px solid var(--accent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)',
                fontWeight: 800,
                fontSize: '1.4rem',
                overflow: 'hidden'
              }}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={companyName || contactName || 'Client'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  (companyName || contactName || user?.fullName || 'C').charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    {companyName || contactName || user?.fullName || 'Client Profile'}
                  </h1>
                  <span className="badge badge-primary">{clientType}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', margin: '4px 0 0' }}>
                  Primary Contact: {contactName || user?.fullName || 'Client'} {city ? `• ${city}${state ? `, ${state}` : ''}` : ''}
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
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: completionPercentage >= 100 ? 'var(--status-success)' : 'var(--accent-primary)' }}>
                    {completionPercentage}%
                  </span>
                </div>
                <div style={{ width: '130px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${completionPercentage}%`,
                      height: '100%',
                      backgroundColor: completionPercentage >= 100 ? '#10B981' : 'var(--accent-primary)',
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

      {/* FORM CONTENT */}
      <div className="container" style={{ maxWidth: '960px', marginTop: '24px' }}>
        
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
            marginBottom: '20px'
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* HORIZONTAL ROW STEP TOGGLE 1 2 3 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
          {/* STEP 1 TOGGLE */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid',
              borderColor: activeStep === 1 ? 'var(--accent-primary)' : 'var(--border-subtle)',
              backgroundColor: activeStep === 1 ? 'var(--accent-subtle)' : 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              textAlign: 'left'
            }}
          >
            <span style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: activeStep === 1 ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: activeStep === 1 ? '#FFFFFF' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0,
              boxShadow: activeStep === 1 ? '0 2px 8px rgba(0, 113, 227, 0.35)' : 'none'
            }}>
              1
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.92rem',
                color: activeStep === 1 ? 'var(--text-primary)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                1. Personal Info
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Contact & Location
              </div>
            </div>
          </button>

          {/* STEP 2 TOGGLE */}
          <button
            type="button"
            onClick={() => setActiveStep(2)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid',
              borderColor: activeStep === 2 ? 'var(--accent-primary)' : 'var(--border-subtle)',
              backgroundColor: activeStep === 2 ? 'var(--accent-subtle)' : 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              textAlign: 'left'
            }}
          >
            <span style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: activeStep === 2 ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: activeStep === 2 ? '#FFFFFF' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0,
              boxShadow: activeStep === 2 ? '0 2px 8px rgba(0, 113, 227, 0.35)' : 'none'
            }}>
              2
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.92rem',
                color: activeStep === 2 ? 'var(--text-primary)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                2. Client & Org
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Type & Business
              </div>
            </div>
          </button>

          {/* STEP 3 TOGGLE */}
          <button
            type="button"
            onClick={() => setActiveStep(3)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              border: '2px solid',
              borderColor: activeStep === 3 ? 'var(--accent-primary)' : 'var(--border-subtle)',
              backgroundColor: activeStep === 3 ? 'var(--accent-subtle)' : 'var(--bg-card)',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
              textAlign: 'left'
            }}
          >
            <span style={{
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              backgroundColor: activeStep === 3 ? 'var(--accent-primary)' : 'var(--bg-secondary)',
              color: activeStep === 3 ? '#FFFFFF' : 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem',
              flexShrink: 0,
              boxShadow: activeStep === 3 ? '0 2px 8px rgba(0, 113, 227, 0.35)' : 'none'
            }}>
              3
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontWeight: 700,
                fontSize: '0.92rem',
                color: activeStep === 3 ? 'var(--text-primary)' : 'var(--text-secondary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                3. Social Channels
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Links & Profiles
              </div>
            </div>
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* ================= STEP 1: PERSONAL INFORMATION ================= */}
          {activeStep === 1 && (
            <div className="card" style={{ padding: '28px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} color="var(--accent-primary)" />
                  <h2 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    1. Personal Information
                  </h2>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Basic contact and individual details. Contact details are kept private and never exposed to the public.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

              {/* Profile Avatar / Logo with Upload + Icon */}
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
                {/* Avatar with clickable upload overlay & + icon badge */}
                <label style={{
                  position: 'relative',
                  width: '68px',
                  height: '68px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-card)',
                  border: '1.5px dashed var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  fontSize: '1.3rem',
                  overflow: 'hidden',
                  flexShrink: 0,
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-xs)',
                  transition: 'all 0.15s ease'
                }}
                title="Click to upload profile photo / logo"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={contactName || 'Avatar'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', color: 'var(--accent-primary)' }}>
                      <Camera size={22} />
                    </div>
                  )}

                  {/* Camera / + Badge overlay */}
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

                {/* Upload Action Buttons and URL input */}
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <label style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      Profile Photo / Brand Logo
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

              {/* Full Name & Email */}
              <div className="grid-cols-2" style={{ gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Full Name / Primary Contact Person <span style={{ color: 'var(--status-danger)' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter your full name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Email Address <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Private)</span>
                  </label>
                  <input
                    type="email"
                    className="input-field"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled
                    style={{ opacity: 0.8, cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              {/* Phone & Location */}
              <div className="grid-cols-3" style={{ gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Phone Number <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Private)</span>
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    placeholder="+91 98765 43210"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    City
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Bengaluru"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    State
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Karnataka"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  />
                </div>
              </div>

              {/* Demographics Optional */}
              <div className="grid-cols-2" style={{ gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Gender <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <select
                    className="select-field"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select gender (Optional)</option>
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    Date of Birth <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional & Private)</span>
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>

              {/* Bio */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Bio / About the Client <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <span style={{ fontSize: '0.74rem', color: bio.length >= 20 ? 'var(--status-success)' : 'var(--text-muted)' }}>
                    {bio.length} characters
                  </span>
                </div>
                <textarea
                  className="textarea-field"
                  rows={3}
                  placeholder="Brief summary about yourself or your commissioning goals on Tnest..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Step 1 Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <span>Next: Client & Org Details</span> <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CLIENT TYPE & ORGANIZATION ================= */}
          {activeStep === 2 && (
            <div className="card" style={{ padding: '28px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={18} color="var(--accent-primary)" />
                  <h2 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    2. Client Type & Organization Details
                  </h2>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Select how you operate on the marketplace.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

              {/* Client Type Selector Chips */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '10px', color: 'var(--text-primary)' }}>
                  Select Client Type <span style={{ color: 'var(--status-danger)' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                  {['Individual', 'Business', 'Startup', 'Agency', 'Creator', 'Other'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setClientType(type)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1.5px solid',
                        borderColor: clientType === type ? 'var(--accent-primary)' : 'var(--border-subtle)',
                        backgroundColor: clientType === type ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                        color: clientType === type ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: clientType === type ? 700 : 500,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Conditional Organization / Business Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px', paddingTop: '16px', borderTop: '1px dashed var(--border-subtle)' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {clientType === 'Individual' 
                    ? 'Operating as an Individual. You can optionally provide a Brand/Trade Name, Website, or Business Overview below:' 
                    : `Provide details for your ${clientType.toLowerCase()} profile:`}
                </div>

                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {clientType === 'Creator' ? 'Creator / Channel / Brand Name' :
                       clientType === 'Individual' ? 'Brand / Trading Name (Optional)' :
                       clientType === 'Agency' ? 'Agency / Studio Name' :
                       'Company / Business Name'} <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={
                        clientType === 'Creator' ? 'e.g. Maya Creates / Creator Studio' :
                        clientType === 'Startup' ? 'e.g. TechSprint Labs' :
                        clientType === 'Agency' ? 'e.g. Pulse Media & Creative Studio' :
                        clientType === 'Individual' ? 'e.g. Alex Rivera Productions (Optional)' :
                        'e.g. GlowSkin Organics Corp'
                      }
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Official Website <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="url"
                        className="input-field"
                        placeholder="https://yourbrand.com"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                      />
                      {websiteUrl && (
                        <a
                          href={websiteUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                        >
                          <ExternalLink size={13} /> Test
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid-cols-2" style={{ gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Industry / Sector <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                    </label>
                    <select
                      className="select-field"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                    >
                      <option value="">Select Industry / Sector (Optional)</option>
                      <option value="Direct-to-Consumer (DTC)">Direct-to-Consumer (DTC) Brands</option>
                      <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                      <option value="SaaS & Technology">SaaS & Technology</option>
                      <option value="Beauty & Wellness">Beauty & Wellness</option>
                      <option value="Media & Entertainment">Media & Entertainment</option>
                      <option value="Creator & Influencer Commerce">Creator & Influencer Commerce</option>
                      <option value="Fintech & Web3">Fintech & Web3</option>
                      <option value="Creative Agency / Studio">Creative Agency / Studio</option>
                      <option value="Fashion & Apparel">Fashion & Apparel</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Education & EdTech">Education & EdTech</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--text-primary)' }}>
                      Business Description / Overview <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Brief overview of what your business / project focuses on..."
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Step 2 Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={15} /> <span>Back: Personal Info</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <span>Next: Social Links</span> <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: SOCIAL / PROFESSIONAL LINKS ================= */}
          {activeStep === 3 && (
            <div className="card" style={{ padding: '28px', backgroundColor: 'var(--bg-card)', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={18} color="var(--accent-primary)" />
                  <h2 style={{ fontSize: '1.18rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    3. Social / Professional Links
                  </h2>
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Optional links displayed on your public profile to build trust and credibility with Doers.
                </p>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)' }} />

              {/* Website Link */}
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                  <Globe size={14} color="var(--accent-primary)" /> Official Website URL <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                </label>
                <input
                  type="url"
                  className="input-field"
                  placeholder="https://yourwebsite.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </div>

              <div className="grid-cols-2" style={{ gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    <Linkedin size={14} color="#0A66C2" /> LinkedIn Profile / Page URL <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://linkedin.com/in/..."
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    <Instagram size={14} color="#E1306C" /> Instagram Handle / URL <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://instagram.com/..."
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid-cols-2" style={{ gap: '18px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    <Youtube size={14} color="#FF0000" /> YouTube Channel URL <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://youtube.com/@..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--text-primary)' }}>
                    <Link2 size={14} color="var(--accent-primary)" /> Other Relevant Link <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://..."
                    value={otherUrl}
                    onChange={(e) => setOtherUrl(e.target.value)}
                  />
                </div>
              </div>

              {/* Step 3 Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <ArrowLeft size={15} /> <span>Back: Client & Org</span>
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Save size={15} /> {saving ? 'Saving...' : 'Save Client Profile'}
                </button>
              </div>
            </div>
          )}

          {/* FOOTER ACTIONS */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Lock size={13} />
              <span>Sensitive private details are never exposed publicly.</span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => onNavigate('client-dashboard')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary"
                style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={15} /> {saving ? 'Saving...' : 'Save Client Profile'}
              </button>
            </div>
          </div>

        </form>

      </div>

    </div>
  );
};
