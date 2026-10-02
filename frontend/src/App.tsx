import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { BrowseOpportunities } from './components/BrowseOpportunities';
import { FindDoers } from './components/FindDoers';
import { HowItWorksPage } from './components/HowItWorksPage';
import { MyActivity } from './components/MyActivity';
import { PublicProfile } from './components/PublicProfile';
import { DynamicWizard } from './components/DynamicWizard';
import { MatchesExplorer } from './components/MatchesExplorer';
import { ChatRoom } from './components/ChatRoom';
import { ProjectTracker } from './components/ProjectTracker';
import { ClientDashboard } from './components/ClientDashboard';
import { ProDashboard } from './components/ProDashboard';
import { UpdateProfile } from './components/UpdateProfile';
import { ClientProfileView } from './components/ClientProfileView';
import { UpdateClientProfile } from './components/UpdateClientProfile';
import { AuthModal } from './components/AuthModal';
import { Logo } from './components/Logo';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLogin } from './components/admin/AdminLogin';

export const AppContent: React.FC = () => {
  const { isAuthenticated, user, logout, setAuthSession, activePersona } = useAuth();
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});
  const [historyStack, setHistoryStack] = useState<Array<{ view: string; params: any }>>([]);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');

  // Direct URL checking and browser history PopState support
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (e.state && e.state.view) {
        setCurrentView(e.state.view);
        setViewParams(e.state.params || {});
      } else {
        const path = window.location.pathname;
        if (path.startsWith('/admin')) {
          setCurrentView('admin');
        } else {
          const cleanPath = path.replace(/^\//, '');
          if (cleanPath && ['opportunities', 'browse', 'how-it-works', 'my-activity', 'profile', 'wizard', 'matches', 'messages', 'project-tracker', 'client-dashboard', 'pro-dashboard', 'update-profile', 'client-profile', 'update-client-profile'].includes(cleanPath)) {
            setCurrentView(cleanPath);
          } else {
            setCurrentView('landing');
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Initial route check
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentView('admin');
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const getFallbackBackView = (current: string) => {
    switch (current) {
      case 'matches':
      case 'project-tracker':
        return user?.role === 'Professional' 
          ? { view: 'my-activity', params: { tab: 'work' } } 
          : { view: 'my-activity', params: { tab: 'posted' } };
      case 'messages':
        return user?.role === 'Professional'
          ? { view: 'pro-dashboard', params: {} }
          : user?.role === 'Client'
          ? { view: 'client-dashboard', params: {} }
          : { view: 'my-activity', params: {} };
      case 'profile':
        return user?.role === 'Professional'
          ? { view: 'pro-dashboard', params: {} }
          : { view: 'browse', params: {} };
      case 'update-profile':
        return { view: 'profile', params: { slug: user?.slug || 'my-profile' } };
      case 'client-profile':
      case 'update-client-profile':
        return { view: 'client-dashboard', params: {} };
      case 'wizard':
        return user?.role === 'Client'
          ? { view: 'client-dashboard', params: {} }
          : { view: 'opportunities', params: {} };
      case 'client-dashboard':
      case 'pro-dashboard':
      case 'how-it-works':
      case 'opportunities':
      case 'browse':
      case 'my-activity':
        return { view: 'landing', params: {} };
      default:
        return { view: 'landing', params: {} };
    }
  };

  const handleNavigate = (view: string, params: any = {}) => {
    if (view === 'wizard' && !isAuthenticated) {
      handleOpenAuth('login');
      return;
    }

    if (view === 'back') {
      if (historyStack.length > 0) {
        const prev = historyStack[historyStack.length - 1];
        setHistoryStack(prevStack => prevStack.slice(0, prevStack.length - 1));
        setCurrentView(prev.view);
        setViewParams(prev.params || {});
        try {
          window.history.replaceState({ view: prev.view, params: prev.params }, '', prev.view === 'landing' ? '/' : `/${prev.view}`);
        } catch (_) {}
      } else {
        const fallback = getFallbackBackView(currentView);
        setCurrentView(fallback.view);
        setViewParams(fallback.params || {});
        try {
          window.history.replaceState({ view: fallback.view, params: fallback.params }, '', fallback.view === 'landing' ? '/' : `/${fallback.view}`);
        } catch (_) {}
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Push previous view to history if it's different from the target view
    if (currentView !== view || JSON.stringify(viewParams) !== JSON.stringify(params)) {
      setHistoryStack(prevStack => [...prevStack.slice(-15), { view: currentView, params: viewParams }]);
      try {
        window.history.pushState({ view, params }, '', view === 'landing' ? '/' : `/${view}`);
      } catch (_) {}
    }

    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  };

  // Dedicated Protected Admin Portal Route
  if (currentView === 'admin' || currentView === 'admin-login') {
    if (isAuthenticated && user?.role === 'Admin') {
      return (
        <AdminLayout
          currentUser={user}
          onLogout={() => {
            logout();
            setCurrentView('landing');
          }}
          onNavigateMarketplace={() => handleNavigate('landing')}
        />
      );
    }
    return (
      <AdminLogin
        onLoginSuccess={(sess) => {
          setAuthSession(sess);
          setCurrentView('admin');
        }}
        onNavigateMarketplace={() => handleNavigate('landing')}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      
      {/* Top Navbar */}
      <Navbar 
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main View Router */}
      <main style={{ flex: 1 }}>
        {currentView === 'landing' && (
          <LandingPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {currentView === 'opportunities' && (
          <BrowseOpportunities 
            initialSearchQuery={viewParams.search || ''}
            initialCategorySlug={viewParams.category || ''}
            onNavigate={handleNavigate} 
            onOpenAuth={handleOpenAuth} 
          />
        )}

        {currentView === 'browse' && (
          <FindDoers 
            initialCategory={viewParams.category || ''}
            initialSearchQuery={viewParams.search || ''}
            onNavigate={handleNavigate} 
            onOpenAuth={handleOpenAuth} 
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorksPage onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {currentView === 'my-activity' && (
          <MyActivity initialTab={viewParams.tab || 'posted'} onNavigate={handleNavigate} />
        )}

        {currentView === 'profile' && (
          <PublicProfile 
            slug={viewParams.slug || 'priya-reddy'} 
            onNavigate={handleNavigate} 
            onOpenAuth={handleOpenAuth} 
          />
        )}

        {currentView === 'wizard' && (
          <DynamicWizard 
            onRequirementCreated={(reqId) => handleNavigate('matches', { requirementId: reqId })} 
            onOpenAuth={handleOpenAuth} 
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'matches' && (
          <MatchesExplorer 
            requirementId={viewParams.requirementId || '00000000-0000-0000-0000-000000000000'} 
            onNavigate={handleNavigate} 
            onOpenAuth={handleOpenAuth} 
          />
        )}

        {currentView === 'messages' && (
          <ChatRoom 
            initialConversationId={viewParams.conversationId}
            targetUserId={viewParams.targetUserId || viewParams.userId}
            targetName={viewParams.targetName || viewParams.clientName || viewParams.proName || viewParams.posterName || viewParams.recipientName}
            targetRole={viewParams.targetRole || viewParams.role}
            targetAvatar={viewParams.targetAvatar || viewParams.avatarUrl}
            requirementId={viewParams.requirementId}
            requirementTitle={viewParams.requirementTitle || viewParams.title}
            clientProfileId={viewParams.clientProfileId || viewParams.clientId}
            professionalProfileId={viewParams.professionalProfileId || viewParams.proProfileId}
            initialMessage={viewParams.initialMessage}
            onNavigate={handleNavigate} 
          />
        )}

        {currentView === 'project-tracker' && (
          <ProjectTracker 
            projectId={viewParams.projectId} 
            onNavigate={handleNavigate} 
            onOpenAuth={handleOpenAuth} 
          />
        )}

        {currentView === 'client-dashboard' && (
          <ClientDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'pro-dashboard' && (
          <ProDashboard onNavigate={handleNavigate} />
        )}

        {currentView === 'update-profile' && (
          (user?.role === 'Client' || (user?.role === 'DualRole' && activePersona === 'client'))
            ? <UpdateClientProfile onNavigate={handleNavigate} />
            : <UpdateProfile onNavigate={handleNavigate} />
        )}

        {currentView === 'client-profile' && (
          <ClientProfileView clientId={viewParams.clientId} onNavigate={handleNavigate} />
        )}

        {currentView === 'update-client-profile' && (
          <UpdateClientProfile onNavigate={handleNavigate} />
        )}
      </main>

      {/* Clean Apple-Inspired Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '56px 0 32px', marginTop: 'auto', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div className="grid-cols-4" style={{ gap: '36px', marginBottom: '40px' }}>
            
            {/* Column 1: Brand */}
            <div>
              <div style={{ marginBottom: '14px' }}>
                <Logo size="md" showTagline tagline="Where Needs Meet Skills" />
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                Where Needs Meet Skills. The modern task and talent marketplace connecting businesses and individuals with verified Doers.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span className="badge badge-primary">Deterministic Matching</span>
                <span className="badge badge-emerald">Verified Reviews</span>
              </div>
            </div>

            {/* Column 2: Categories */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>Task Disciplines</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li><a href="#ugc" onClick={(e) => { e.preventDefault(); handleNavigate('opportunities', { category: 'ugc-creators' }); }} style={{ cursor: 'pointer' }}>UGC & Creators</a></li>
                <li><a href="#video" onClick={(e) => { e.preventDefault(); handleNavigate('opportunities', { category: 'video-content' }); }} style={{ cursor: 'pointer' }}>Video & Content Editing</a></li>
                <li><a href="#design" onClick={(e) => { e.preventDefault(); handleNavigate('opportunities', { category: 'design' }); }} style={{ cursor: 'pointer' }}>Design & Thumbnails</a></li>
                <li><a href="#tech" onClick={(e) => { e.preventDefault(); handleNavigate('opportunities', { category: 'technology' }); }} style={{ cursor: 'pointer' }}>Technology & Development</a></li>
                <li><a href="#writing" onClick={(e) => { e.preventDefault(); handleNavigate('opportunities', { category: 'writing-content' }); }} style={{ cursor: 'pointer' }}>Writing & Scripting</a></li>
              </ul>
            </div>

            {/* Column 3: Platform & Workflow */}
            <div>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '14px', color: 'var(--text-primary)' }}>Platform</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li><a href="#post" onClick={(e) => { e.preventDefault(); handleNavigate('wizard'); }} style={{ cursor: 'pointer' }}>Post Task</a></li>
                <li><a href="#opps" onClick={(e) => { e.preventDefault(); handleNavigate('opportunities'); }} style={{ cursor: 'pointer' }}>Browse Opportunities</a></li>
                <li><a href="#doers" onClick={(e) => { e.preventDefault(); handleNavigate('browse'); }} style={{ cursor: 'pointer' }}>Find Capable Doers</a></li>
                <li><a href="#how" onClick={(e) => { e.preventDefault(); handleNavigate('how-it-works'); }} style={{ cursor: 'pointer' }}>How Tnest Works</a></li>
                <li><a href="#chat" onClick={(e) => { e.preventDefault(); handleNavigate('messages'); }} style={{ cursor: 'pointer' }}>Real-Time Messaging</a></li>
                {user?.role === 'Admin' && (
                  <li><a href="#admin" onClick={(e) => { e.preventDefault(); handleNavigate('admin'); }} style={{ cursor: 'pointer', color: 'var(--accent-primary)', fontWeight: 500 }}>Admin Portal</a></li>
                )}
              </ul>
            </div>

            {/* Column 4: Security & Compliance */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <ShieldCheck size={16} color="var(--accent-primary)" />
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>Trust & Safety</h4>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                Protected transactions and verified collaborations backed by secure milestone payments.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <Lock size={13} color="var(--text-muted)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block' }}>Encrypted Authentication</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>
                      Secure session channels and multi-layer authentication.
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <ShieldCheck size={13} color="var(--status-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)', display: 'block' }}>Protected Payments</strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', lineHeight: 1.4, display: 'block' }}>
                      Funds are released only when deliverables are approved.
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>
              © 2026 <strong>Tnest</strong>. All rights reserved.
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Milestone Protection</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal 
          initialTab={authInitialTab}
          onClose={() => setAuthModalOpen(false)} 
        />
      )}

    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};
