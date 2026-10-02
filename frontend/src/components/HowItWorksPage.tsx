import React, { useState } from 'react';
import {
  FileText,
  Send,
  Users,
  CheckCircle2,
  MessageSquare,
  FolderKanban,
  Star,
  ArrowRight,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { BreadcrumbNav } from './BreadcrumbNav';

interface HowItWorksPageProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenAuth: (tab?: 'login' | 'register') => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'client' | 'doer' | 'direct'>('client');

  return (
    <div className="container" style={{ padding: '32px 24px 80px', maxWidth: '1000px' }}>

      {/* Top Breadcrumb */}
      <BreadcrumbNav
        items={[
          { label: 'How It Works', active: true }
        ]}
        backLabel="Back"
        onNavigate={onNavigate}
      />

      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
        <span className="badge badge-primary" style={{ marginBottom: '10px' }}>
          Marketplace Guide
        </span>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>
          How Tnest Works
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
          Whether you need work done or want to offer your skills, Tnest gives you a structured, transparent, and secure workflow.
        </p>

        {/* Tab Switcher */}
        <div style={{ display: 'inline-flex', padding: '4px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-medium)', marginTop: '24px', gap: '4px' }}>
          <button
            onClick={() => setActiveTab('client')}
            className={`btn btn-sm ${activeTab === 'client' ? 'btn-primary' : 'btn-ghost'}`}
          >
            For Clients (Posting Tasks)
          </button>
          <button
            onClick={() => setActiveTab('doer')}
            className={`btn btn-sm ${activeTab === 'doer' ? 'btn-primary' : 'btn-ghost'}`}
          >
            For Doers (Finding Work)
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`btn btn-sm ${activeTab === 'direct' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Direct Hiring
          </button>
        </div>
      </div>

      {/* TAB 1: CLIENT WORKFLOW */}
      {activeTab === 'client' && (
        <div>
          <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>For Clients: From Posting to Approval</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '28px' }}>
              Describe what you need, receive proposals from capable Doers, collaborate securely, and release milestone payment upon satisfaction.
            </p>

            <div className="grid-cols-2" style={{ gap: '20px' }}>
              {[
                { step: '1', title: 'Post Task', desc: 'Use our guided 4-step form to set scope, required skills, timeline, budget, and location preference.' },
                { step: '2', title: 'Receive Structured Proposals', desc: 'Verified specialists inspect your brief and send structured proposals with proposed prices and delivery times.' },
                { step: '3', title: 'Chat & Compare', desc: 'Review portfolios, verified ratings, and communicate directly via built-in messaging before making a hiring decision.' },
                { step: '4', title: 'Milestone Protection & Release', desc: 'Funds are securely safeguarded in milestone protection and only released when you inspect and approve the finished deliverables.' }
              ].map((item) => (
                <div key={item.step} style={{ padding: '18px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', marginBottom: '10px' }}>
                    {item.step}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => onNavigate('wizard')} className="btn btn-primary btn-lg">
              <Plus size={16} /> Post Your First Task
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: DOER WORKFLOW */}
      {activeTab === 'doer' && (
        <div>
          <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>For Doers: From Discovery to Payout</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '28px' }}>
              Build a strong portfolio, submit proposals to open tasks, deliver quality work, and receive guaranteed payouts.
            </p>

            <div className="grid-cols-2" style={{ gap: '20px' }}>
              {[
                { step: '1', title: 'Complete Your Profile', desc: 'Add your skills, past portfolio samples, turnaround time, hourly rate, and availability status.' },
                { step: '2', title: 'Browse & Apply', desc: 'Search through open tasks, filter by discipline and budget, and submit personalized cover notes.' },
                { step: '3', title: 'Collaborate Directly', desc: 'Communicate with clients, share draft milestones, receive feedback, and finalize deliverables.' },
                { step: '4', title: 'Get Paid & Build Reviews', desc: 'Receive on-time payment release upon client approval and collect verified ratings to win future clients.' }
              ].map((item) => (
                <div key={item.step} style={{ padding: '18px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--status-success)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', marginBottom: '10px' }}>
                    {item.step}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => onNavigate('opportunities')} className="btn btn-primary btn-lg">
              Browse Open Opportunities
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: DIRECT HIRING */}
      {activeTab === 'direct' && (
        <div>
          <div className="card" style={{ padding: '32px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>Direct Discovery & Hiring</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginBottom: '28px' }}>
              Clients can also bypass posting and find specific specialists directly by searching the talent directory.
            </p>

            <div className="grid-cols-2" style={{ gap: '20px' }}>
              {[
                { step: '1', title: 'Search the Directory', desc: 'Filter Doers by specific roles, tools, languages, ratings, and instant availability.' },
                { step: '2', title: 'Inspect Verified Work', desc: 'Watch video samples, review past projects, and check verified feedback from previous clients.' },
                { step: '3', title: 'Send Direct Inquiry', desc: 'Send a message with your project scope or start a direct conversation in real-time.' },
                { step: '4', title: 'Agree on Terms & Payment', desc: 'Finalize price and timeline, lock payment safely in milestone protection, and begin collaboration.' }
              ].map((item) => (
                <div key={item.step} style={{ padding: '18px', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: 'var(--accent-primary)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', marginBottom: '10px' }}>
                    {item.step}
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>{item.title}</h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={() => onNavigate('browse')} className="btn btn-primary btn-lg">
              Find Capable Doers
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
