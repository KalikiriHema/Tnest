import React, { useEffect, useState } from 'react';
import { 
  Search, 
  UserX, 
  UserCheck, 
  Shield, 
  Star, 
  ExternalLink, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  RefreshCw,
  Eye,
  Briefcase,
  FileText
} from 'lucide-react';
import { adminApi } from '../../api';
import { AdminUserListItem, AdminUserDetail } from '../../types';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Suspend / Reactivate Modal State
  const [actionUser, setActionUser] = useState<AdminUserListItem | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: search.trim() || undefined,
        role: roleFilter,
        status: statusFilter,
        page,
        pageSize: 15
      });
      setUsers(res.items || []);
      setTotal(res.total || 0);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page, roleFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleViewDetails = async (userId: string) => {
    setDetailLoading(true);
    try {
      const detail = await adminApi.getUserById(userId);
      setSelectedUser(detail);
    } catch (err: any) {
      alert(err.message || 'Failed to fetch user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!actionUser) return;
    if (!actionUser.isActive && !actionReason.trim()) {
      alert('A reason is required to reactivate or suspend accounts.');
      return;
    }
    if (actionUser.isActive && !actionReason.trim()) {
      alert('Please state a reason for suspending this account.');
      return;
    }

    setActionSubmitting(true);
    try {
      const newStatus = !actionUser.isActive;
      await adminApi.updateUserStatus(actionUser.id, {
        isActive: newStatus,
        reason: actionReason.trim()
      });

      setToastMessage(`User ${actionUser.email} is now ${newStatus ? 'Active' : 'Suspended'}.`);
      setTimeout(() => setToastMessage(null), 4000);

      setActionUser(null);
      setActionReason('');
      loadUsers();
      if (selectedUser?.id === actionUser.id) {
        handleViewDetails(actionUser.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    } finally {
      setActionSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-700 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Filters */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-400" />
              User Directory & Account Governance
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Search, inspect profiles, manage account states, and view activity history.
            </p>
          </div>

          <div className="text-xs text-slate-400">
            Total Matching: <strong className="text-white font-bold">{total}</strong> Users
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone number..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500 transition"
            />
          </form>

          <div className="sm:col-span-3">
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Roles</option>
              <option value="Client">Clients</option>
              <option value="Professional">Doers / Professionals</option>
              <option value="DualRole">Dual Role</option>
              <option value="Admin">Administrators</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 bg-slate-950/80 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-slate-200"
            >
              <option value="all">All Account Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
            <p className="text-xs">Loading user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-xs">
            No users found matching current filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Performance</th>
                  <th className="py-3.5 px-4">Joined</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-white truncate">{u.fullName}</p>
                          <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'Admin' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                        u.role === 'Client' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                        u.role === 'DualRole' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-400 text-[11px] font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Active
                        </span>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1.5 text-rose-400 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Suspended
                          </span>
                          {u.suspensionReason && (
                            <p className="text-[10px] text-slate-500 truncate max-w-[150px]">{u.suspensionReason}</p>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {u.phoneNumber || '—'}
                    </td>

                    <td className="py-3 px-4">
                      {u.role === 'Professional' || u.role === 'DualRole' ? (
                        <div className="flex items-center gap-2">
                          <span className="flex items-center text-amber-400 font-semibold gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" /> {u.rating > 0 ? u.rating.toFixed(1) : 'New'}
                          </span>
                          <span className="text-[10px] text-slate-400">({u.completedProjects} proj)</span>
                        </div>
                      ) : (
                        <span className="text-slate-500">{u.companyName || 'Client Profile'}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {new Date(u.createdAtUtc).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(u.id)}
                          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                          title="View Full Profile Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {u.role !== 'Admin' && (
                          <button
                            onClick={() => {
                              setActionUser(u);
                              setActionReason(u.isActive ? '' : 'Account reactivation approval');
                            }}
                            className={`p-1.5 rounded-lg transition ${
                              u.isActive
                                ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
                                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
                            }`}
                            title={u.isActive ? 'Suspend User Account' : 'Reactivate User Account'}
                          >
                            {u.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        )}
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

      {/* User Details Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.professionalProfile?.avatarUrl || selectedUser.clientProfile?.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.id}`}
                  alt={selectedUser.fullName}
                  className="w-11 h-11 rounded-full object-cover border border-slate-700 bg-slate-800"
                />
                <div>
                  <h2 className="text-base font-bold text-white">{selectedUser.fullName}</h2>
                  <p className="text-xs text-slate-400">{selectedUser.email} • ID: <span className="font-mono">{selectedUser.id.substring(0, 8)}</span></p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
              {/* Account Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Account Role</span>
                  <p className="text-sm font-bold text-rose-400 mt-1">{selectedUser.role}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Status</span>
                  <p className={`text-sm font-bold mt-1 ${selectedUser.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {selectedUser.isActive ? 'Active' : 'Suspended'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Projects Done</span>
                  <p className="text-sm font-bold text-white mt-1">{selectedUser.stats.projectsCount}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Reports Against</span>
                  <p className={`text-sm font-bold mt-1 ${selectedUser.stats.reportsCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {selectedUser.stats.reportsCount}
                  </p>
                </div>
              </div>

              {/* Suspension Notice if Suspended */}
              {!selectedUser.isActive && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200">
                  <p className="font-semibold text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" /> Account Currently Suspended
                  </p>
                  <p className="text-[11px] mt-1 text-rose-200/90">
                    Reason: {selectedUser.suspensionReason || 'Administrator policy enforcement.'}
                  </p>
                </div>
              )}

              {/* Professional Details if present */}
              {selectedUser.professionalProfile && (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-emerald-400" /> Professional Profile (Doer)
                  </h3>
                  <p className="text-slate-300 italic">"{selectedUser.professionalProfile.headline}"</p>
                  <p className="text-slate-400">{selectedUser.professionalProfile.bio}</p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedUser.professionalProfile.skills?.map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>

                  {selectedUser.professionalProfile.portfolio?.length > 0 && (
                    <div className="pt-3 border-t border-slate-800/80">
                      <p className="font-semibold text-slate-300 mb-2">Portfolio Samples ({selectedUser.professionalProfile.portfolio.length})</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {selectedUser.professionalProfile.portfolio.map((item: any) => (
                          <div key={item.id} className="p-2 bg-slate-900 border border-slate-800 rounded-lg">
                            <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                            <p className="text-[10px] text-slate-400">{item.rolePerformed}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Client Details if present */}
              {selectedUser.clientProfile && (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" /> Client Profile
                  </h3>
                  <p className="text-slate-300 font-semibold">{selectedUser.clientProfile.companyName || 'Individual Client'}</p>
                  <p className="text-slate-400">{selectedUser.clientProfile.bio || 'Verified Client commissioning requirements on TNEST.'}</p>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <span className="text-[11px] text-slate-500">
                Registered: {new Date(selectedUser.createdAtUtc).toLocaleString()}
              </span>

              {selectedUser.role !== 'Admin' && (
                <button
                  onClick={() => {
                    const item = users.find(u => u.id === selectedUser.id);
                    if (item) {
                      setActionUser(item);
                      setActionReason(item.isActive ? '' : 'Account reactivation approval');
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    selectedUser.isActive 
                      ? 'bg-rose-600 hover:bg-rose-500 text-white' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  {selectedUser.isActive ? 'Suspend Account' : 'Reactivate Account'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend / Reactivate Confirmation Modal */}
      {actionUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className={`w-5 h-5 ${actionUser.isActive ? 'text-rose-400' : 'text-emerald-400'}`} />
              {actionUser.isActive ? 'Suspend User Account' : 'Reactivate User Account'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Target: <strong className="text-slate-200">{actionUser.fullName}</strong> ({actionUser.email})
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Audit Reason & Justification *
              </label>
              <textarea
                rows={3}
                required
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionUser.isActive ? "e.g. Terms of Service violation regarding off-platform solicitations..." : "e.g. Identity verified and dispute resolved with client..."}
                className="w-full p-3 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white placeholder-slate-500"
              />
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => { setActionUser(null); setActionReason(''); }}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionSubmitting || !actionReason.trim()}
                onClick={handleToggleStatus}
                className={`px-4 py-2 rounded-xl text-xs font-semibold text-white transition disabled:opacity-50 ${
                  actionUser.isActive ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
                }`}
              >
                {actionSubmitting ? 'Processing...' : (actionUser.isActive ? 'Confirm Suspension' : 'Confirm Reactivation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
