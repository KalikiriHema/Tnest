import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, Briefcase, Eye, EyeOff, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { UserRole } from '../types';

interface AuthModalProps {
  initialTab?: 'login' | 'register';
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialTab = 'login', onClose }) => {
  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const { login, googleLogin, register, quickSwitch } = useAuth();
  
  // Registration Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [intent, setIntent] = useState<'client' | 'doer' | 'both'>('client');
  const [companyName, setCompanyName] = useState('');
  const [headline, setHeadline] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const assignedRole: UserRole = intent === 'both' ? 'DualRole' : intent === 'doer' ? 'Professional' : 'Client';
      await register({
        fullName,
        email,
        phoneNumber,
        password,
        role: assignedRole,
        companyName: intent !== 'doer' ? companyName || `${fullName}'s Brand` : undefined,
        headline: intent !== 'client' ? headline || 'Creative Doer & Specialist' : undefined
      });

      // Initialize welcome notifications for immediate display with unread count
      const welcomeNotifs = [
        {
          id: `welcome-${Date.now()}-1`,
          type: 'system',
          title: `Welcome to Tnest, ${fullName}! 🎉`,
          message: assignedRole === 'Professional'
            ? 'Your specialist profile is active. Browse briefs and send your first proposal.'
            : 'Your client workspace is ready. Post your first brief or browse verified talent.',
          time: 'Just now',
          isRead: false,
          actionView: assignedRole === 'Professional' ? 'opportunities' : 'wizard'
        },
        {
          id: `welcome-${Date.now()}-2`,
          type: 'system',
          title: 'Complete Your Profile Details ✏️',
          message: 'Add your portfolio, bio, and social links to earn a verified trust badge.',
          time: 'Just now',
          isRead: false,
          actionView: assignedRole === 'Client' ? 'client-profile' : 'profile'
        }
      ];

      localStorage.setItem(`tnest_notifs_${email.trim().toLowerCase()}`, JSON.stringify(welcomeNotifs));

      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setError('Google authentication failed - no credential token returned.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const assignedRole: UserRole = intent === 'both' ? 'DualRole' : intent === 'doer' ? 'Professional' : 'Client';
      await googleLogin(
        credentialResponse.credential,
        tab === 'register' ? assignedRole : undefined,
        tab === 'register' && intent !== 'doer' ? companyName || undefined : undefined,
        tab === 'register' && intent !== 'client' ? headline || undefined : undefined
      );
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (type: 'client' | 'ugc_pro' | 'editor_pro' | 'dual' | 'john' | 'admin') => {
    setLoading(true);
    try {
      await quickSwitch(type);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (em: string, pw: string) => {
    setLoginEmail(em);
    setLoginPassword(pw);
  };

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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '24px 16px',
        overflowY: 'auto'
      }}
    >
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ 
          maxWidth: '520px', 
          width: '100%',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
          padding: '28px 30px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-modal)',
          margin: 'auto',
          color: 'var(--text-primary)'
        }}
      >
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {tab === 'login' ? 'Welcome Back to Tnest' : 'Create Your Free Account'}
            </h2>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '3px' }}>
              {tab === 'login' 
                ? 'Sign in to access your briefs, proposals, and live agreements.' 
                : 'Join Tnest to hire verified talent or discover high-value work.'}
            </p>
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

        {/* Tab Toggle Switch with Theme-aware Tokens */}
        <div 
          style={{ 
            display: 'flex', 
            backgroundColor: 'var(--bg-tertiary)', 
            padding: '4px', 
            borderRadius: 'var(--radius-md)', 
            marginBottom: '20px', 
            border: '1px solid var(--border-subtle)' 
          }}
        >
          <button
            type="button"
            onClick={() => { setTab('login'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: tab === 'login' ? '1px solid var(--accent-border)' : 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: tab === 'login' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'login' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: tab === 'login' ? 700 : 500,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: tab === 'login' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(null); }}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: tab === 'register' ? '1px solid var(--accent-border)' : 'none',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: tab === 'register' ? 'var(--bg-card)' : 'transparent',
              color: tab === 'register' ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: tab === 'register' ? 700 : 500,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: tab === 'register' ? 'var(--shadow-xs)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Register
          </button>
        </div>

        {error && (
          <div style={{ 
            padding: '10px 14px', 
            borderRadius: 'var(--radius-sm)', 
            backgroundColor: 'var(--status-danger-bg)', 
            border: '1px solid var(--status-danger-border)', 
            color: 'var(--status-danger)', 
            fontSize: '0.82rem', 
            fontWeight: 500, 
            marginBottom: '16px' 
          }}>
            {error}
          </div>
        )}

        {/* LOGIN TAB */}
        {tab === 'login' ? (
          <div>
            {/* Google OAuth 1-Click Login */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in was cancelled or failed.')}
                  theme="outline"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '14px 0 16px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                or sign in with email
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                  Email Address
                </label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="name@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '5px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showLoginPassword ? 'text' : 'password'} 
                    className="input-field" 
                    placeholder="Enter your password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    {showLoginPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '6px', height: '42px', fontSize: '0.92rem', fontWeight: 600 }}>
                {loading ? 'Signing in...' : 'Sign In with Credentials'}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0 16px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                or 1-click test quick login
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            {/* 4 DEMO TEST LOGINS SECTION (Positioned below Sign In) */}
            <div style={{ 
              padding: '14px', 
              borderRadius: 'var(--radius-md)', 
              backgroundColor: 'var(--bg-secondary)', 
              border: '1px solid var(--border-subtle)' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Sparkles size={13} style={{ color: 'var(--accent-primary)' }} /> Instant Demo Test Logins
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Click to Sign In</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Demo 1: Client */}
                <div 
                  onClick={() => handleDemoLogin('client')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: 600 }}>Client</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>hema's Brand (hema)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>hema@gmail.com • Client Account</div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    Log In <ArrowRight size={12} />
                  </button>
                </div>

                {/* Demo 2: Doer Specialist */}
                <div 
                  onClick={() => handleDemoLogin('ugc_pro')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: 600 }}>Doer</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>navya (Creative Specialist)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>navya@gmail.com • Doer Account</div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    Log In <ArrowRight size={12} />
                  </button>
                </div>

                {/* Demo 3: Dual Role */}
                <div 
                  onClick={() => handleDemoLogin('dual')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem', fontWeight: 600 }}>Dual Role</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>John Doe (Client + Doer)</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>john@gmail.com • Post & Work Both</div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    Log In <ArrowRight size={12} />
                  </button>
                </div>

                {/* Demo 4: Admin */}
                <div 
                  onClick={() => handleDemoLogin('admin')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--status-danger)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="badge badge-danger" style={{ fontSize: '0.7rem', fontWeight: 600 }}>Admin</span>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>System Admin</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>admin@tnest.com • Full Moderation</div>
                    </div>
                  </div>
                  <button 
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                  >
                    Log In <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* REGISTER TAB */
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Plan Intent Selector */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                How do you plan to use Tnest?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {[
                  { id: 'client', label: 'Hire Talent', desc: 'Post work' },
                  { id: 'doer', label: 'Offer Skills', desc: 'Find tasks' },
                  { id: 'both', label: 'Dual Role', desc: 'Hire & Work' }
                ].map((item) => {
                  const isSelected = intent === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setIntent(item.id as any)}
                      style={{
                        padding: '10px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                        fontWeight: isSelected ? 700 : 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ fontWeight: isSelected ? 700 : 600 }}>{item.label}</div>
                      <span style={{ fontSize: '0.7rem', color: isSelected ? 'var(--accent-primary)' : 'var(--text-muted)', display: 'block', marginTop: '2px' }}>
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Google 1-Click Fast Register */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0 2px' }}>
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-up was cancelled or failed.')}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '6px 0 4px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                or create with email
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)' }} />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Full Name
              </label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="grid-cols-2" style={{ gap: '10px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Email
                </label>
                <input 
                  type="email" 
                  className="input-field" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  className="input-field" 
                  placeholder="+91 98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>

            {intent !== 'doer' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Company / Brand Name
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Acme Studios or Personal"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            )}

            {intent !== 'client' && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                  Professional Headline
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="e.g. Video Editor & Colorist"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Create Password
              </label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showRegisterPassword ? 'text' : 'password'} 
                  className="input-field" 
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  {showRegisterPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: '6px', height: '42px', fontSize: '0.92rem', fontWeight: 600 }}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
