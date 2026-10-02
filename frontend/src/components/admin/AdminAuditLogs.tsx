import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Search, 
  ShieldCheck, 
  RefreshCw, 
  Filter, 
  User, 
  Globe, 
  FileText,
  CheckCircle2
} from 'lucide-react';
import { adminApi } from '../../api';
import { AdminAuditLogItem } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        search: search.trim() || undefined,
        action: actionFilter !== 'all' ? actionFilter : undefined,
        page,
        pageSize: 25
      });
      setLogs(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [page, actionFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAuditLogs();
  };

  const getActionColor = (action: string) => {
    if (action.includes('Suspend') || action.includes('Remove') || action.includes('Dismiss')) {
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    }
    if (action.includes('Hide') || action.includes('UnderReview')) {
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    }
    if (action.includes('Reactivate') || action.includes('Restore') || action.includes('Resolved') || action.includes('Create')) {
      return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    }
    return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              Administrative Audit Logs & Compliance Trail
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Cryptographically verified, immutable record of all moderation, status changes, and settings modifications.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Total Records: <strong className="text-white font-bold">{total}</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by admin name, email, target, or reason..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 transition"
            />
          </form>

          <div className="sm:col-span-5">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Action Categories</option>
              <option value="User">User Actions (Suspend/Reactivate)</option>
              <option value="Opportunity">Opportunity Moderation (Hide/Restore/Delete)</option>
              <option value="Report">Safety Reports (Review/Resolve/Dismiss)</option>
              <option value="Portfolio">Portfolio Moderation</option>
              <option value="Review">Review Moderation</option>
              <option value="Category">Taxonomy Management</option>
              <option value="Settings">System Settings Changes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
            <p className="text-xs">Loading compliance audit trail...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No audit records matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Action & Domain</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Mandatory Reason & Details</th>
                  <th className="py-3.5 px-4">Admin Operator</th>
                  <th className="py-3.5 px-4">Timestamp & IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${getActionColor(log.action)}`}>
                          {log.action}
                        </span>
                        <span className="block text-[10px] text-slate-500 uppercase font-semibold">
                          {log.targetType}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-300">
                      <p className="font-semibold text-white">{log.targetId}</p>
                      <p className="text-[10px] text-slate-500">{log.targetType} Reference</p>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="font-medium text-slate-200">{log.reason}</p>
                      {log.details && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{log.details}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-200">{log.adminName}</p>
                      <p className="text-[11px] text-slate-500">{log.adminEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-400">
                      <p>{new Date(log.createdAtUtc).toLocaleString()}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">IP: {log.ipAddress || '127.0.0.1'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing Page {page} of {Math.max(1, Math.ceil(total / 25))}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition font-medium"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 25 >= total || loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
