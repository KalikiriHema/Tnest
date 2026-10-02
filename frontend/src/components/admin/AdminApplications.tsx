import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Search, 
  RefreshCw, 
  Calendar, 
  User, 
  Briefcase, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle,
  Eye,
  X
} from 'lucide-react';
import { adminApi } from '../../api';

export const AdminApplications: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getApplications(page, 15);
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [page]);

  const filteredItems = items.filter((item) => {
    const matchesSearch = !search.trim() || 
      item.requirementTitle?.toLowerCase().includes(search.toLowerCase()) ||
      item.applicantName?.toLowerCase().includes(search.toLowerCase()) ||
      item.applicantEmail?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'Shortlisted':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'Accepted':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'Declined':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              Applications & Proposals Inspection
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Audit and inspect Doer proposals submitted for client opportunities. For dispute mediation and support review.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Total Logged: <strong className="text-white font-bold">{total}</strong>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by opportunity, applicant name or email..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 transition"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Application Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
            <p className="text-xs">Loading proposal submissions...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No applications found matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Opportunity</th>
                  <th className="py-3.5 px-4">Applicant (Doer)</th>
                  <th className="py-3.5 px-4">Proposed Bid</th>
                  <th className="py-3.5 px-4">Estimated Delivery</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filteredItems.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-white truncate">{app.requirementTitle}</p>
                      <p className="text-[10px] font-mono text-slate-500">ID: {app.requirementId.substring(0, 8)}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-200">{app.applicantName}</p>
                      <p className="text-[11px] text-slate-500">{app.applicantEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ₹{app.proposedPrice?.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {app.estimatedDays} days
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(app.createdAtUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title="View Cover Letter & Bid"
                      >
                        <Eye className="w-4 h-4" />
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

      {/* Application Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(selectedApp.status)}`}>
                  {selectedApp.status}
                </span>
                <h2 className="text-base font-bold text-white mt-2">{selectedApp.requirementTitle}</h2>
                <p className="text-xs text-slate-400">Applied by: <strong className="text-slate-200">{selectedApp.applicantName}</strong> ({selectedApp.applicantEmail})</p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Proposed Price</span>
                <p className="font-bold text-emerald-400 text-sm mt-0.5">₹{selectedApp.proposedPrice?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Estimated Days</span>
                <p className="font-bold text-white text-sm mt-0.5">{selectedApp.estimatedDays} Days</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Cover Letter / Pitch</p>
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {selectedApp.coverLetter || 'No cover letter provided.'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>Submitted: {new Date(selectedApp.createdAtUtc).toLocaleString()}</span>
              <button
                onClick={() => setSelectedApp(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
