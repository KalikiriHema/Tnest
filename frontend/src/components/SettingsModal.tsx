import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { 
  X, 
  Sun, 
  Moon, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  Bell, 
  ShieldCheck, 
  Sliders, 
  Palette,
  Laptop
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState<'appearance' | 'security' | 'notifications'>('appearance');

  // Notification Preferences State
  const [chatAlerts, setChatAlerts] = useState<boolean>(() => {
    const s = localStorage.getItem('tnest_pref_chat_alerts');
    return s !== null ? s === 'true' : true;
  });

  const [proposalAlerts, setProposalAlerts] = useState<boolean>(() => {
    const s = localStorage.getItem('tnest_pref_proposal_alerts');
    return s !== null ? s === 'true' : true;
  });

  const [profilePublic, setProfilePublic] = useState<boolean>(() => {
    const s = localStorage.getItem('tnest_pref_public_profile');
    return s !== null ? s === 'true' : true;
  });

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Toast feedback
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const toggleChatAlerts = () => {
    const next = !chatAlerts;
    setChatAlerts(next);
    localStorage.setItem('tnest_pref_chat_alerts', String(next));
    showToast('Notification preferences updated!');
  };

  const toggleProposalAlerts = () => {
    const next = !proposalAlerts;
    setProposalAlerts(next);
    localStorage.setItem('tnest_pref_proposal_alerts', String(next));
    showToast('Notification preferences updated!');
  };

  const toggleProfilePublic = () => {
    const next = !profilePublic;
    setProfilePublic(next);
    localStorage.setItem('tnest_pref_public_profile', String(next));
    showToast(next ? 'Profile is now publicly discoverable.' : 'Profile is hidden from public searches.');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!isAuthenticated) {
      setPasswordError('Please log in to change your password.');
      return;
    }

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      setPasswordSuccess(res.message || 'Password successfully updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password successfully updated!');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password. Please verify your current password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Live password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 6) score += 25;
    if (newPassword.length >= 8) score += 25;
    if (/[A-Z]/.test(newPassword)) score += 25;
    if (/[0-9!@#$%^&*]/.test(newPassword)) score += 25;
    return score;
  };

  const pwdStrength = getPasswordStrength();

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '24px 16px'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '740px', 
          width: '100%',
          height: '520px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-modal)',
          margin: 'auto',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        
        {/* TOP HEADER */}
        <div style={{
          padding: '16px 22px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)'
            }}>
              <Sliders size={17} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Account Settings
              </h2>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                {user ? `${user.fullName} (${user.email})` : 'Theme & Interface Preferences'}
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ 
              background: 'var(--bg-tertiary)', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              padding: '6px',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* TOAST ALERT */}
        {saveToast && (
          <div style={{
            backgroundColor: 'var(--status-success-bg)',
            borderBottom: '1px solid var(--status-success-border)',
            color: 'var(--status-success)',
            padding: '7px 22px',
            fontSize: '0.78rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={13} /> {saveToast}
          </div>
        )}

        {/* 2-COLUMN BODY: SIDEBAR TABS + CONTENT */}
        <div className="responsive-settings-grid">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="responsive-settings-sidebar">
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              
              {/* 1. Appearance */}
              <button
                type="button"
                onClick={() => setActiveTab('appearance')}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'appearance' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'appearance' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'appearance' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: activeTab === 'appearance' ? 'var(--shadow-xs)' : 'none',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Palette size={15} /> Appearance
              </button>

              {/* 2. Password & Security */}
              <button
                type="button"
                onClick={() => setActiveTab('security')}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'security' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'security' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'security' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: activeTab === 'security' ? 'var(--shadow-xs)' : 'none',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Lock size={15} /> Change Password
              </button>

              {/* 3. Notifications & Privacy */}
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: activeTab === 'notifications' ? 'var(--bg-card)' : 'transparent',
                  color: activeTab === 'notifications' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === 'notifications' ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: activeTab === 'notifications' ? 'var(--shadow-xs)' : 'none',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
              >
                <Bell size={15} /> Notifications & Privacy
              </button>

            </div>

            {/* User status badge */}
            {user && (
              <div style={{
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-tertiary)',
                fontSize: '0.72rem',
                color: 'var(--text-muted)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
                  <ShieldCheck size={13} color="var(--accent-primary)" /> {user.role === 'DualRole' ? 'Dual Account' : `${user.role} Account`}
                </div>
                <div>Status: <strong style={{ color: 'var(--status-success)' }}>Active & Verified</strong></div>
              </div>
            )}

          </div>

          {/* RIGHT PANEL CONTENT */}
          <div style={{ padding: '22px 26px', overflowY: 'auto' }}>
            
            {/* 1. APPEARANCE PANEL */}
            {activeTab === 'appearance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Interface Appearance</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Select your preferred visual mode for Tnest on this device.
                  </p>
                </div>

                <div className="responsive-2col" style={{ gap: '12px' }}>
                  {/* Light Theme Card */}
                  <div
                    onClick={() => { setTheme('light'); showToast('Switched to Light mode'); }}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: theme === 'light' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                      backgroundColor: theme === 'light' ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        color: '#0071E3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                      }}>
                        <Sun size={18} />
                      </div>
                      {theme === 'light' && (
                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Light Theme</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      Clean sky-blue styling with high contrast readability.
                    </span>
                  </div>

                  {/* Dark Theme Card */}
                  <div
                    onClick={() => { setTheme('dark'); showToast('Switched to Dark mode'); }}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-md)',
                      border: theme === 'dark' ? '2px solid var(--accent-primary)' : '1px solid var(--border-medium)',
                      backgroundColor: theme === 'dark' ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: '#1E1E20',
                        border: '1px solid #2C2C2E',
                        color: '#2997FF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
                      }}>
                        <Moon size={18} />
                      </div>
                      {theme === 'dark' && (
                        <span style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)', display: 'block' }}>Dark Theme</strong>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                      Deep graphite slate and frosted dark glass for low-light focus.
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.76rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Laptop size={14} color="var(--accent-primary)" />
                  <span>Theme selections persist automatically across sessions and browser tabs.</span>
                </div>
              </div>
            )}

            {/* 2. CHANGE PASSWORD PANEL */}
            {activeTab === 'security' && (
              <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Change Password</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Enter your current password to verify identity and choose a secure new password.
                  </p>
                </div>

                {passwordError && (
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-xs)', 
                    backgroundColor: 'var(--status-danger-bg)', 
                    border: '1px solid var(--status-danger-border)', 
                    color: 'var(--status-danger)', 
                    fontSize: '0.78rem', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={14} />
                    <span>{passwordError}</span>
                  </div>
                )}

                {passwordSuccess && (
                  <div style={{ 
                    padding: '8px 12px', 
                    borderRadius: 'var(--radius-xs)', 
                    backgroundColor: 'var(--status-success-bg)', 
                    border: '1px solid var(--status-success-border)', 
                    color: 'var(--status-success)', 
                    fontSize: '0.78rem', 
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={14} />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Current Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showCurrentPassword ? 'text' : 'password'} 
                        className="input-field" 
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        style={{ fontSize: '0.84rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        New Password
                      </label>
                      {newPassword && (
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: pwdStrength >= 75 ? 'var(--status-success)' : pwdStrength >= 50 ? 'var(--status-warning)' : 'var(--status-danger)'
                        }}>
                          {pwdStrength >= 75 ? 'Strong' : pwdStrength >= 50 ? 'Moderate' : 'Weak'}
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showNewPassword ? 'text' : 'password'} 
                        className="input-field" 
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={6}
                        style={{ fontSize: '0.84rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>

                    {/* Live Strength Indicator */}
                    {newPassword && (
                      <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '2px', marginTop: '5px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${pwdStrength}%`,
                            height: '100%',
                            backgroundColor: pwdStrength >= 75 ? '#10B981' : pwdStrength >= 50 ? '#F59E0B' : '#E11D48',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'} 
                        className="input-field" 
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        style={{ fontSize: '0.84rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="btn btn-primary"
                  style={{ width: '100%', height: '36px', fontWeight: 600, marginTop: '4px' }}
                >
                  {isUpdatingPassword ? 'Updating Password...' : 'Save New Password'}
                </button>
              </form>
            )}

            {/* 3. NOTIFICATIONS & PRIVACY PANEL */}
            {activeTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>Preferences & Privacy</h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                    Manage alerts, direct inquiry notifications, and profile visibility.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  
                  {/* Chat / Direct Messages */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block' }}>Direct Message Notifications</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Receive realtime badge alerts when clients or doers message you.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={chatAlerts}
                      onChange={toggleChatAlerts}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Task Proposals & Milestones */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block' }}>Task Proposal & Payment Alerts</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Get notified when tasks receive proposals or milestone funds are released.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={proposalAlerts}
                      onChange={toggleProposalAlerts}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Public Directory Visibility */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <strong style={{ fontSize: '0.86rem', color: 'var(--text-primary)', display: 'block' }}>Public Directory Listing</strong>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {profilePublic ? 'Your profile appears across the Find Doers directory.' : 'Hidden from public directory (accessible only via direct link).'}
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={profilePublic}
                      onChange={toggleProfilePublic}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                    />
                  </div>

                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
