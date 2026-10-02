import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  Eye, 
  User, 
  Briefcase, 
  FolderLock, 
  MessageSquare, 
  Star,
  ArrowRight
} from 'lucide-react';
import { adminApi } from '../../api';
import { AdminReportItem } from '../../types';

export const AdminReports: React.FC = () => {
  const [reports, setReports] = useState<AdminReportItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState<'all' | 'New' | 'UnderReview' | 'Resolved' | 'Dismissed'>('New');
  const [targetTypeFilter, setTargetTypeFilter] = useState('all');

  // Investigation Modal
  const [activeReport, setActiveReport] = useState<AdminReportItem | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionAction, setResolutionAction] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getReports({
        status: statusTab !== 'all' ? statusTab : undefined,
        targetType: targetTypeFilter !== 'all' ? targetTypeFilter : undefined,
        page,
        pageSize: 15
      });
      setReports(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [page, statusTab, targetTypeFilter]);

  const handleUpdateStatus = async (newStatus: 'UnderReview' | 'Resolved' | 'Dismissed') => {
    if (!activeReport) return;
    setSubmitting(true);
    try {
      await adminApi.updateReportStatus(activeReport.id, {
        status: newStatus,
        adminNotes: adminNotes.trim() || undefined,
        resolutionAction: resolutionAction.trim() || undefined
      });

      setToastMessage(`Report #${activeReport.id.substring(0, 8)} updated to ${newStatus}.`);
      setTimeout(() => setToastMessage(null), 4000);

      setActiveReport(null);
      setAdminNotes('');
      setResolutionAction('');
      loadReports();
    } catch (err: any) {
      alert(err.message || 'Failed to update report');
    } finally {
      setSubmitting(false);
    }
  };

  const getTargetIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'user': return <User className="w-4 h-4 text-indigo-400" />;
      case 'opportunity': return <Briefcase className="w-4 h-4 text-amber-400" />;
      case 'portfolio': return <FolderLock className="w-4 h-4 text-purple-400" />;
      case 'review': return <Star className="w-4 h-4 text-yellow-400" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-700 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              Trust & Safety Reports Triage
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Investigate user-submitted flags, take enforcement action, and track moderation audit logs.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Reports in Queue: <strong className="text-white font-bold">{total}</strong>
          </div>
        </div>

        {/* Status Tabs Toolbar */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          {(['New', 'UnderReview', 'Resolved', 'Dismissed', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => { setStatusTab(tab); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                statusTab === tab
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                  : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab === 'all' ? 'All Reports' : tab === 'UnderReview' ? 'Under Review' : tab}</span>
            </button>
          ))}

          <div className="ml-auto w-full sm:w-auto">
            <select
              value={targetTypeFilter}
              onChange={(e) => { setTargetTypeFilter(e.target.value); setPage(1); }}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-300"
            >
              <option value="all">All Target Types</option>
              <option value="User">Users</option>
              <option value="Opportunity">Opportunities</option>
              <option value="Portfolio">Portfolios</option>
              <option value="Review">Reviews</option>
              <option value="Message">Messages</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
            <p className="text-xs">Loading safety reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No reports found under "{statusTab}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">Reason Category</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Reported By</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4 text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-slate-800 shrink-0">
                          {getTargetIcon(r.targetType)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate max-w-xs">{r.targetTitle || `${r.targetType} Flag`}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {r.targetId.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {r.reasonCategory}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.priority === 'High' || r.priority === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}>
                        {r.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-300">{r.reporterName || 'Anonymous'}</p>
                      <p className="text-[11px] text-slate-500">{r.reporterEmail}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        r.status === 'New' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        r.status === 'UnderReview' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        r.status === 'Resolved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {r.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(r.createdAtUtc).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setActiveReport(r);
                          setAdminNotes(r.adminNotes || '');
                          setResolutionAction(r.resolutionAction || '');
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5 text-rose-400" />
                        <span>Investigate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Showing Page {page} of {Math.max(1, Math.ceil(total / 15))}</span>
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
              disabled={page * 15 >= total || loading}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg transition font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Investigation Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                  {activeReport.targetType} Report • Priority: {activeReport.priority}
                </span>
                <h2 className="text-lg font-bold text-white mt-1.5">
                  {activeReport.targetTitle || `${activeReport.targetType} Flag`}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Report ID: <span className="font-mono text-slate-300">{activeReport.id}</span>
                </p>
              </div>

              <button
                onClick={() => setActiveReport(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Reporter details and reason */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Reporter</span>
                <p className="font-semibold text-slate-200 mt-0.5">{activeReport.reporterName}</p>
                <p className="text-slate-400">{activeReport.reporterEmail}</p>
              </div>

              <div className="p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                <span className="text-slate-500 uppercase font-semibold text-[10px]">Reason Category</span>
                <p className="font-semibold text-rose-300 mt-0.5">{activeReport.reasonCategory}</p>
                <p className="text-slate-400">{new Date(activeReport.createdAtUtc).toLocaleString()}</p>
              </div>
            </div>

            {/* Description & Submitted Details */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5 text-xs">
              <p className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Incident Details</p>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {activeReport.details || 'No additional commentary provided by reporter.'}
              </p>
            </div>

            {/* Admin Investigation Inputs */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Investigation & Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record findings, communications with parties, or evidence reviewed..."
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resolution Action Summary (Audit Justification)
                </label>
                <input
                  type="text"
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  placeholder="e.g. Warning issued to user / Listing hidden / False alarm dismissed"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Resolution Buttons */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <button
                disabled={submitting}
                onClick={() => handleUpdateStatus('UnderReview')}
                className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Mark Under Review</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  disabled={submitting}
                  onClick={() => handleUpdateStatus('Dismissed')}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Dismiss Report</span>
                </button>

                <button
                  disabled={submitting}
                  onClick={() => handleUpdateStatus('Resolved')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Resolve & Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
