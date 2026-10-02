import React, { useEffect, useState } from 'react';
import { 
  FolderLock, 
  Star, 
  Eye, 
  EyeOff, 
  Trash2, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  User,
  Briefcase
} from 'lucide-react';
import { adminApi } from '../../api';
import { AdminPortfolioItem, AdminReviewItem } from '../../types';

interface AdminModerationProps {
  initialTab?: 'portfolios' | 'reviews';
}

export const AdminModeration: React.FC<AdminModerationProps> = ({ initialTab = 'portfolios' }) => {
  const [activeTab, setActiveTab] = useState<'portfolios' | 'reviews'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  // Portfolios state
  const [portfolios, setPortfolios] = useState<AdminPortfolioItem[]>([]);
  const [portfolioTotal, setPortfolioTotal] = useState(0);
  const [portfolioPage, setPortfolioPage] = useState(1);
  const [portfolioHiddenFilter, setPortfolioHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  // Reviews state
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewHiddenFilter, setReviewHiddenFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [reviewLoading, setReviewLoading] = useState(true);

  // Moderation Action Modal
  const [modTarget, setModTarget] = useState<{
    type: 'portfolio' | 'review';
    id: string;
    title: string;
    action: 'hide' | 'restore' | 'remove';
  } | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadPortfolios = async () => {
    setPortfolioLoading(true);
    try {
      const res = await adminApi.getPortfolios({
        isHidden: portfolioHiddenFilter === 'all' ? undefined : portfolioHiddenFilter === 'hidden',
        page: portfolioPage,
        pageSize: 12
      });
      setPortfolios(res.items || []);
      setPortfolioTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const loadReviews = async () => {
    setReviewLoading(true);
    try {
      const res = await adminApi.getReviews({
        isHidden: reviewHiddenFilter === 'all' ? undefined : reviewHiddenFilter === 'hidden',
        page: reviewPage,
        pageSize: 12
      });
      setReviews(res.items || []);
      setReviewTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'portfolios') {
      loadPortfolios();
    } else {
      loadReviews();
    }
  }, [activeTab, portfolioPage, portfolioHiddenFilter, reviewPage, reviewHiddenFilter]);

  const handleExecuteModeration = async () => {
    if (!modTarget) return;
    if (!reason.trim()) {
      alert('A moderation justification reason is required.');
      return;
    }

    setSubmitting(true);
    try {
      if (modTarget.type === 'portfolio') {
        await adminApi.moderatePortfolio(modTarget.id, {
          action: modTarget.action,
          reason: reason.trim()
        });
        loadPortfolios();
      } else {
        await adminApi.moderateReview(modTarget.id, {
          action: modTarget.action,
          reason: reason.trim()
        });
        loadReviews();
      }

      setToastMessage(`${modTarget.type === 'portfolio' ? 'Portfolio item' : 'Review'} ${modTarget.action}d successfully.`);
      setTimeout(() => setToastMessage(null), 4000);

      setModTarget(null);
      setReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to execute moderation action');
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

      {/* Header & Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              {activeTab === 'portfolios' ? (
                <>
                  <FolderLock className="w-5 h-5 text-rose-400" />
                  Portfolio Moderation & Quality Assurance
                </>
              ) : (
                <>
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400/20" />
                  Review & Reputation Moderation
                </>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'portfolios'
                ? 'Verify creator work samples, review media attachments, and enforce platform portfolio standards.'
                : 'Audit client star ratings, testimonials, and verified milestone feedback across the platform.'}
            </p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('portfolios')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'portfolios'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderLock className="w-4 h-4" />
            <span>Portfolio Moderation</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                : 'bg-slate-800/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Review & Rating Moderation</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PORTFOLIO MODERATION */}
      {activeTab === 'portfolios' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Portfolios: <strong className="text-white">{portfolioTotal}</strong></span>
            <select
              value={portfolioHiddenFilter}
              onChange={(e) => { setPortfolioHiddenFilter(e.target.value as any); setPortfolioPage(1); }}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Portfolios</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>

          {portfolioLoading ? (
            <div className="p-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
              <p className="text-xs">Loading creator portfolios...</p>
            </div>
          ) : portfolios.length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
              No portfolio items found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolios.map((item) => (
                <div 
                  key={item.id}
                  className={`p-4 rounded-2xl bg-slate-900/90 border transition shadow-lg flex flex-col justify-between ${
                    item.isHidden ? 'border-rose-800/80 bg-rose-950/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Media preview thumbnail if available */}
                    {item.thumbnailUrl || item.mediaUrl ? (
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative">
                        <img 
                          src={item.thumbnailUrl || item.mediaUrl} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] font-bold text-white uppercase">
                          {item.mediaType}
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-video w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-600 text-xs">
                        No Media Preview Available
                      </div>
                    )}

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                          {item.categorySlug}
                        </span>
                        {item.isHidden && (
                          <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-sm mt-0.5">{item.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                    </div>

                    <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span>Creator: <strong className="text-slate-300">{item.creatorName}</strong></span>
                      <span>{new Date(item.createdAtUtc).toLocaleDateString()}</span>
                    </div>

                    {item.isHidden && item.moderationReason && (
                      <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/80 text-[11px] text-rose-300">
                        <strong>Moderator note:</strong> {item.moderationReason}
                      </div>
                    )}
                  </div>

                  {/* Moderation Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    {item.liveUrl && (
                      <a
                        href={item.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                      >
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      {item.isHidden ? (
                        <button
                          onClick={() => {
                            setModTarget({ type: 'portfolio', id: item.id, title: item.title, action: 'restore' });
                            setReason('Portfolio sample verified and approved for marketplace showcase.');
                          }}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setModTarget({ type: 'portfolio', id: item.id, title: item.title, action: 'hide' });
                            setReason('Flagged for review: suspected copyright or policy violation.');
                          }}
                          className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          <span>Hide</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setModTarget({ type: 'portfolio', id: item.id, title: item.title, action: 'remove' });
                          setReason('Violates portfolio upload guidelines.');
                        }}
                        className="p-1 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                        title="Delete Portfolio Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: REVIEW MODERATION */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Completed Project Reviews: <strong className="text-white">{reviewTotal}</strong></span>
            <select
              value={reviewHiddenFilter}
              onChange={(e) => { setReviewHiddenFilter(e.target.value as any); setReviewPage(1); }}
              className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Reviews</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>

          {reviewLoading ? (
            <div className="p-16 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
              <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
              <p className="text-xs">Loading marketplace reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-16 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
              No project reviews found.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Review & Comment</th>
                      <th className="py-3.5 px-4">Client</th>
                      <th className="py-3.5 px-4">Doer / Professional</th>
                      <th className="py-3.5 px-4">Project ID</th>
                      <th className="py-3.5 px-4 text-right">Moderation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-850/50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-4 h-4 fill-amber-400" />
                            <span>{r.overallRating}.0</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 max-w-sm">
                          <p className="text-slate-200 font-medium line-clamp-2">"{r.comment}"</p>
                          {r.professionalResponse && (
                            <p className="text-[11px] text-slate-400 italic mt-1">Reply: {r.professionalResponse}</p>
                          )}
                          {r.isHidden && (
                            <span className="inline-block text-[10px] text-rose-400 font-semibold mt-1">
                              ⚠️ Hidden: {r.moderationReason}
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-200">{r.clientName}</p>
                          <p className="text-[11px] text-slate-500">{r.clientEmail}</p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-medium text-slate-200">{r.doerName}</p>
                          <p className="text-[11px] text-slate-500">{r.doerEmail}</p>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                          {r.projectId.substring(0, 8)}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.isHidden ? (
                              <button
                                onClick={() => {
                                  setModTarget({ type: 'review', id: r.id, title: `Review by ${r.clientName}`, action: 'restore' });
                                  setReason('Review verified as authentic and compliant with guidelines.');
                                }}
                                className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Restore</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setModTarget({ type: 'review', id: r.id, title: `Review by ${r.clientName}`, action: 'hide' });
                                  setReason('Review hidden due to abusive language or policy violation.');
                                }}
                                className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Hide</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setModTarget({ type: 'review', id: r.id, title: `Review by ${r.clientName}`, action: 'remove' });
                                setReason('Review permanently removed by administration.');
                              }}
                              className="p-1 text-rose-400 hover:bg-rose-950/40 rounded-lg"
                              title="Delete Review"
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
            </div>
          )}
        </div>
      )}

      {/* Moderation Confirmation Modal */}
      {modTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Confirm {modTarget.type === 'portfolio' ? 'Portfolio' : 'Review'} Action: <span className="uppercase text-rose-400">{modTarget.action}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Target: <strong className="text-slate-200">{modTarget.title}</strong>
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Audit Reason & Moderation Justification *
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the reason for this moderation action to record in compliance audit logs..."
                className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setModTarget(null); setReason(''); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !reason.trim()}
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
