import React, { useEffect, useState } from 'react';
import { 
  FolderCheck, 
  Search, 
  RefreshCw, 
  User, 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  Eye, 
  X,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import { adminApi } from '../../api';

export const AdminProjects: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProj, setSelectedProj] = useState<any | null>(null);

  const loadProjects = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProjects({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        page,
        pageSize: 15
      });
      setItems(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [page, statusFilter]);

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(s) ||
      item.clientName?.toLowerCase().includes(s) ||
      item.clientEmail?.toLowerCase().includes(s) ||
      item.doerName?.toLowerCase().includes(s) ||
      item.doerEmail?.toLowerCase().includes(s)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'InProgress':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
      case 'UnderReview':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'Completed':
        return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'Disputed':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
      case 'Cancelled':
        return 'bg-slate-800 text-slate-400 border border-slate-700';
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
              <FolderCheck className="w-5 h-5 text-emerald-400" />
              Active & Historic Project Contracts
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Inspect ongoing and completed marketplace engagements between Clients and Creative Doers.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Total Projects: <strong className="text-white font-bold">{total}</strong>
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
              placeholder="Search project title, client, or creative doer..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 transition"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Project Statuses</option>
              <option value="InProgress">In Progress</option>
              <option value="UnderReview">Under Review</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
            <p className="text-xs">Loading active projects...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No projects found matching search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Project Contract</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Assigned Doer</th>
                  <th className="py-3.5 px-4">Agreed Value</th>
                  <th className="py-3.5 px-4">Contract Status</th>
                  <th className="py-3.5 px-4">Created Date</th>
                  <th className="py-3.5 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filteredItems.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-white truncate">{proj.title}</p>
                      <p className="text-[10px] font-mono text-slate-500">ID: {proj.id.substring(0, 8)}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-200">{proj.clientName}</p>
                      <p className="text-[11px] text-slate-500">{proj.clientEmail}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-emerald-300">{proj.doerName}</p>
                      <p className="text-[11px] text-slate-500">{proj.doerEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      ₹{proj.agreedPrice?.toLocaleString()} {proj.currency}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(proj.status)}`}>
                        {proj.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(proj.createdAtUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedProj(proj)}
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                        title="Inspect Contract Summary"
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

      {/* Project Detail Modal */}
      {selectedProj && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(selectedProj.status)}`}>
                  {selectedProj.status}
                </span>
                <h2 className="text-base font-bold text-white mt-2">{selectedProj.title}</h2>
                <p className="text-xs font-mono text-slate-500">Contract ID: {selectedProj.id}</p>
              </div>

              <button
                onClick={() => setSelectedProj(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Client Party</span>
                <p className="font-semibold text-white">{selectedProj.clientName}</p>
                <p className="text-[11px] text-slate-400">{selectedProj.clientEmail}</p>
              </div>

              <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Doer Party</span>
                <p className="font-semibold text-emerald-400">{selectedProj.doerName}</p>
                <p className="text-[11px] text-slate-400">{selectedProj.doerEmail}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Agreed Contract Price</span>
                <span className="font-bold text-base text-emerald-400 font-mono">₹{selectedProj.agreedPrice?.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">Initiated Date</span>
                <span className="text-slate-200">{new Date(selectedProj.createdAtUtc).toLocaleString()}</span>
              </div>
              {selectedProj.completedAtUtc && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-slate-400">Completed Date</span>
                  <span className="text-emerald-400">{new Date(selectedProj.completedAtUtc).toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-end">
              <button
                onClick={() => setSelectedProj(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
