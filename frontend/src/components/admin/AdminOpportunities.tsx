import React, { useEffect, useState } from 'react';
import { 
  Briefcase, 
  Search, 
  Eye, 
  EyeOff, 
  Trash2, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Clock, 
  Calendar,
  Layers,
  FileCheck,
  User,
  ShieldAlert,
  Send
} from 'lucide-react';
import { adminApi } from '../../api';
import { AdminOpportunityItem } from '../../types';

export const AdminOpportunities: React.FC = () => {
  const [items, setItems] = useState<AdminOpportunityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hiddenFilter, setHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  // Detail Modal
  const [selectedOppDetail, setSelectedOppDetail] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Moderation Action Modal
  const [modalAction, setModalAction] = useState<{
    opp: { id: string; title: string };
    action: 'hide' | 'restore' | 'close' | 'remove';
  } | null>(null);
  const [moderationReason, setModerationReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getOpportunities({
        search: search.trim() || undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        isHidden: hiddenFilter === 'all' ? undefined : hiddenFilter === 'hidden',
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
    loadOpportunities();
  }, [page, categoryFilter, statusFilter, hiddenFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadOpportunities();
  };

  const handleOpenDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const detail = await adminApi.getOpportunityById(id);
      setSelectedOppDetail(detail);
    } catch (err: any) {
      alert(err.message || 'Failed to load opportunity detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExecuteModeration = async () => {
    if (!modalAction) return;
    if (!moderationReason.trim()) {
      alert('A moderation justification reason is required.');
      return;
    }

    setSubmitting(true);
    try {
      await adminApi.moderateOpportunity(modalAction.opp.id, {
        action: modalAction.action,
        reason: moderationReason.trim()
      });

      setToastMessage(`Opportunity action "${modalAction.action}" executed successfully.`);
      setTimeout(() => setToastMessage(null), 4000);

      setModalAction(null);
      setModerationReason('');
      setSelectedOppDetail(null);
      loadOpportunities();
    } catch (err: any) {
      alert(err.message || 'Failed to moderate opportunity');
    } finally {
      setSubmitting(false);
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

      {/* Header Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-400" />
              Opportunities & Marketplace Listings
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage client tasks, jobs, freelance briefs, and internships. Moderate or remove violating posts.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Total Listings: <strong className="text-white font-bold">{total}</strong>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search opportunity title, description..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 transition"
            />
          </form>

          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Categories</option>
              <option value="ugc-creators">UGC & Creators</option>
              <option value="video-content">Video & Content</option>
              <option value="design">Design</option>
              <option value="writing-content">Writing & Content</option>
              <option value="technology">Technology & Coding</option>
              <option value="marketing-advertising">Marketing & Ads</option>
              <option value="music-audio">Music & Audio</option>
              <option value="photography">Photography</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="InReview">In Review</option>
              <option value="Matched">Matched</option>
              <option value="Closed">Closed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <select
              value={hiddenFilter}
              onChange={(e) => { setHiddenFilter(e.target.value as any); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Visibility</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
            <p className="text-xs">Loading marketplace opportunities...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No opportunities found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Opportunity</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Budget Range</th>
                  <th className="py-3.5 px-4">Status & State</th>
                  <th className="py-3.5 px-4">Posted</th>
                  <th className="py-3.5 px-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {items.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="font-semibold text-white truncate">{opp.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{opp.description}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-medium text-slate-300">
                        {opp.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-200">{opp.clientName}</p>
                      <p className="text-[11px] text-slate-500">{opp.clientEmail}</p>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className="text-emerald-400 font-bold">₹{opp.budgetMin.toLocaleString()} - ₹{opp.budgetMax.toLocaleString()}</span>
                      <span className="block text-[10px] text-slate-500">{opp.expectedDeliveryDays} days SLA</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          opp.status === 'Open' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          opp.status === 'InReview' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          opp.status === 'Matched' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                          'bg-slate-800 text-slate-400'
                        }`}>
                          {opp.status}
                        </span>
                        {opp.isHidden && (
                          <span className="block text-[10px] text-rose-400 font-semibold">
                            ⚠️ Hidden by Moderator
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(opp.createdAtUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(opp.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="View Full Brief & Audit History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {opp.isHidden ? (
                          <button
                            onClick={() => {
                              setModalAction({ opp, action: 'restore' });
                              setModerationReason('Content verified as safe and restored to public feed.');
                            }}
                            className="p-1.5 text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition"
                            title="Restore Listing to Public"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setModalAction({ opp, action: 'hide' });
                              setModerationReason('Temporarily hidden pending review of off-platform contact details.');
                            }}
                            className="p-1.5 text-amber-400 hover:bg-amber-950/40 rounded-lg transition"
                            title="Hide Listing from Marketplace"
                          >
                            <EyeOff className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setModalAction({ opp, action: 'remove' });
                            setModerationReason('Listing violates terms of service and has been permanently removed.');
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-950/40 rounded-lg transition"
                          title="Permanently Remove Opportunity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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

      {/* Full Opportunity Detail Modal (Requirement 17) */}
      {selectedOppDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full">
                    {selectedOppDetail.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    selectedOppDetail.status === 'Open' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {selectedOppDetail.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-2">{selectedOppDetail.title}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Opportunity ID: <span className="font-mono">{selectedOppDetail.id}</span></p>
              </div>

              <button
                onClick={() => setSelectedOppDetail(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Client Info Bar */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white">
                  {(selectedOppDetail.client?.name || 'C')[0]}
                </div>
                <div>
                  <p className="font-bold text-white">{selectedOppDetail.client?.name || 'Client'}</p>
                  <p className="text-slate-400">{selectedOppDetail.client?.email}</p>
                </div>
              </div>
              <div className="text-slate-400 text-right font-mono">
                <span>Phone: {selectedOppDetail.client?.phone || '—'}</span>
              </div>
            </div>

            {/* Scope / Description */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <p className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Project Scope & Description</p>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{selectedOppDetail.description}</p>
            </div>

            {/* Spec Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Budget Range</span>
                <p className="font-bold text-emerald-400 mt-0.5">₹{selectedOppDetail.budgetMin?.toLocaleString()} - ₹{selectedOppDetail.budgetMax?.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Delivery Time</span>
                <p className="font-bold text-white mt-0.5">{selectedOppDetail.expectedDeliveryDays} Days</p>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">On-Camera Required</span>
                <p className="font-bold text-white mt-0.5">{selectedOppDetail.requiresOnCamera ? 'Yes (On-Camera)' : 'No'}</p>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-xl">
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Product Shipment</span>
                <p className="font-bold text-white mt-0.5">{selectedOppDetail.requiresProductShipment ? 'Yes (Shipped)' : 'Digital'}</p>
              </div>
            </div>

            {/* Applications Preview */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">
                  Submitted Proposals ({selectedOppDetail.applicationsCount || 0})
                </p>
              </div>

              {selectedOppDetail.applications?.length === 0 ? (
                <p className="text-slate-500 italic">No proposals submitted for this opportunity yet.</p>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {selectedOppDetail.applications?.map((app: any) => (
                    <div key={app.id} className="py-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">{app.applicantName}</p>
                        <p className="text-[11px] text-slate-400">{app.applicantEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-emerald-400">₹{app.proposedPrice?.toLocaleString()}</p>
                        <span className="text-[10px] text-slate-400">{app.status} • {app.estimatedDays} days</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reports against Opportunity */}
            {selectedOppDetail.reports?.length > 0 && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 space-y-2 text-xs">
                <p className="font-semibold text-rose-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Active Reports Against Opportunity ({selectedOppDetail.reports.length})
                </p>
                {selectedOppDetail.reports.map((rep: any) => (
                  <div key={rep.id} className="p-2.5 bg-slate-950/80 rounded-lg text-slate-300">
                    <div className="flex justify-between">
                      <span className="font-bold text-rose-400">{rep.reasonCategory}</span>
                      <span className="text-[10px] text-slate-500">{new Date(rep.createdAtUtc).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] mt-1 text-slate-400">{rep.details}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Moderation Actions in Modal */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 text-xs">
              {selectedOppDetail.isHidden ? (
                <button
                  onClick={() => {
                    const opp = selectedOppDetail;
                    setSelectedOppDetail(null);
                    setModalAction({ opp, action: 'restore' });
                    setModerationReason('Content verified as safe and restored to public feed.');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                >
                  Restore to Feed
                </button>
              ) : (
                <button
                  onClick={() => {
                    const opp = selectedOppDetail;
                    setSelectedOppDetail(null);
                    setModalAction({ opp, action: 'hide' });
                    setModerationReason('Temporarily hidden pending review of off-platform contact details.');
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl"
                >
                  Hide from Feed
                </button>
              )}

              <button
                onClick={() => {
                  const opp = selectedOppDetail;
                  setSelectedOppDetail(null);
                  setModalAction({ opp, action: 'close' });
                  setModerationReason('Listing closed by administrator.');
                }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
              >
                Close Listing
              </button>

              <button
                onClick={() => {
                  const opp = selectedOppDetail;
                  setSelectedOppDetail(null);
                  setModalAction({ opp, action: 'remove' });
                  setModerationReason('Listing violates terms of service and has been permanently removed.');
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Moderation Action Modal */}
      {modalAction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Confirm Moderation Action: <span className="uppercase text-rose-400">{modalAction.action}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Target: <strong className="text-slate-200">{modalAction.opp.title}</strong>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Audit Moderation Reason *
              </label>
              <textarea
                rows={3}
                required
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="State the administrative justification for audit tracking..."
                className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setModalAction(null); setModerationReason(''); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !moderationReason.trim()}
                onClick={handleExecuteModeration}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-50"
              >
                {submitting ? 'Executing...' : 'Confirm Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
