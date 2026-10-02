import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Search,
  Bell,
  MessageSquare,
  Plus,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Menu,
  X,
  FileText,
  FolderKanban,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Shield,
  Briefcase,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles,
  Building2,
  Compass,
  Edit3
} from 'lucide-react';
import { V1_CATEGORIES } from '../data/mockData';
import { api } from '../api';
import { Logo } from './Logo';
import { SettingsModal } from './SettingsModal';
import { calculateUserProfileCompletion } from '../utils/profileCompletion';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

interface AppNotification {
  id: string;
  type: 'proposal' | 'message' | 'project' | 'system' | 'inquiry';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionView?: string;
  actionParams?: any;
}

interface MessageToastItem {
  id: string;
  senderName: string;
  content: string;
  conversationId: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenAuth }) => {
  const { user, isAuthenticated, logout, quickSwitch, activePersona, setActivePersona } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();

  // Dropdown & Modal states
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);
  const [unreadChatsCount, setUnreadChatsCount] = useState<number>(0);
  const [hasNewMessagePing, setHasNewMessagePing] = useState<boolean>(false);
  const [messageToast, setMessageToast] = useState<MessageToastItem | null>(null);

  // Realtime unread messages count polling, SignalR hub connection & live notifications
  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      setUnreadChatsCount(0);
      return;
    }

    let isMounted = true;

    const fetchCounts = async () => {
      try {
        const counts = await api.getUnreadCounts(user.id);
        if (isMounted) {
          setUnreadMessagesCount(counts.unreadMessages);
          setUnreadChatsCount(counts.unreadChats);
        }
      } catch (e) {
        // quiet fallback
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 4000);

    const handleMessagesUpdate = () => {
      fetchCounts();
    };

    window.addEventListener('tnest:messages-updated', handleMessagesUpdate);
    window.addEventListener('tnest:new-message', handleMessagesUpdate);

    // Global SignalR Hub Connection for real-time instant chat count updates & notification toasts
    let hubConnection: signalR.HubConnection | null = null;
    try {
      hubConnection = new signalR.HubConnectionBuilder()
        .withUrl('/hubs/chat')
        .withAutomaticReconnect()
        .build();

      hubConnection.start().then(() => {
        if (user.id && hubConnection?.state === signalR.HubConnectionState.Connected) {
          hubConnection.invoke('JoinUserGroup', user.id).catch(() => {});
        }
      }).catch((err) => {
        console.warn('Navbar SignalR connection fallback to polling:', err);
      });

      hubConnection.on('NewMessageNotification', (notif: any) => {
        if (notif && notif.senderUserId !== user.id) {
          fetchCounts();
          setHasNewMessagePing(true);
          setTimeout(() => setHasNewMessagePing(false), 2500);

          // Show in-app live chat toast banner
          setMessageToast({
            id: notif.id || `toast-${Date.now()}`,
            senderName: notif.senderName || 'New Message',
            content: notif.content || 'Sent you a message',
            conversationId: notif.conversationId
          });
        }
      });

      hubConnection.on('ReceiveMessage', (msg: any) => {
        if (msg && msg.senderUserId !== user.id) {
          fetchCounts();
          setHasNewMessagePing(true);
          setTimeout(() => setHasNewMessagePing(false), 2500);
        }
      });

      hubConnection.on('MessagesUpdated', () => {
        fetchCounts();
      });
    } catch (err) {
      console.warn('SignalR initialization error:', err);
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('tnest:messages-updated', handleMessagesUpdate);
      window.removeEventListener('tnest:new-message', handleMessagesUpdate);
      if (hubConnection) {
        hubConnection.stop().catch(() => {});
      }
    };
  }, [user]);

  // Auto-dismiss message toast after 6 seconds
  useEffect(() => {
    if (!messageToast) return;
    const timer = setTimeout(() => {
      setMessageToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [messageToast]);

  // Mode determination based on active persona
  const isDoer = activePersona === 'doer';
  const isClient = !isDoer;

  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    const storageKey = `tnest_notifs_${user.id || user.email}`;

    // Notification 1: Welcome message
    const welcomeNotif: AppNotification = {
      id: `n-welcome-${user.id || user.email}`,
      type: 'system',
      title: `Welcome to Tnest, ${user.fullName || user.companyName || 'Member'}! 👋`,
      message: 'Welcome to TNest! Explore top opportunities, connect with verified clients and talent, and build your creative brand.',
      time: 'Just now',
      isRead: false,
      actionView: isDoer ? 'opportunities' : 'browse'
    };

    // Notification 2: Complete your profile
    const completeProfileNotif: AppNotification = {
      id: `n-complete-profile-${user.id || user.email}`,
      type: 'system',
      title: 'Complete Your Profile 📝',
      message: (user.role === 'Client' || activePersona === 'client')
        ? 'Complete your company profile and business information to unlock verified hiring badges and post tasks with 100% trust.'
        : 'Complete your specialist profile (bio, skills, portfolio & hourly rate) to boost your ranking and unlock high-paying client matches.',
      time: 'Just now',
      isRead: false,
      actionView: (user.role === 'Client' || activePersona === 'client') ? 'update-client-profile' : 'update-profile'
    };

    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        let parsed: AppNotification[] = JSON.parse(saved);
        
        // Ensure welcome notification is always present at position 0
        const welcomeIndex = parsed.findIndex((n: AppNotification) => 
          n.id.startsWith('n-welcome') || n.title?.toLowerCase().includes('welcome to tnest')
        );
        if (welcomeIndex === -1) {
          parsed.unshift(welcomeNotif);
        } else {
          parsed[welcomeIndex] = { ...welcomeNotif, isRead: parsed[welcomeIndex].isRead };
        }

        // Ensure complete profile notification is always present at position 1
        const profileIndex = parsed.findIndex((n: AppNotification) => 
          n.id.startsWith('n-complete-profile') || n.title?.toLowerCase().includes('complete your profile')
        );
        if (profileIndex === -1) {
          parsed.splice(1, 0, completeProfileNotif);
        } else {
          parsed[profileIndex] = { ...completeProfileNotif, isRead: parsed[profileIndex].isRead };
        }

        // Filter out any obsolete legacy notifications or chat messages (messages are kept in chats only)
        const filtered = parsed.filter((n: AppNotification) => 
          n.type !== 'message' && !n.title?.includes('Escrow Protection Active') && n.id !== 'n-escrow'
        );
        setNotifications(filtered);
        localStorage.setItem(storageKey, JSON.stringify(filtered));
        return;
      } catch {}
    }

    // Role & user-specific initial notifications (1st time logins vs demo personas)
    let initialNotifs: AppNotification[] = [];

    if (user.email === 'client@glowskin.com') {
      initialNotifs = [
        welcomeNotif,
        completeProfileNotif,
        {
          id: 'n-glow-1',
          type: 'proposal',
          title: 'New Proposal Received',
          message: 'Priya Reddy submitted a proposal with 3 UGC video deliverables.',
          time: '10m ago',
          isRead: false,
          actionView: 'my-activity',
          actionParams: { tab: 'posted' }
        },
        {
          id: 'n-glow-2',
          type: 'project',
          title: 'Courier Tracking Active',
          message: 'Courier tracking BD-882941039 updated for product kit shipment.',
          time: '1h ago',
          isRead: false,
          actionView: 'project-tracker',
          actionParams: { projectId: 'mock-proj-1' }
        }
      ];
    } else if (user.email === 'priya.ugc@creator.com') {
      initialNotifs = [
        welcomeNotif,
        completeProfileNotif,
        {
          id: 'n-priya-1',
          type: 'proposal',
          title: 'Client Viewed Proposal',
          message: 'GlowSkin Co. reviewed your video creator proposal.',
          time: '15m ago',
          isRead: false,
          actionView: 'my-activity',
          actionParams: { tab: 'work' }
        },
        {
          id: 'n-priya-2',
          type: 'project',
          title: 'Milestone 1 Funded',
          message: '₹15,000 funded securely for UGC videos.',
          time: '2h ago',
          isRead: false,
          actionView: 'project-tracker',
          actionParams: { projectId: 'mock-proj-1' }
        }
      ];
    } else {
      // 1st time login / new registered users receive exactly the 2 onboarding notifications:
      // 1. Welcome Message
      // 2. Complete Your Profile
      initialNotifs = [
        welcomeNotif,
        completeProfileNotif
      ];
    }

    setNotifications(initialNotifs);
    localStorage.setItem(storageKey, JSON.stringify(initialNotifs));
  }, [user]);

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, isRead: true }));
      if (user) {
        localStorage.setItem(`tnest_notifs_${user.id || user.email}`, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleNotificationClick = (notif: AppNotification) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n));
      if (user) {
        localStorage.setItem(`tnest_notifs_${user.id || user.email}`, JSON.stringify(updated));
      }
      return updated;
    });
    setNotificationsOpen(false);
    if (notif.actionView) {
      onNavigate(notif.actionView, notif.actionParams);
    }
  };

  const catRef = useRef<HTMLDivElement>(null);
  const profRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);



  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
      if (profRef.current && !profRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profileCompletionPercentage = useMemo(() => {
    return calculateUserProfileCompletion(user);
  }, [user]);

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--bg-frosted)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border-subtle)',
      height: '56px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        
        {/* LEFT: BRAND & PRIMARY NAV */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileDrawerOpen(true)}
            className="mobile-hamburger-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'none',
              padding: '6px',
              borderRadius: 'var(--radius-sm)'
            }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          {/* Clean Logo */}
          <div 
            onClick={() => onNavigate('landing')}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <Logo size="sm" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="desktop-nav-links" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            
            {/* ADMIN-SPECIFIC NAV: For Admin users, display ONLY the Admin Dashboard link on the left */}
            {user?.role === 'Admin' ? (
              <button 
                onClick={() => onNavigate('admin')}
                style={{
                  background: currentView === 'admin' ? 'rgba(225, 29, 72, 0.15)' : 'transparent',
                  border: currentView === 'admin' ? '1px solid rgba(225, 29, 72, 0.35)' : '1px solid transparent',
                  color: currentView === 'admin' ? '#E11D48' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(225, 29, 72, 0.12)';
                  e.currentTarget.style.color = '#E11D48';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = currentView === 'admin' ? 'rgba(225, 29, 72, 0.15)' : 'transparent';
                  e.currentTarget.style.color = currentView === 'admin' ? '#E11D48' : 'var(--text-secondary)';
                }}
              >
                <Shield size={15} color="#E11D48" />
                <span>Admin Dashboard</span>
              </button>
            ) : (
              <>
                {/* 1. Home */}
                <button 
                  onClick={() => onNavigate('landing')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentView === 'landing' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: currentView === 'landing' ? 600 : 450,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color 0.15s ease, background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Home
                </button>

                {/* 1. Browse Talent */}
                <button 
                  onClick={() => onNavigate('browse')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentView === 'browse' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: currentView === 'browse' ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color 0.15s ease, background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Browse Talent
                </button>

                {/* 2. Post a Project / Post Task */}
                <button 
                  onClick={() => {
                    if (!isAuthenticated) onOpenAuth('login');
                    else onNavigate('wizard');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentView === 'wizard' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: currentView === 'wizard' ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color 0.15s ease, background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Post a Project
                </button>

                {/* 3. How it Works */}
                <button
                  onClick={() => onNavigate('how-it-works')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentView === 'how-it-works' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: currentView === 'how-it-works' ? 600 : 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color 0.15s ease, background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  How it Works
                </button>

                {/* 4. Resources / Categories Dropdown */}
                <div ref={catRef} style={{ position: 'relative' }}>
                  <button 
                    onClick={() => setCategoriesOpen(!categoriesOpen)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: categoriesOpen ? 'var(--accent-primary)' : 'var(--text-secondary)',
                      fontWeight: 500,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '6px 12px',
                      borderRadius: 'var(--radius-sm)',
                      transition: 'color 0.15s ease, background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span>Resources</span>
                    <ChevronDown size={13} style={{ transform: categoriesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease', color: 'var(--text-muted)' }} />
                  </button>

                  {categoriesOpen && (
                    <div 
                      className="card"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        width: '280px',
                        padding: '8px',
                        zIndex: 200,
                        boxShadow: 'var(--shadow-dropdown)',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', padding: '6px 10px 4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Disciplines & Skills
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '320px', overflowY: 'auto' }}>
                        {V1_CATEGORIES.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setCategoriesOpen(false);
                              onNavigate('opportunities', { category: cat.slug });
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              color: 'var(--text-primary)',
                              transition: 'background-color 0.15s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{cat.name}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.roles.length} roles</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. About */}
                <button
                  onClick={() => onNavigate('how-it-works')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    fontWeight: 500,
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'color 0.15s ease, background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  About
                </button>
              </>
            )}

          </nav>

        </div>

        {/* RIGHT: CTAs & AUTH */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Header CTA for Logged In Users */}
          {isAuthenticated && (user?.role === 'Client' || user?.role === 'DualRole') && (
            <button
              onClick={() => onNavigate('wizard')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Plus size={14} />
              <span>Post Task</span>
            </button>
          )}

          {isAuthenticated && user?.role === 'Professional' && (
            <button
              onClick={() => onNavigate('opportunities')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Compass size={14} />
              <span>Browse Opportunities</span>
            </button>
          )}

          {!isAuthenticated ? (
            /* Public Auth Buttons matching Theme 1 */
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={() => onOpenAuth('login')}
                style={{
                  background: 'none',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 18px',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: '#FFFFFF'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Log In
              </button>

              <button
                onClick={() => onOpenAuth('register')}
                style={{
                  background: 'linear-gradient(135deg, #C28E2B 0%, #D97706 100%)',
                  border: 'none',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 20px',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(194, 142, 43, 0.3)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.92'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                Sign Up
              </button>
            </div>
          ) : (
            /* Logged In User Controls */
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              
              {/* Messages with unread badge */}
              <button
                onClick={() => {
                  onNavigate('messages');
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: currentView === 'messages' ? 'var(--accent-subtle)' : 'none',
                  border: currentView === 'messages' ? '1px solid var(--accent-border)' : '1px solid var(--border-subtle)',
                  color: currentView === 'messages' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.15s ease'
                }}
                title={unreadMessagesCount > 0 ? `${unreadMessagesCount} unread message${unreadMessagesCount > 1 ? 's' : ''}` : "Messages"}
              >
                <MessageSquare size={16} />
                {unreadMessagesCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '17px',
                    height: '17px',
                    padding: '0 4px',
                    borderRadius: '9px',
                    backgroundColor: 'var(--accent-primary)',
                    color: '#FFFFFF',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 5px rgba(217, 119, 6, 0.45)',
                    border: '1.5px solid var(--bg-card)',
                    pointerEvents: 'none',
                    lineHeight: 1,
                    animation: hasNewMessagePing ? 'pulse 1s infinite' : 'none'
                  }}>
                    {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                  </span>
                )}
              </button>

              {/* Notifications with numeric count badge */}
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: notificationsOpen ? 'var(--bg-tertiary)' : 'none',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadNotificationCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      minWidth: '16px',
                      height: '16px',
                      padding: '0 4px',
                      borderRadius: '8px',
                      backgroundColor: '#E11D48',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(225, 29, 72, 0.4)',
                      border: '1.5px solid var(--bg-card)',
                      pointerEvents: 'none',
                      lineHeight: 1
                    }}>
                      {unreadNotificationCount}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '330px',
                      padding: '14px',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-dropdown)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Notifications</span>
                        {unreadNotificationCount > 0 && (
                          <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            {unreadNotificationCount} new
                          </span>
                        )}
                      </div>
                      {unreadNotificationCount > 0 && (
                        <button
                          onClick={handleMarkAllNotificationsRead}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 500 }}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '20px 10px', color: 'var(--text-muted)' }}>
                        <CheckCircle2 size={22} style={{ margin: '0 auto 6px', color: 'var(--status-success)' }} />
                        <p style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>You're all caught up!</p>
                        <span style={{ fontSize: '0.72rem' }}>No new notifications at this time.</span>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '290px', overflowY: 'auto' }}>
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            style={{
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: n.isRead ? 'transparent' : 'var(--accent-subtle)',
                              border: n.isRead ? '1px solid transparent' : '1px solid var(--accent-border)',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (n.isRead) e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)';
                            }}
                            onMouseLeave={(e) => {
                              if (n.isRead) e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                              {!n.isRead && (
                                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', flexShrink: 0 }} />
                              )}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.message}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '5px' }}>{n.time}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Settings & Preferences Button */}
              <button
                onClick={() => setSettingsOpen(true)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
                title="Settings"
              >
                <Settings size={15} />
              </button>

              {/* Profile Avatar & Menu */}
              <div ref={profRef} style={{ position: 'relative', marginLeft: '4px' }}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '2px',
                    position: 'relative'
                  }}
                  title={`Profile completion: ${profileCompletionPercentage}%`}
                >
                  {/* Avatar with Circular Completion Ring */}
                  <div style={{ position: 'relative', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="36" height="36" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="transparent"
                        stroke="var(--border-subtle)"
                        strokeWidth="2.5"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="transparent"
                        stroke={profileCompletionPercentage >= 100 ? 'var(--status-success)' : 'var(--accent-primary)'}
                        strokeWidth="2.5"
                        strokeDasharray={2 * Math.PI * 16}
                        strokeDashoffset={2 * Math.PI * 16 * (1 - profileCompletionPercentage / 100)}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
                      />
                    </svg>
                    <img
                      src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                      alt={user?.fullName || 'User'}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Completion percentage pill tag */}
                    <span style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      fontSize: '0.58rem',
                      fontWeight: 700,
                      backgroundColor: profileCompletionPercentage >= 100 ? '#10B981' : 'var(--bg-card)',
                      color: profileCompletionPercentage >= 100 ? '#FFFFFF' : 'var(--accent-primary)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      padding: '0 3px',
                      lineHeight: '12px'
                    }}>
                      {profileCompletionPercentage}%
                    </span>
                  </div>
                  <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
                </button>

                {profileMenuOpen && (
                  <div
                    className="card"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      width: '270px',
                      padding: '10px',
                      zIndex: 200,
                      boxShadow: 'var(--shadow-dropdown)',
                      backgroundColor: 'var(--bg-card)'
                    }}
                  >
                    {/* User Identity */}
                    <div style={{ padding: '6px 8px 10px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.88rem', color: 'var(--text-primary)', display: 'block' }}>{user?.fullName}</strong>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{user?.email}</span>
                        </div>
                        <span className={`badge ${
                          user?.role === 'Admin' ? 'badge-rose' :
                          user?.role === 'Professional' ? 'badge-primary' :
                          user?.role === 'DualRole' ? 'badge-amber' :
                          'badge-primary'
                        }`} style={{ fontSize: '0.66rem', textTransform: 'capitalize' }}>
                          {user?.role === 'Admin' ? 'Admin' :
                           user?.role === 'Professional' ? 'Doer' :
                           user?.role === 'DualRole' ? 'Dual Role' :
                           'Client'}
                        </span>
                      </div>

                      {/* Mode Switcher: ONLY for Dual Role accounts */}
                      {user?.role === 'DualRole' && (
                        <div style={{
                          marginTop: '8px',
                          padding: '3px',
                          backgroundColor: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-sm)',
                          display: 'grid',
                          gridTemplateColumns: '1fr 1fr',
                          gap: '4px'
                        }}>
                          <button
                            type="button"
                            onClick={() => {
                              setActivePersona('doer');
                              if (currentView === 'client-dashboard' || currentView === 'pro-dashboard') {
                                onNavigate('pro-dashboard');
                              }
                            }}
                            style={{
                              padding: '5px 8px',
                              fontSize: '0.78rem',
                              fontWeight: isDoer ? 700 : 500,
                              backgroundColor: isDoer ? 'var(--bg-card)' : 'transparent',
                              color: isDoer ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              border: 'none',
                              borderRadius: 'var(--radius-xs)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: isDoer ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <Briefcase size={12} color={isDoer ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                            <span>Doer Mode</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setActivePersona('client');
                              if (currentView === 'pro-dashboard' || currentView === 'client-dashboard') {
                                onNavigate('client-dashboard');
                              }
                            }}
                            style={{
                              padding: '5px 8px',
                              fontSize: '0.78rem',
                              fontWeight: !isDoer ? 700 : 500,
                              backgroundColor: !isDoer ? 'var(--bg-card)' : 'transparent',
                              color: !isDoer ? 'var(--accent-primary)' : 'var(--text-secondary)',
                              border: 'none',
                              borderRadius: 'var(--radius-xs)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              boxShadow: !isDoer ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <FolderKanban size={12} color={!isDoer ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                            <span>Client Mode</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Role-Exclusive Navigation Items */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {/* 1. Client Role Menu: ONLY Client Dashboard named "My Dashboard" */}
                      {user?.role === 'Client' && (
                        <>
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              onNavigate('client-dashboard');
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <FolderKanban size={15} color="var(--accent-primary)" />
                            <span style={{ fontWeight: 600 }}>My Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              onNavigate('client-profile');
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <UserIcon size={15} color="var(--text-muted)" />
                            <span>My Profile</span>
                          </button>
                        </>
                      )}

                      {/* 2. Professional / Doer Role Menu: ONLY Doer Dashboard named "My Dashboard" */}
                      {user?.role === 'Professional' && (
                        <>
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              onNavigate('pro-dashboard');
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Briefcase size={15} color="var(--accent-primary)" />
                            <span style={{ fontWeight: 600 }}>My Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              onNavigate('profile', { slug: user?.slug || 'my-profile' });
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <UserIcon size={15} color="var(--text-muted)" />
                            <span>My Profile</span>
                          </button>
                        </>
                      )}

                      {/* 3. Dual Role Menu: BOTH Client Dashboard and Doer Dashboard */}
                      {user?.role === 'DualRole' && (
                        <>
                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              onNavigate('client-dashboard');
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <FolderKanban size={15} color="var(--accent-primary)" />
                            <span>Client Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              onNavigate('pro-dashboard');
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <Briefcase size={15} color="var(--accent-primary)" />
                            <span>Doer Dashboard</span>
                          </button>

                          <button
                            onClick={() => {
                              setProfileMenuOpen(false);
                              if (isDoer) onNavigate('profile', { slug: user?.slug || 'my-profile' });
                              else onNavigate('client-profile');
                            }}
                            style={{
                              width: '100%',
                              textAlign: 'left',
                              padding: '8px 10px',
                              background: 'none',
                              border: 'none',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                          >
                            <UserIcon size={15} color="var(--text-muted)" />
                            <span>My Profile</span>
                          </button>
                        </>
                      )}

                      {/* 4. Admin Role Menu: ONLY Admin Dashboard named My Dashboard */}
                      {user?.role === 'Admin' && (
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            onNavigate('admin');
                          }}
                          style={{
                            width: '100%',
                            textAlign: 'left',
                            padding: '8px 10px',
                            background: 'none',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            color: '#E11D48',
                            fontSize: '0.85rem',
                            fontWeight: 600
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <Shield size={15} color="#E11D48" />
                          <span>My Dashboard</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onNavigate('messages');
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          background: 'none',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <MessageSquare size={15} color="var(--accent-primary)" />
                          <span>Messages</span>
                        </div>
                        {unreadMessagesCount > 0 && (
                          <span style={{
                            padding: '1px 6px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--accent-primary)',
                            color: '#FFFFFF',
                            fontSize: '0.68rem',
                            fontWeight: 700
                          }}>
                            {unreadMessagesCount}
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          setSettingsOpen(true);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          background: 'none',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Settings size={15} color="var(--text-muted)" />
                        <span>Settings</span>
                      </button>

                      <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }} />

                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          logout();
                          onNavigate('landing');
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          background: 'none',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: 'var(--status-danger)',
                          fontSize: '0.85rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--status-danger-bg)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* MOBILE DRAWER */}
      {mobileDrawerOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex'
          }}
          onClick={() => setMobileDrawerOpen(false)}
        >
          <div 
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: 'var(--bg-card)',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-modal)',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <Logo size="sm" />
                <button 
                  onClick={() => setMobileDrawerOpen(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Mobile Mode Switcher - ONLY for Dual Role */}
              {isAuthenticated && user?.role === 'DualRole' && (
                <div style={{
                  padding: '10px',
                  backgroundColor: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '16px',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                    Viewing as:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', backgroundColor: 'var(--bg-tertiary)', padding: '2px', borderRadius: 'var(--radius-xs)' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setActivePersona('doer');
                        setMobileDrawerOpen(false);
                        onNavigate('pro-dashboard');
                      }}
                      style={{
                        padding: '6px',
                        fontSize: '0.78rem',
                        fontWeight: isDoer ? 700 : 500,
                        backgroundColor: isDoer ? 'var(--bg-card)' : 'transparent',
                        color: isDoer ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Briefcase size={12} color={isDoer ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                      <span>Doer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setActivePersona('client');
                        setMobileDrawerOpen(false);
                        onNavigate('client-dashboard');
                      }}
                      style={{
                        padding: '6px',
                        fontSize: '0.78rem',
                        fontWeight: !isDoer ? 700 : 500,
                        backgroundColor: !isDoer ? 'var(--bg-card)' : 'transparent',
                        color: !isDoer ? 'var(--accent-primary)' : 'var(--text-secondary)',
                        border: 'none',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <FolderKanban size={12} color={!isDoer ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                      <span>Client</span>
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {user?.role === 'Admin' ? (
                  <>
                    <button
                      onClick={() => { setMobileDrawerOpen(false); onNavigate('admin'); }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px', background: currentView === 'admin' ? 'rgba(225, 29, 72, 0.15)' : 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: '#E11D48', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <Shield size={16} color="#E11D48" />
                      <span>Admin Dashboard</span>
                    </button>
                    <button
                      onClick={() => { setMobileDrawerOpen(false); onNavigate('messages'); }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}
                    >
                      Messages {unreadMessagesCount > 0 ? `(${unreadMessagesCount})` : ''}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setMobileDrawerOpen(false); onNavigate('landing'); }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}
                    >
                      Home
                    </button>
                    {(!isAuthenticated || user?.role === 'Professional' || user?.role === 'DualRole') && (
                      <button
                        onClick={() => { setMobileDrawerOpen(false); onNavigate('opportunities'); }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}
                      >
                        Browse Opportunities
                      </button>
                    )}
                    {(!isAuthenticated || user?.role === 'Client' || user?.role === 'DualRole') && (
                      <button
                        onClick={() => { setMobileDrawerOpen(false); onNavigate('browse'); }}
                        style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}
                      >
                        Find Doers
                      </button>
                    )}
                    <button
                      onClick={() => { setMobileDrawerOpen(false); onNavigate('how-it-works'); }}
                      style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}
                    >
                      How It Works
                    </button>

                    {isAuthenticated && (
                      <>
                        <button
                          onClick={() => { setMobileDrawerOpen(false); onNavigate('messages'); }}
                          style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <span>Messages</span>
                          {unreadMessagesCount > 0 && (
                            <span className="badge badge-primary" style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                              {unreadMessagesCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => { 
                            setMobileDrawerOpen(false); 
                            setNotificationsOpen(true);
                          }}
                          style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <span>Notifications</span>
                          {unreadNotificationCount > 0 && (
                            <span className="badge badge-danger" style={{ fontSize: '0.72rem', padding: '2px 7px' }}>
                              {unreadNotificationCount}
                            </span>
                          )}
                        </button>
                        
                        <button
                          onClick={() => { 
                            setMobileDrawerOpen(false); 
                            if (user?.role === 'Professional') onNavigate('profile', { slug: user?.slug || 'my-profile' });
                            else onNavigate('client-profile');
                          }}
                          style={{ width: '100%', textAlign: 'left', padding: '10px', background: 'none', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}
                        >
                          My Profile
                        </button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              {!isDoer && user?.role !== 'Admin' && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    if (!isAuthenticated) onOpenAuth('login');
                    else onNavigate('wizard');
                  }}
                  className="btn btn-primary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Plus size={16} />
                  <span>Post Task</span>
                </button>
              )}
              {!isAuthenticated ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button onClick={() => { setMobileDrawerOpen(false); onOpenAuth('login'); }} className="btn btn-secondary">Log In</button>
                  <button onClick={() => { setMobileDrawerOpen(false); onOpenAuth('register'); }} className="btn btn-secondary">Join</button>
                </div>
              ) : (
                <button onClick={() => { setMobileDrawerOpen(false); logout(); onNavigate('landing'); }} className="btn btn-danger">Log Out</button>
              )}

              {isAuthenticated && (
                <button
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    setSettingsOpen(true);
                  }}
                  className="btn btn-secondary"
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Settings size={15} />
                  <span>Settings</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal - Only for Authenticated Users */}
      {isAuthenticated && settingsOpen && (
        <SettingsModal onClose={() => setSettingsOpen(false)} />
      )}

      {/* Real-time Message Notification Toast Banner */}
      {messageToast && (
        <div
          style={{
            position: 'fixed',
            top: '74px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--accent-border)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
            padding: '14px 16px',
            width: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-primary)'
              }}>
                <MessageSquare size={14} />
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {messageToast.senderName}
              </span>
            </div>
            <button
              onClick={() => setMessageToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex'
              }}
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>

          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: 1.35,
            maxHeight: '42px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {messageToast.content}
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '2px' }}>
            <button
              onClick={() => {
                const convId = messageToast.conversationId;
                setMessageToast(null);
                onNavigate('messages', { conversationId: convId });
              }}
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '0.75rem',
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Reply</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
