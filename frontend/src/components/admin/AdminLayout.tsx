import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FileText, 
  FolderCheck, 
  ShieldAlert, 
  FolderLock, 
  Star, 
  FolderTree, 
  Tag, 
  Code, 
  Bell, 
  Clock, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Sparkles, 
  ArrowLeft, 
  Shield, 
  Menu, 
  X,
  ExternalLink
} from 'lucide-react';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './AdminUsers';
import { AdminOpportunities } from './AdminOpportunities';
import { AdminApplications } from './AdminApplications';
import { AdminProjects } from './AdminProjects';
import { AdminReports } from './AdminReports';
import { AdminModeration } from './AdminModeration';
import { AdminTaxonomy } from './AdminTaxonomy';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminNotifications } from './AdminNotifications';
import { AdminSettings } from './AdminSettings';
import { User as UserType } from '../../types';

interface AdminLayoutProps {
  currentUser: UserType | null;
  onLogout: () => void;
  onNavigateMarketplace: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ currentUser, onLogout, onNavigateMarketplace }) => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navSections = [
    {
      title: 'Main',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null }
      ]
    },
    {
      title: 'Users',
      items: [
        { id: 'users', label: 'Users', icon: Users, badge: null }
      ]
    },
    {
      title: 'Marketplace',
      items: [
        { id: 'opportunities', label: 'Opportunities', icon: Briefcase, badge: null },
        { id: 'applications', label: 'Applications', icon: FileText, badge: null },
        { id: 'projects', label: 'Projects', icon: FolderCheck, badge: null }
      ]
    },
    {
      title: 'Moderation',
      items: [
        { id: 'reports', label: 'Reports', icon: ShieldAlert, badge: 'Live' },
        { id: 'portfolios', label: 'Portfolio Moderation', icon: FolderLock, badge: null },
        { id: 'reviews', label: 'Reviews', icon: Star, badge: null }
      ]
    },
    {
      title: 'Configuration',
      items: [
        { id: 'categories', label: 'Categories', icon: FolderTree, badge: null },
        { id: 'roles', label: 'Roles', icon: Tag, badge: null },
        { id: 'skills', label: 'Skills', icon: Code, badge: null }
      ]
    },
    {
      title: 'System',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: null },
        { id: 'audit-logs', label: 'Audit Logs', icon: Clock, badge: null },
        { id: 'settings', label: 'Settings', icon: Settings, badge: null }
      ]
    }
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <AdminDashboard onNavigateTab={setCurrentTab} />;
      case 'users':
        return <AdminUsers />;
      case 'opportunities':
        return <AdminOpportunities />;
      case 'applications':
        return <AdminApplications />;
      case 'projects':
        return <AdminProjects />;
      case 'reports':
        return <AdminReports />;
      case 'portfolios':
        return <AdminModeration key="portfolios" initialTab="portfolios" />;
      case 'reviews':
        return <AdminModeration key="reviews" initialTab="reviews" />;
      case 'categories':
        return <AdminTaxonomy key="categories" initialFocus="categories" />;
      case 'roles':
        return <AdminTaxonomy key="roles" initialFocus="roles" />;
      case 'skills':
        return <AdminTaxonomy key="skills" initialFocus="skills" />;
      case 'notifications':
        return <AdminNotifications onNavigateTab={setCurrentTab} />;
      case 'audit-logs':
        return <AdminAuditLogs />;
      case 'settings':
        return <AdminSettings currentUser={currentUser} />;
      default:
        return <AdminDashboard onNavigateTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-xl px-4 lg:px-8 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 lg:hidden text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-md shadow-rose-900/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                TNEST <span className="bg-gradient-to-r from-rose-400 to-indigo-400 bg-clip-text text-transparent">Admin</span>
              </span>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Control Center v1.0</p>
            </div>
          </div>
        </div>

        {/* Right Header Navigation & Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateMarketplace}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Return to Marketplace</span>
            <span className="sm:hidden">Marketplace</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Admin Avatar & Dropdown */}
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-rose-300">
                {currentUser?.fullName?.charAt(0) || 'A'}
              </div>
            </div>
            <div className="hidden md:block text-left text-xs">
              <p className="font-semibold text-white truncate max-w-[120px]">{currentUser?.fullName || 'System Admin'}</p>
              <p className="text-[10px] text-rose-400 font-mono">ROLE: ADMIN</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
            title="Sign Out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between pt-16 lg:pt-0 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-6 overflow-y-auto flex-1">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-1.5">
                  {section.title}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition group ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40 font-bold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          isActive ? 'bg-white/20 text-white' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 bg-slate-950/40">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Backend: Connected
              </span>
              <span className="font-mono text-[10px]">.NET 10</span>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
