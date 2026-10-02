import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Briefcase, 
  FolderCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  ExternalLink,
  ChevronRight,
  UserCheck,
  RefreshCw,
  FolderLock
} from 'lucide-react';
import { adminApi } from '../../api';
import { AdminDashboardMetrics } from '../../types';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-rose-500 mb-3" />
        <p className="text-sm">Aggregating live platform metrics...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-rose-950/40 border border-rose-800/80 rounded-2xl text-rose-200">
        <p className="font-semibold text-rose-300">Error Loading Dashboard</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={loadData}
          className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const s = data?.summary || {
    totalUsers: 0,
    totalClients: 0,
    totalDoers: 0,
    suspendedUsers: 0,
    totalOpportunities: 0,
    openOpportunities: 0,
    hiddenOpportunities: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingReports: 0,
    resolvedReports: 0,
    totalReports: 0,
    pendingModeration: 0
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            Live Marketplace Oversight
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Administrator Governance Hub
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time telemetry, user management, and moderation queue for TNEST.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium rounded-xl transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards - 8 Metrics (Requirement 3) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Users */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Users</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{s.totalUsers}</span>
            <span className="text-xs text-slate-400">registered</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Suspended: <strong className="text-rose-400">{s.suspendedUsers || 0}</strong></span>
            <span className="text-indigo-400 flex items-center gap-1 group-hover:underline">
              Manage <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 2. Total Clients */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Clients</span>
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{s.totalClients}</span>
            <span className="text-xs text-slate-400">buyers & brands</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Commissioning work</span>
            <span className="text-sky-400 flex items-center gap-1 group-hover:underline">
              Directory <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 3. Total Doers */}
        <div 
          onClick={() => onNavigateTab('users')}
          className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Doers</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{s.totalDoers}</span>
            <span className="text-xs text-slate-400">creatives</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Verified specialists</span>
            <span className="text-purple-400 flex items-center gap-1 group-hover:underline">
              Directory <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 4. Open Opportunities */}
        <div 
          onClick={() => onNavigateTab('opportunities')}
          className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Opportunities</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{s.openOpportunities}</span>
            <span className="text-xs text-slate-400">/ {s.totalOpportunities} total</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Tasks, Jobs & Briefs</span>
            {s.hiddenOpportunities > 0 ? (
              <span className="text-amber-400 font-medium">{s.hiddenOpportunities} hidden</span>
            ) : (
              <span className="text-emerald-400 font-medium">0 hidden</span>
            )}
          </div>
        </div>

        {/* 5. Active Projects */}
        <div 
          onClick={() => onNavigateTab('projects')}
          className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
              <FolderCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{s.activeProjects}</span>
            <span className="text-xs text-slate-400">in execution</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Completed: <strong className="text-emerald-400">{s.completedProjects}</strong></span>
            <span className="text-indigo-400 flex items-center gap-1 group-hover:underline">
              Inspect <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 6. Pending Applications */}
        <div 
          onClick={() => onNavigateTab('applications')}
          className="group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition shadow-lg relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Applications</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition">
              <FolderLock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{s.pendingApplications ?? 0}</span>
            <span className="text-xs text-slate-400">bids in review</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Total: <strong className="text-slate-200">{s.totalApplications ?? 0}</strong></span>
            <span className="text-cyan-400 flex items-center gap-1 group-hover:underline">
              Inspect <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 7. Pending Reports */}
        <div 
          onClick={() => onNavigateTab('reports')}
          className={`group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border rounded-2xl p-5 transition shadow-lg relative overflow-hidden ${
            s.pendingReports > 0 ? 'border-rose-800/80 bg-rose-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">Pending Reports</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{s.pendingReports}</span>
            <span className="text-xs text-slate-400">unresolved</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Resolved: <strong className="text-slate-200">{s.resolvedReports}</strong></span>
            <span className="text-rose-400 font-semibold flex items-center gap-1">
              Triage <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* 8. Pending Moderation */}
        <div 
          onClick={() => onNavigateTab('reports')}
          className={`group cursor-pointer bg-slate-900/90 hover:bg-slate-850 border rounded-2xl p-5 transition shadow-lg relative overflow-hidden ${
            s.pendingModeration > 0 ? 'border-amber-800/80 bg-amber-950/20' : 'border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">Pending Moderation</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{s.pendingModeration}</span>
            <span className="text-xs text-slate-400">items in queue</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
            <span>Reports, hides & flags</span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              Queue <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Moderation Queue Alert Banner if items pending */}
      {s.pendingModeration > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-200">
                {s.pendingModeration} Moderation Item{s.pendingModeration > 1 ? 's' : ''} Require Attention
              </p>
              <p className="text-xs text-amber-300/80 mt-0.5">
                Includes pending user reports, flagged portfolio items, and unreviewed content.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('reports')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-xl transition shrink-0 shadow-sm"
          >
            Open Moderation Queue
          </button>
        </div>
      )}

      {/* Two Column Grid: Recent Reports & Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Incoming Reports</h2>
            </div>
            <button
              onClick={() => onNavigateTab('reports')}
              className="text-xs text-rose-400 hover:text-rose-300 font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.recentReports && data.recentReports.length > 0 ? (
              data.recentReports.map((report) => (
                <div 
                  key={report.id}
                  onClick={() => onNavigateTab('reports')}
                  className="p-3.5 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {report.targetTitle || `${report.targetType} Report`}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        report.status === 'New' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        report.status === 'UnderReview' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>Reason: <strong className="text-slate-300">{report.reasonCategory || 'General'}</strong></span>
                      <span>•</span>
                      <span>By: {report.reporterName || 'Anonymous'}</span>
                    </div>
                  </div>

                  <span className="text-[11px] text-slate-500 shrink-0">
                    {new Date(report.createdAtUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-500/60 mx-auto mb-2" />
                No active reports pending investigation.
              </div>
            )}
          </div>
        </div>

        {/* Live Admin Audit Feed */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Recent Admin Actions</h2>
            </div>
            <button
              onClick={() => onNavigateTab('audit-logs')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Audit Log <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((log) => (
                <div 
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-800 font-mono">
                        {log.targetType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {log.reason}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Admin: <strong className="text-slate-400 font-medium">{log.adminName || log.adminEmail}</strong>
                    </p>
                  </div>

                  <span className="text-[11px] text-slate-500 shrink-0 mt-0.5">
                    {new Date(log.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                No recent administrative actions recorded.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Access Tiles to All Admin Sub-systems */}
      <div>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Quick Management Navigation
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <button
            onClick={() => onNavigateTab('users')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-850 text-left transition group"
          >
            <UserCheck className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-200">Users</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Manage accounts</p>
          </button>

          <button
            onClick={() => onNavigateTab('opportunities')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 text-left transition group"
          >
            <Briefcase className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-200">Opportunities</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Moderate listings</p>
          </button>

          <button
            onClick={() => onNavigateTab('reports')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-850 text-left transition group"
          >
            <ShieldAlert className="w-5 h-5 text-rose-400 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-200">Reports</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Safety & triage</p>
          </button>

          <button
            onClick={() => onNavigateTab('portfolios')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-850 text-left transition group"
          >
            <FolderLock className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-200">Portfolios</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Verify & review</p>
          </button>

          <button
            onClick={() => onNavigateTab('categories')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-850 text-left transition group"
          >
            <ExternalLink className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-200">Taxonomy</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Categories & Skills</p>
          </button>

          <button
            onClick={() => onNavigateTab('audit-logs')}
            className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850 text-left transition group"
          >
            <Clock className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition" />
            <p className="text-xs font-bold text-slate-200">Audit Logs</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Compliance records</p>
          </button>
        </div>
      </div>
    </div>
  );
};
