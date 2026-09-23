import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { api } from '../api';
import { ConversationItem, ChatMessageItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { Send, MessageSquare, Paperclip, CheckCheck, Briefcase, ArrowRight, Sparkles, User, ShieldCheck } from 'lucide-react';

interface ChatRoomProps {
  initialConversationId?: string;
  onNavigate: (view: string, params?: any) => void;
}

export const ChatRoom: React.FC<ChatRoomProps> = ({ initialConversationId, onNavigate }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(initialConversationId || null);
  const [activeConvDetails, setActiveConvDetails] = useState<any | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [inputText, setInputText] = useState('');
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    api.getUserConversations(user.id).then(list => {
      setConversations(list);
      if (!activeConvId && list.length > 0) {
        setActiveConvId(list[0].id);
      }
    });
  }, [user]);

  // Establish SignalR WebSocket connection
  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/chat')
      .withAutomaticReconnect()
      .build();

    connection.start().then(() => {
      setHubConnection(connection);
    }).catch(err => console.error('SignalR Hub Connection Error:', err));

    return () => {
      connection.stop();
    };
  }, []);

  // Listen to incoming messages & join conversation group
  useEffect(() => {
    if (!hubConnection || !activeConvId) return;

    hubConnection.invoke('JoinConversation', activeConvId).catch(console.error);

    const messageHandler = (msg: ChatMessageItem) => {
      if (msg.conversationId === activeConvId) {
        setMessages(prev => [...prev, msg]);
      }
    };

    hubConnection.on('ReceiveMessage', messageHandler);

    return () => {
      hubConnection.off('ReceiveMessage', messageHandler);
      hubConnection.invoke('LeaveConversation', activeConvId).catch(console.error);
    };
  }, [hubConnection, activeConvId]);

  // Load message history when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    api.getConversationMessages(activeConvId).then(data => {
      setActiveConvDetails(data.conversation);
      setMessages(data.messages);
    });
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId || !user) return;

    const textToSend = inputText.trim();
    setInputText('');

    if (hubConnection && hubConnection.state === signalR.HubConnectionState.Connected) {
      await hubConnection.invoke('SendMessage', activeConvId, user.id, user.role, textToSend, null, null, null);
    } else {
      // Fallback reload
      api.getConversationMessages(activeConvId).then(data => {
        setMessages(data.messages);
      });
    }
  };

  return (
    <div className="container" style={{ padding: '30px 24px', maxWidth: '1200px' }}>
      <div className="glass-panel" style={{ height: '78vh', display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden' }}>
        
        {/* CONVERSATION LIST SIDEBAR */}
        <div style={{ borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.4)' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} color="var(--accent-primary)" />
            <h2 style={{ fontSize: '1.15rem' }}>Conversations</h2>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No active conversations yet.
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = c.id === activeConvId;
                const otherPartyName = user?.role === 'Client' ? c.professionalName : c.clientName;
                return (
                  <div
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--accent-primary)' : '3px solid transparent',
                      transition: 'background 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9rem', color: isSelected ? '#fff' : 'var(--text-primary)' }}>
                        {otherPartyName}
                      </strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(c.lastMessageAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {c.requirementTitle && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        📋 {c.requirementTitle}
                      </div>
                    )}

                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.lastMessage || 'Start conversation...'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ACTIVE CHAT PANEL */}
        {activeConvDetails ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Chat Top Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(15, 23, 42, 0.6)' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>
                  {user?.role === 'Client' ? activeConvDetails.professionalName : activeConvDetails.clientName}
                </h3>
                {activeConvDetails.requirementTitle && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Linked Brief: <strong>{activeConvDetails.requirementTitle}</strong>
                  </span>
                )}
              </div>

              {/* Action Button: View Project Tracker if project activated */}
              {activeConvDetails.projectId ? (
                <button
                  onClick={() => onNavigate('project-tracker', { projectId: activeConvDetails.projectId })}
                  className="btn btn-emerald btn-sm"
                >
                  <Briefcase size={14} /> Open Project Milestone Tracker
                </button>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> Active Negotiation Room
                </div>
              )}
            </div>

            {/* Chat Messages Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {messages.map((m) => {
                const isMe = m.senderUserId === user?.id;
                return (
                  <div
                    key={m.id}
                    style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div style={{
                      padding: '12px 18px',
                      borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: isMe ? 'var(--gradient-brand)' : 'rgba(255, 255, 255, 0.08)',
                      color: '#fff',
                      fontSize: '0.9rem',
                      lineHeight: 1.45,
                      boxShadow: isMe ? 'var(--shadow-glow)' : 'none',
                      whiteSpace: 'pre-line'
                    }}>
                      {m.content}
                    </div>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                      {new Date(m.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px', background: 'rgba(15, 23, 42, 0.8)' }}>
              <input
                type="text"
                placeholder="Type your negotiation message or terms..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="input-field"
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">
                <Send size={16} /> Send
              </button>
            </form>

          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Select a conversation to start messaging
          </div>
        )}

      </div>
    </div>
  );
};
