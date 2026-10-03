import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as signalR from '@microsoft/signalr';
import { api, CHAT_HUB_URL } from '../api';
import { ConversationItem, ChatMessageItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Send, 
  Search, 
  CheckCheck, 
  Clock, 
  ArrowLeft, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  User as UserIcon, 
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  FileText,
  Filter,
  Check,
  Plus,
  X,
  Users
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';
import { formatRelativeTime, formatMessageTime } from '../utils/timeAgo';

interface ChatRoomProps {
  initialConversationId?: string;
  targetUserId?: string;
  targetName?: string;
  targetRole?: string;
  targetAvatar?: string;
  requirementId?: string;
  requirementTitle?: string;
  clientProfileId?: string;
  professionalProfileId?: string;
  initialMessage?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ 
  initialConversationId,
  targetUserId,
  targetName,
  targetRole,
  targetAvatar,
  requirementId,
  requirementTitle,
  clientProfileId,
  professionalProfileId,
  initialMessage,
  onNavigate 
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [activeConvDetails, setActiveConvDetails] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);
  const [mobileShowThread, setMobileShowThread] = useState(false);

  // New Chat Modal state
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [newChatTargetName, setNewChatTargetName] = useState('');
  const [newChatTopic, setNewChatTopic] = useState('');
  const [newChatInitialMsg, setNewChatInitialMsg] = useState('');
  const [isStartingNewChat, setIsStartingNewChat] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(activeConvId);
  const prevMessagesLengthRef = useRef<number>(0);

  useEffect(() => {
    activeConvIdRef.current = activeConvId;
  }, [activeConvId]);

  const isUserNearBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const threshold = 120;
    return container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
  };

  const scrollToBottom = (smooth = true) => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  const loadConversations = async (silent = false) => {
    if (!user) return;
    try {
      const list = await api.getUserConversations(user.id);
      if (list && Array.isArray(list)) {
        setConversations(prev => {
          if (
            prev.length === list.length &&
            prev.every((c, i) => 
              c.id === list[i].id && 
              c.lastMessage === list[i].lastMessage && 
              c.unreadCount === list[i].unreadCount &&
              c.lastMessageAtUtc === list[i].lastMessageAtUtc
            )
          ) {
            return prev;
          }
          return list;
        });

        if (!activeConvIdRef.current && list.length > 0 && !targetName && !requirementId) {
          setActiveConvId(list[0].id);
        }
      }
    } catch (err) {
      if (!silent) console.warn('Error loading conversations:', err);
    }
  };

  // Handle direct navigation to a chat
  useEffect(() => {
    if (initialConversationId) {
      setActiveConvId(initialConversationId);
      setMobileShowThread(true);
      return;
    }

    const initDirectChat = async () => {
      if (!user) return;
      if (targetName || requirementId || clientProfileId || professionalProfileId || targetUserId) {
        try {
          const conv = await api.startConversation({
            senderUserId: user.id,
            senderRole: user.role || 'Client',
            clientProfileId: clientProfileId,
            professionalProfileId: professionalProfileId,
            recipientUserId: targetUserId,
            recipientName: targetName,
            requirementId: requirementId,
            initialMessage: initialMessage
          });
          if (conv && conv.id) {
            setActiveConvId(conv.id);
            setActiveConvDetails(conv);
            setMobileShowThread(true);
            await loadConversations(true);
          }
        } catch (err) {
          console.warn('Could not start direct conversation:', err);
          const syntheticId = 'conv-' + (requirementId || 'direct') + '-' + Date.now();
          const fallbackConv: ConversationItem = {
            id: syntheticId,
            clientProfileId: clientProfileId || user.clientProfileId || '',
            clientName: user.role === 'Professional' ? (targetName || 'Verified Client') : (user.fullName || 'Client'),
            clientAvatar: targetAvatar,
            professionalProfileId: professionalProfileId || user.professionalProfileId || '',
            professionalName: user.role === 'Professional' ? (user.fullName || 'Doer') : (targetName || 'Creative Specialist'),
            professionalAvatar: targetAvatar,
            requirementId: requirementId,
            requirementTitle: requirementTitle,
            lastMessageAtUtc: new Date().toISOString(),
            lastMessage: initialMessage || 'Direct conversation ready',
            unreadCount: 0
          };
          setConversations(prev => [fallbackConv, ...prev.filter(c => c.id !== syntheticId)]);
          setActiveConvId(syntheticId);
          setActiveConvDetails(fallbackConv);
          setMobileShowThread(true);
        }
      }
    };

    initDirectChat();
  }, [initialConversationId, targetName, requirementId, clientProfileId, professionalProfileId, targetUserId, initialMessage, user]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => loadConversations(true), 4000);
    return () => clearInterval(interval);
  }, [user]);

  // SignalR setup
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(CHAT_HUB_URL)
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      setHubConnection(connection);
    }).catch(err => {
      console.warn('SignalR fallback to REST polling:', err);
    });

    return () => {
      connection.stop().catch(() => {});
    };
  }, []);

  // Listen to incoming messages & join room
  useEffect(() => {
    if (!hubConnection || !activeConvId) return;

    if (hubConnection.state === signalR.HubConnectionState.Connected) {
      hubConnection.invoke('JoinConversation', activeConvId).catch(() => {});
    }

    const messageHandler = (msg: ChatMessageItem) => {
      if (msg.conversationId === activeConvIdRef.current) {
        const wasNearBottom = isUserNearBottom();
        setMessages(prev => {
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        if (wasNearBottom || msg.senderUserId === user?.id) {
          setTimeout(() => scrollToBottom(true), 50);
        }
      }
      loadConversations(true);
      window.dispatchEvent(new CustomEvent('tnest:messages-updated'));
    };

    hubConnection.on('ReceiveMessage', messageHandler);

    return () => {
      hubConnection.off('ReceiveMessage', messageHandler);
      if (hubConnection.state === signalR.HubConnectionState.Connected) {
        hubConnection.invoke('LeaveConversation', activeConvId).catch(() => {});
      }
    };
  }, [hubConnection, activeConvId, user]);

  const loadMessages = async (isInitialForConv = false) => {
    if (!activeConvId) return;
    try {
      const data = await api.getConversationMessages(activeConvId);
      if (data && data.conversation) {
        setActiveConvDetails(data.conversation);
        const newMsgs = data.messages || [];
        
        setMessages(prev => {
          if (
            prev.length === newMsgs.length &&
            (prev.length === 0 || prev[prev.length - 1].id === newMsgs[newMsgs.length - 1]?.id)
          ) {
            return prev;
          }

          const wasNearBottom = isUserNearBottom();
          const hasNewMessages = newMsgs.length > prev.length;

          if (isInitialForConv || (hasNewMessages && wasNearBottom)) {
            setTimeout(() => scrollToBottom(!isInitialForConv), 50);
          }

          return newMsgs;
        });

        setConversations(prev => prev.map(c => c.id === activeConvId ? { ...c, unreadCount: 0 } : c));
        window.dispatchEvent(new CustomEvent('tnest:messages-updated'));
      }
    } catch (err) {
      console.warn('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    if (activeConvId) {
      prevMessagesLengthRef.current = 0;
      loadMessages(true);
      const interval = setInterval(() => loadMessages(false), 3000);
      return () => clearInterval(interval);
    }
  }, [activeConvId]);

  const handleSendMessage = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || inputText).trim();
    if (!textToSend || !activeConvId || !user || isSending) return;

    if (!customText) setInputText('');
    setIsSending(true);

    try {
      const newMsg = await api.sendMessage(activeConvId, {
        senderUserId: user.id,
        senderRole: user.role || 'Client',
        content: textToSend
      });

      if (newMsg) {
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(() => scrollToBottom(true), 50);
      }
      loadConversations(true);
      window.dispatchEvent(new CustomEvent('tnest:messages-updated'));
    } catch (err) {
      if (hubConnection && hubConnection.state === signalR.HubConnectionState.Connected) {
        try {
          await hubConnection.invoke('SendMessage', activeConvId, user.id, user.role || 'Client', textToSend, null, null, null);
          setTimeout(() => scrollToBottom(true), 50);
          window.dispatchEvent(new CustomEvent('tnest:messages-updated'));
        } catch (hubErr) {
          console.error('Failed to send message via hub:', hubErr);
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  // Helper to determine if a message is sent by the logged-in user
  const checkIsMine = (m: ChatMessageItem) => {
    if (!user) return false;
    const msgUserId = m.senderUserId ? m.senderUserId.toLowerCase() : '';
    const myUserId = user.id ? user.id.toLowerCase() : '';
    const myClientProfileId = user.clientProfileId ? user.clientProfileId.toLowerCase() : '';
    const myProProfileId = user.professionalProfileId ? user.professionalProfileId.toLowerCase() : '';

    if (msgUserId && (msgUserId === myUserId || msgUserId === myClientProfileId || msgUserId === myProProfileId)) {
      return true;
    }

    if (m.senderRole && user.role && m.senderRole.toLowerCase() === user.role.toLowerCase()) {
      if (user.role.toLowerCase() === 'client' && activeConvDetails?.clientProfileId && user.clientProfileId) {
        return activeConvDetails.clientProfileId.toLowerCase() === user.clientProfileId.toLowerCase();
      }
      if (user.role.toLowerCase() === 'professional' && activeConvDetails?.professionalProfileId && user.professionalProfileId) {
        return activeConvDetails.professionalProfileId.toLowerCase() === user.professionalProfileId.toLowerCase();
      }
    }

    return false;
  };

  const filteredConversations = useMemo(() => {
    let list = conversations;
    if (activeTab === 'unread') {
      list = list.filter(c => (c.unreadCount || 0) > 0);
    }
    if (!searchFilter.trim()) return list;
    const q = searchFilter.toLowerCase();
    return list.filter(c => {
      const otherName = (c.clientProfileId === user?.clientProfileId || (c.clientName && user?.fullName && c.clientName.toLowerCase() === user.fullName.toLowerCase()))
        ? (c.professionalName || 'Doer')
        : (c.clientName || 'Client');
      return (
        otherName.toLowerCase().includes(q) ||
        (c.requirementTitle && c.requirementTitle.toLowerCase().includes(q)) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(q))
      );
    });
  }, [conversations, searchFilter, activeTab, user]);

  const activeInterlocutor = useMemo(() => {
    if (!activeConvDetails) {
      const current = conversations.find(c => c.id === activeConvId);
      if (!current) {
        return {
          name: targetName || 'Direct Conversation',
          avatar: targetAvatar || null,
          role: targetRole || (user?.role === 'Professional' ? 'Client' : 'Doer'),
          slug: null,
          title: requirementTitle || null,
          id: clientProfileId || professionalProfileId || targetUserId || null
        };
      }
      const isClientView = (current.clientProfileId === user?.clientProfileId || (current.clientName && user?.fullName && current.clientName.toLowerCase() === user.fullName.toLowerCase()));
      return {
        name: isClientView ? (current.professionalName || 'Doer') : (current.clientName || 'Client'),
        avatar: isClientView ? current.professionalAvatar : current.clientAvatar,
        role: isClientView ? 'Doer' : 'Client',
        slug: null,
        title: current.requirementTitle,
        id: isClientView ? current.professionalProfileId : current.clientProfileId
      };
    }

    const isClientView = (activeConvDetails.clientProfileId === user?.clientProfileId || (activeConvDetails.clientName && user?.fullName && activeConvDetails.clientName.toLowerCase() === user.fullName.toLowerCase()));
    return {
      name: isClientView ? (activeConvDetails.professionalName || 'Doer') : (activeConvDetails.clientName || 'Client'),
      avatar: isClientView ? activeConvDetails.professionalAvatar : activeConvDetails.clientAvatar,
      role: isClientView ? 'Doer' : 'Client',
      slug: activeConvDetails.professionalSlug,
      title: activeConvDetails.requirementTitle,
      id: isClientView ? activeConvDetails.professionalProfileId : activeConvDetails.clientProfileId
    };
  }, [activeConvDetails, conversations, activeConvId, user, targetName, targetAvatar, targetRole, requirementTitle, clientProfileId, professionalProfileId, targetUserId]);

  const handleStartNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatTargetName.trim() || !user || isStartingNewChat) return;
    setIsStartingNewChat(true);
    try {
      const conv = await api.startConversation({
        senderUserId: user.id,
        senderRole: user.role || 'Client',
        recipientName: newChatTargetName.trim(),
        initialMessage: newChatInitialMsg.trim() || `Hi ${newChatTargetName.trim()}! I'd like to connect regarding ${newChatTopic.trim() || 'a creative task'}.`
      });
      if (conv && conv.id) {
        setActiveConvId(conv.id);
        setActiveConvDetails(conv);
        setIsNewChatModalOpen(false);
        setNewChatTargetName('');
        setNewChatTopic('');
        setNewChatInitialMsg('');
        setMobileShowThread(true);
        await loadConversations(true);
      }
    } catch (err) {
      console.warn('Failed to start new chat:', err);
      const syntheticId = 'conv-direct-' + Date.now();
      const fallbackConv: ConversationItem = {
        id: syntheticId,
        clientProfileId: user.clientProfileId || '',
        clientName: user.role === 'Professional' ? newChatTargetName.trim() : (user.fullName || 'Client'),
        clientAvatar: undefined,
        professionalProfileId: user.professionalProfileId || '',
        professionalName: user.role === 'Professional' ? (user.fullName || 'Doer') : newChatTargetName.trim(),
        professionalAvatar: undefined,
        requirementTitle: newChatTopic.trim() || 'Direct Inquiry',
        lastMessageAtUtc: new Date().toISOString(),
        lastMessage: newChatInitialMsg.trim() || `Hi ${newChatTargetName.trim()}! Let's connect.`,
        unreadCount: 0
      };
      setConversations(prev => [fallbackConv, ...prev]);
      setActiveConvId(syntheticId);
      setActiveConvDetails(fallbackConv);
      setIsNewChatModalOpen(false);
      setNewChatTargetName('');
      setNewChatTopic('');
      setNewChatInitialMsg('');
      setMobileShowThread(true);
    } finally {
      setIsStartingNewChat(false);
    }
  };

  const quickChips = [
    "What is your estimated timeline?",
    "Can you share relevant work samples?",
    "Ready to discuss milestone details",
    "Looks great, let's proceed with this!"
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: 'calc(100vh - 70px)', paddingBottom: '40px' }}>
      <div className="container" style={{ padding: '16px 20px 24px', maxWidth: '1240px' }}>
        
        {/* Top Breadcrumb & Trust Banner */}
        <div style={{ marginBottom: '16px' }}>
          <BreadcrumbNav
            items={[
              { label: user?.role === 'Professional' ? 'Doer Workspace' : 'Client Workspace', view: user?.role === 'Professional' ? 'pro-dashboard' : 'client-dashboard' },
              { label: 'Messages & Inquiries', active: true }
            ]}
            backLabel="Back"
            onNavigate={onNavigate}
            rightElement={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsNewChatModalOpen(true)}
                  className="btn btn-primary btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}
                >
                  <Plus size={13} /> New Message
                </button>
                <span className="badge badge-primary" style={{ fontSize: '0.75rem', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <ShieldCheck size={13} /> 100% Secure & Protected Payment
                </span>
              </div>
            }
          />
        </div>

        {/* Main Chat App Window */}
        <div 
          className="card" 
          style={{ 
            height: 'calc(100vh - 175px)', 
            minHeight: '620px',
            maxHeight: '860px',
            display: 'grid', 
            gridTemplateColumns: '350px 1fr', 
            overflow: 'hidden',
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-medium)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)'
          }}
        >
          
          {/* =========================================
              LEFT SIDEBAR: CONVERSATION LIST
          ========================================= */}
          <div 
            style={{ 
              borderRight: '1px solid var(--border-subtle)', 
              display: (mobileShowThread && window.innerWidth <= 768) ? 'none' : 'flex', 
              flexDirection: 'column', 
              backgroundColor: 'var(--bg-card)',
              overflow: 'hidden'
            }}
          >
            
            {/* Sidebar Top Header */}
            <div style={{ padding: '18px 20px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                    Messages
                  </h2>
                  <span style={{ 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    backgroundColor: 'var(--bg-secondary)', 
                    color: 'var(--text-secondary)',
                    padding: '2px 8px', 
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {conversations.length}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    title="Start a direct message"
                  >
                    <Plus size={12} /> New
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)', boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)' }} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--status-success)', fontWeight: 600 }}>Live</span>
                  </div>
                </div>
              </div>

              {/* Search Bar */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                padding: '7px 12px', 
                backgroundColor: 'var(--bg-secondary)', 
                borderRadius: 'var(--radius-sm)', 
                border: '1px solid var(--border-subtle)',
                transition: 'border-color 0.2s ease'
              }}>
                <Search size={14} color="var(--text-muted)" />
                <input 
                  type="text"
                  placeholder="Search chats, tasks, or names..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-primary)', 
                    fontSize: '0.82rem', 
                    width: '100%', 
                    outline: 'none' 
                  }}
                />
                {searchFilter && (
                  <button 
                    onClick={() => setSearchFilter('')}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 0, fontSize: '0.75rem' }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: activeTab === 'all' ? 600 : 500,
                    borderRadius: '12px',
                    backgroundColor: activeTab === 'all' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'all' ? '#FFFFFF' : 'var(--text-muted)',
                    border: activeTab === 'all' ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  All Chats
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('unread')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontWeight: activeTab === 'unread' ? 600 : 500,
                    borderRadius: '12px',
                    backgroundColor: activeTab === 'unread' ? 'var(--accent-primary)' : 'transparent',
                    color: activeTab === 'unread' ? '#FFFFFF' : 'var(--text-muted)',
                    border: activeTab === 'unread' ? '1px solid var(--accent-primary)' : '1px solid transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Unread
                </button>
              </div>
            </div>

            {/* Conversation Items List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {filteredConversations.length === 0 ? (
                <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <MessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    No conversations found
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                    {searchFilter ? 'Try a different search keyword' : 'Direct inquiries and proposal chats will appear here.'}
                  </p>
                </div>
              ) : (
                filteredConversations.map((c) => {
                  const isSelected = c.id === activeConvId;
                  const isClientView = (c.clientProfileId === user?.clientProfileId || (c.clientName && user?.fullName && c.clientName.toLowerCase() === user.fullName.toLowerCase()));
                  const otherName = isClientView ? (c.professionalName || 'Doer') : (c.clientName || 'Client');
                  const otherAvatar = isClientView ? c.professionalAvatar : c.clientAvatar;
                  const otherRole = isClientView ? 'Doer' : 'Client';
                  const hasUnread = Boolean(c.unreadCount && c.unreadCount > 0);

                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setActiveConvId(c.id);
                        setMobileShowThread(true);
                      }}
                      style={{
                        padding: '14px 18px',
                        borderBottom: '1px solid var(--border-subtle)',
                        backgroundColor: isSelected ? 'var(--bg-secondary)' : 'transparent',
                        borderLeft: isSelected ? '4px solid var(--accent-primary)' : '4px solid transparent',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease, border-color 0.15s ease',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle, rgba(0,0,0,0.02))';
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        
                        {/* Avatar */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          {otherAvatar ? (
                            <img 
                              src={otherAvatar} 
                              alt={otherName}
                              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-subtle)' }}
                            />
                          ) : (
                            <div style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--bg-secondary)',
                              color: 'var(--accent-primary)',
                              fontWeight: 700,
                              fontSize: '0.92rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: '1.5px solid var(--border-subtle)'
                            }}>
                              {otherName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{
                            position: 'absolute',
                            bottom: '0',
                            right: '0',
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--status-success)',
                            border: '2px solid var(--bg-card)'
                          }} />
                        </div>

                        {/* Middle Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                              <span style={{ 
                                fontSize: '0.88rem', 
                                fontWeight: hasUnread ? 700 : (isSelected ? 600 : 500), 
                                color: 'var(--text-primary)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {otherName}
                              </span>
                              <span style={{
                                fontSize: '0.65rem',
                                padding: '1px 5px',
                                borderRadius: '4px',
                                backgroundColor: 'var(--accent-subtle)',
                                color: 'var(--accent-primary)',
                                fontWeight: 600
                              }}>
                                {otherRole}
                              </span>
                            </div>
                            
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '6px' }}>
                              {formatRelativeTime(c.lastMessageAtUtc)}
                            </span>
                          </div>

                          {/* Task / Brief Pill */}
                          {c.requirementTitle && (
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '4px', 
                              fontSize: '0.72rem', 
                              color: 'var(--accent-primary)', 
                              fontWeight: 600, 
                              marginBottom: '3px',
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis' 
                            }}>
                              <Briefcase size={11} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.requirementTitle}</span>
                            </div>
                          )}

                          {/* Last Message Snippet */}
                          <p style={{ 
                            fontSize: '0.78rem', 
                            color: hasUnread ? 'var(--text-primary)' : 'var(--text-muted)', 
                            fontWeight: hasUnread ? 600 : 400,
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            margin: 0,
                            lineHeight: 1.3
                          }}>
                            {c.lastMessage ? c.lastMessage.replace('👋 Direct Inquiry:', '⚡ Inquiry:') : 'Start conversation...'}
                          </p>
                        </div>

                        {/* Unread Badge */}
                        {hasUnread && (
                          <div style={{
                            minWidth: '20px',
                            height: '20px',
                            padding: '0 6px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--accent-primary)',
                            color: '#FFFFFF',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px',
                            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.35)'
                          }}>
                            {c.unreadCount}
                          </div>
                        )}

                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>

          {/* =========================================
              RIGHT PANE: ACTIVE CHAT THREAD
          ========================================= */}
          <div 
            style={{ 
              display: (!mobileShowThread && window.innerWidth <= 768) ? 'none' : 'flex', 
              flexDirection: 'column', 
              backgroundColor: 'var(--bg-secondary)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            
            {activeConvId ? (
              <>
                {/* 1. THREAD TOP HEADER */}
                <div style={{ 
                  padding: '14px 22px', 
                  backgroundColor: 'var(--bg-card)',
                  borderBottom: '1px solid var(--border-subtle)', 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.03)',
                  zIndex: 2
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    <button
                      onClick={() => setMobileShowThread(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      className="mobile-back-chat"
                      title="Back to inbox"
                    >
                      <ArrowLeft size={18} />
                    </button>

                    {/* Recipient Avatar */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      {activeInterlocutor.avatar ? (
                        <img 
                          src={activeInterlocutor.avatar} 
                          alt={activeInterlocutor.name}
                          style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
                        />
                      ) : (
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--accent-primary)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 8px rgba(217, 119, 6, 0.25)'
                        }}>
                          {activeInterlocutor.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span style={{
                        position: 'absolute',
                        bottom: '0',
                        right: '0',
                        width: '11px',
                        height: '11px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--status-success)',
                        border: '2px solid var(--bg-card)'
                      }} />
                    </div>

                    {/* Name & Task Context */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ 
                          fontSize: '1.02rem', 
                          fontWeight: 700, 
                          color: 'var(--text-primary)', 
                          margin: 0,
                          letterSpacing: '-0.01em',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {activeInterlocutor.name}
                        </h3>
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '2px 7px',
                          borderRadius: '10px',
                          backgroundColor: 'var(--accent-subtle)',
                          color: 'var(--accent-primary)',
                          fontWeight: 600
                        }}>
                          {activeInterlocutor.role}
                        </span>
                      </div>

                      {activeInterlocutor.title ? (
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          fontSize: '0.76rem', 
                          color: 'var(--text-secondary)',
                          marginTop: '2px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Task Brief:</span>
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {activeInterlocutor.title}
                          </span>
                        </div>
                      ) : (
                        <div style={{ fontSize: '0.74rem', color: 'var(--status-success)', fontWeight: 500, marginTop: '2px' }}>
                          ● Active & Available for Collaboration
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    {activeInterlocutor.slug && (
                      <button
                        type="button"
                        onClick={() => onNavigate('public-profile', { slug: activeInterlocutor.slug })}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '5px' }}
                      >
                        <UserIcon size={12} /> View Profile
                      </button>
                    )}

                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '5px', 
                      backgroundColor: 'rgba(16, 185, 129, 0.08)', 
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--status-success)'
                    }}>
                      <ShieldCheck size={13} />
                      <span className="desktop-only">Payment Protected</span>
                    </div>
                  </div>
                </div>

                {/* 2. MESSAGES STREAM */}
                <div 
                  ref={messagesContainerRef}
                  style={{ 
                    flex: 1, 
                    padding: '24px 24px 16px', 
                    overflowY: 'auto', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '14px',
                    backgroundColor: 'var(--bg-secondary)'
                  }}
                >
                  {/* Security Notice Pill */}
                  <div style={{ textAlign: 'center', margin: '0 auto 8px', maxWidth: '440px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 14px',
                      borderRadius: '16px',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.72rem',
                      color: 'var(--text-muted)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
                    }}>
                      <ShieldCheck size={13} color="var(--accent-primary)" />
                      Always keep communication and payments within Tnest for guarantee protection.
                    </div>
                  </div>

                  {messages.length === 0 ? (
                    <div style={{ 
                      margin: 'auto', 
                      textAlign: 'center', 
                      padding: '40px 24px', 
                      maxWidth: '380px',
                      backgroundColor: 'var(--bg-card)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-subtle)',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-subtle)',
                        color: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px'
                      }}>
                        <MessageSquare size={22} />
                      </div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        Start Your Conversation
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                        Say hello to {activeInterlocutor.name} to discuss project deliverables, timelines, and milestones.
                      </p>
                    </div>
                  ) : (
                    messages.map((m, idx) => {
                      const isMine = checkIsMine(m);
                      const timeStr = formatMessageTime(m.createdAtUtc);
                      const isDirectInquiry = m.content.startsWith('👋 Direct Inquiry:');
                      const inquiryBody = isDirectInquiry ? m.content.replace('👋 Direct Inquiry:', '').trim() : '';
                      const isProposalAccepted = m.content.includes('Proposal Accepted') || m.content.includes('Milestone Funded');

                      return (
                        <div 
                          key={m.id || idx}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMine ? 'flex-end' : 'flex-start',
                            width: '100%'
                          }}
                        >
                          {/* Rich Card for Direct Inquiries */}
                          {isDirectInquiry ? (
                            <div style={{
                              maxWidth: '560px',
                              width: '100%',
                              backgroundColor: 'var(--bg-card)',
                              border: '1.5px solid var(--accent-primary)',
                              borderRadius: 'var(--radius-md)',
                              overflow: 'hidden',
                              boxShadow: '0 4px 16px rgba(217, 119, 6, 0.15)',
                              margin: '4px 0'
                            }}>
                              <div style={{
                                padding: '10px 16px',
                                background: 'linear-gradient(135deg, #D97706 0%, #B45309 100%)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                                  <Sparkles size={15} /> Direct Project Inquiry
                                </div>
                                <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                                  {timeStr}
                                </span>
                              </div>

                              <div style={{ padding: '16px' }}>
                                <div style={{
                                  fontSize: '0.88rem',
                                  color: 'var(--text-primary)',
                                  lineHeight: 1.55,
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  backgroundColor: 'var(--bg-secondary)',
                                  padding: '12px 14px',
                                  borderRadius: 'var(--radius-sm)',
                                  borderLeft: '3px solid var(--accent-primary)',
                                  marginBottom: '10px'
                                }}>
                                  "{inquiryBody}"
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <CheckCircle2 size={13} color="var(--status-success)" /> Verified Tnest Client Invitation
                                  </span>
                                  {isMine && (
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-primary)', fontWeight: 600 }}>
                                      Sent by you <CheckCheck size={13} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : isProposalAccepted ? (
                            /* Milestone / Acceptance Card */
                            <div style={{
                              maxWidth: '520px',
                              width: '100%',
                              backgroundColor: 'var(--bg-card)',
                              border: '1.5px solid var(--status-success)',
                              borderRadius: 'var(--radius-md)',
                              overflow: 'hidden',
                              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.12)',
                              margin: '4px 0'
                            }}>
                              <div style={{
                                padding: '10px 16px',
                                backgroundColor: 'var(--status-success)',
                                color: '#FFFFFF',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                fontSize: '0.82rem',
                                fontWeight: 700
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <CheckCircle2 size={15} /> Project Agreement Activated
                                </div>
                                <span style={{ fontSize: '0.7rem', opacity: 0.9 }}>{timeStr}</span>
                              </div>
                              <div style={{ padding: '14px 16px', fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                                {m.content}
                              </div>
                            </div>
                          ) : (
                            /* Standard Message Bubble */
                            <div style={{
                              display: 'flex',
                              alignItems: 'flex-end',
                              gap: '8px',
                              maxWidth: '75%'
                            }}>
                              {!isMine && (
                                <div style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--accent-primary)',
                                  color: '#FFFFFF',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  marginBottom: '18px'
                                }}>
                                  {activeInterlocutor.name.charAt(0).toUpperCase()}
                                </div>
                              )}

                              <div>
                                <div
                                  style={{
                                    padding: '11px 16px',
                                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    backgroundColor: isMine ? 'var(--accent-primary)' : 'var(--bg-card)',
                                    color: isMine ? '#FFFFFF' : 'var(--text-primary)',
                                    border: isMine ? 'none' : '1px solid var(--border-subtle)',
                                    boxShadow: isMine 
                                      ? '0 2px 8px rgba(217, 119, 6, 0.25)' 
                                      : '0 2px 6px rgba(0, 0, 0, 0.04)',
                                    fontSize: '0.88rem',
                                    lineHeight: 1.5,
                                    wordBreak: 'break-word',
                                    whiteSpace: 'pre-wrap'
                                  }}
                                >
                                  {m.content}
                                </div>

                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                                  gap: '4px', 
                                  fontSize: '0.68rem', 
                                  color: 'var(--text-muted)', 
                                  marginTop: '4px', 
                                  padding: '0 4px' 
                                }}>
                                  <span>{timeStr}</span>
                                  {isMine && (
                                    <span style={{ color: 'var(--accent-primary)', display: 'inline-flex', alignItems: 'center' }}>
                                      <CheckCheck size={13} />
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })
                  )}
                </div>

                {/* 3. QUICK CHIPS PROMPTS */}
                <div style={{
                  padding: '8px 20px',
                  backgroundColor: 'var(--bg-card)',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  overflowX: 'auto',
                  whiteSpace: 'nowrap'
                }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}>
                    <Sparkles size={11} color="var(--accent-primary)" /> Suggestions:
                  </span>
                  {quickChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(undefined, chip)}
                      disabled={isSending}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '14px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.color = 'var(--accent-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }}
                    >
                      + {chip}
                    </button>
                  ))}
                </div>

                {/* 4. CHAT INPUT FORM */}
                <form 
                  onSubmit={(e) => handleSendMessage(e)}
                  style={{ 
                    padding: '14px 20px 16px', 
                    borderTop: '1px solid var(--border-subtle)', 
                    display: 'flex', 
                    gap: '10px',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-card)'
                  }}
                >
                  <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="text"
                      className="input-field"
                      placeholder={`Type a message to ${activeInterlocutor.name}...`}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={!activeConvId || isSending}
                      style={{ 
                        width: '100%',
                        borderRadius: '24px',
                        padding: '12px 18px',
                        paddingRight: '45px',
                        fontSize: '0.88rem',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1.5px solid var(--border-medium)',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="btn btn-primary"
                    style={{ 
                      borderRadius: '50%', 
                      width: '44px', 
                      height: '44px', 
                      padding: 0, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(217, 119, 6, 0.28)'
                    }}
                    title="Send message (Enter)"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            ) : (
              /* EMPTY STATE WHEN NO CONVERSATION IS SELECTED */
              <div style={{
                margin: 'auto',
                textAlign: 'center',
                padding: '40px 24px',
                maxWidth: '420px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                }}>
                  <MessageSquare size={30} />
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Select a Conversation
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '20px' }}>
                  Choose a chat from the left panel or start a new direct conversation to message specialists, discuss briefs, and collaborate.
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> Start Direct Message
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate(user?.role === 'Professional' ? 'opportunities' : 'browse')}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Briefcase size={14} /> {user?.role === 'Professional' ? 'Browse Opportunities' : 'Find Specialists'}
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* NEW DIRECT CONVERSATION MODAL                                             */}
      {/* ========================================================================= */}
      {isNewChatModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsNewChatModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.2)',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              animation: 'fadeIn 0.2s ease-out'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Start a New Conversation
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Send a direct message or inquiry to any creator, specialist, or client.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Suggestions Chips */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Quick Recipient Suggestions:
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['hema\'s Brand', 'GlowSkin Organics', 'Priya Reddy', 'Studio Bloom', 'Rahul Verma', 'ZenFlow Productivity'].map((rec, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setNewChatTargetName(rec)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '16px',
                      backgroundColor: newChatTargetName === rec ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: newChatTargetName === rec ? '#FFFFFF' : 'var(--text-secondary)',
                      border: newChatTargetName === rec ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      fontSize: '0.74rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {rec}
                  </button>
                ))}
              </div>
            </div>

            {/* New Message Form */}
            <form onSubmit={handleStartNewChat}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Recipient Name / Brand <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hema's Brand or Priya Reddy"
                  value={newChatTargetName}
                  onChange={(e) => setNewChatTargetName(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Task Brief / Topic (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Video Scriptwriting & SEO Content"
                  value={newChatTopic}
                  onChange={(e) => setNewChatTopic(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Initial Message <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Type your message, proposal query, or milestone request..."
                  value={newChatInitialMsg}
                  onChange={(e) => setNewChatInitialMsg(e.target.value)}
                  className="input-field"
                  style={{ width: '100%', fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newChatTargetName.trim() || isStartingNewChat}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <Send size={14} /> {isStartingNewChat ? 'Connecting...' : 'Send & Open Chat'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
