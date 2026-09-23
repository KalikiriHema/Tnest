import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { TalentDirectory } from './components/TalentDirectory';
import { PublicProfile } from './components/PublicProfile';
import { DynamicWizard } from './components/DynamicWizard';
import { MatchesExplorer } from './components/MatchesExplorer';
import { OpportunityBoard } from './components/OpportunityBoard';
import { ChatRoom } from './components/ChatRoom';
import { ProjectTracker } from './components/ProjectTracker';
import { ClientDashboard } from './components/ClientDashboard';
import { ProDashboard } from './components/ProDashboard';
import { AuthModal } from './components/AuthModal';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('landing');
  const [viewParams, setViewParams] = useState<any>({});
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');

  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
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

        {currentView === 'browse' && (
          <TalentDirectory onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
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
          />
        )}

        {currentView === 'matches' && (
          <MatchesExplorer 
            requirementId={viewParams.requirementId || '00000000-0000-0000-0000-000000000000'} 
            onNavigate={handleNavigate} 
            onOpenAuth={handleOpenAuth} 
          />
        )}

        {currentView === 'opportunities' && (
          <OpportunityBoard onNavigate={handleNavigate} onOpenAuth={handleOpenAuth} />
        )}

        {currentView === 'messages' && (
          <ChatRoom 
            initialConversationId={viewParams.conversationId} 
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
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '32px 0', marginTop: 'auto', background: 'rgba(8,12,20,0.95)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          <div>
            © 2026 <strong>CreativeHub</strong> — Specialized Requirement-Driven Creative Talent Marketplace.
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <span>Zero-AI Deterministic Matching</span>
            <span>Argon2id Encrypted Security</span>
            <span>SignalR Real-Time Chat</span>
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};
