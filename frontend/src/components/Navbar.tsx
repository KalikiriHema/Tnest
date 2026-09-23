import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, MessageSquare, PlusCircle, Compass, Briefcase, User as UserIcon, LogOut, CheckCircle2, ChevronDown, Layers } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, logout, quickSwitch } = useAuth();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(8, 12, 20, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '14px 0'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Logo */}
        <div 
          onClick={() => onNavigate('landing')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--gradient-brand)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={20} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.03em', fontFamily: 'Outfit' }}>
              Creative<span className="gradient-text">Hub</span>
            </span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-4px' }}>
              Specialized Marketplace
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={() => onNavigate('browse')}
            style={{
              background: 'none',
              border: 'none',
              color: currentView === 'browse' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: currentView === 'browse' ? 600 : 500,
              fontSize: '0.925rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
          >
            <Compass size={16} /> Browse Talent
          </button>

          <button 
            onClick={() => onNavigate('opportunities')}
            style={{
              background: 'none',
              border: 'none',
              color: currentView === 'opportunities' ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: currentView === 'opportunities' ? 600 : 500,
              fontSize: '0.925rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'color 0.2s ease'
            }}
          >
            <Briefcase size={16} /> Opportunity Feed
          </button>

          {isAuthenticated && (
            <button 
              onClick={() => onNavigate('messages')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'messages' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: currentView === 'messages' ? 600 : 500,
                fontSize: '0.925rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <MessageSquare size={16} /> Messages
            </button>
          )}

          {isAuthenticated && user?.role === 'Client' && (
            <button 
              onClick={() => onNavigate('client-dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'client-dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: currentView === 'client-dashboard' ? 600 : 500,
                fontSize: '0.925rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Layers size={16} /> Client Dashboard
            </button>
          )}

          {isAuthenticated && user?.role === 'Professional' && (
            <button 
              onClick={() => onNavigate('pro-dashboard')}
              style={{
                background: 'none',
                border: 'none',
                color: currentView === 'pro-dashboard' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: currentView === 'pro-dashboard' ? 600 : 500,
                fontSize: '0.925rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Layers size={16} /> Pro Dashboard
            </button>
          )}
        </nav>

        {/* Right CTA / Role Switcher & Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          
          {/* Quick Persona Switcher for Evaluation */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.8rem', padding: '6px 10px', gap: '6px' }}
              title="Quickly switch roles for testing"
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isAuthenticated ? '#10b981' : '#f59e0b' }} />
              {isAuthenticated ? `${user?.fullName} (${user?.role})` : 'Demo Switcher'}
              <ChevronDown size={14} />
            </button>

            {roleDropdownOpen && (
              <div 
                className="glass-panel"
                style={{
                  position: 'absolute',
                  top: '120%',
                  right: 0,
                  width: '240px',
                  padding: '8px',
                  zIndex: 200,
                  backgroundColor: '#0f172a'
                }}
              >
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '4px 8px', fontWeight: 600, textTransform: 'uppercase' }}>
                  Switch Test Persona
                </div>
                <button
                  onClick={() => { quickSwitch('client'); setRoleDropdownOpen(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'none', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <strong style={{ fontSize: '0.85rem' }}>Ananya Sharma (Client)</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>GlowSkin Organics Brand</span>
                </button>
                <button
                  onClick={() => { quickSwitch('ugc_pro'); setRoleDropdownOpen(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'none', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <strong style={{ fontSize: '0.85rem' }}>Priya Reddy (UGC Pro)</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Telugu + English On-Camera</span>
                </button>
                <button
                  onClick={() => { quickSwitch('editor_pro'); setRoleDropdownOpen(false); }}
                  style={{ width: '100%', textAlign: 'left', padding: '8px', background: 'none', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <strong style={{ fontSize: '0.85rem' }}>Arjun Verma (Video Editor)</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>YouTube & Shorts Specialist</span>
                </button>
              </div>
            )}
          </div>

          {/* Post Requirement CTA */}
          <button 
            onClick={() => onNavigate('wizard')}
            className="btn btn-primary btn-sm"
          >
            <PlusCircle size={16} /> Post Requirement
          </button>

          {/* Auth Action */}
          {isAuthenticated ? (
            <button 
              onClick={logout}
              className="btn btn-secondary btn-sm"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => onOpenAuth('login')}
                className="btn btn-secondary btn-sm"
              >
                Sign In
              </button>
              <button 
                onClick={() => onOpenAuth('register')}
                className="btn btn-primary btn-sm"
              >
                Join CreativeHub
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
