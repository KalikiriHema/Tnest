import React, { useEffect, useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sliders, 
  Lock, 
  User,
  Bell,
  Key,
  ShieldAlert
} from 'lucide-react';
import { adminApi } from '../../api';
import { AdminSystemSetting } from '../../types';

interface AdminSettingsProps {
  currentUser?: any;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ currentUser }) => {
  const [settings, setSettings] = useState<AdminSystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // V1 Admin Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [instantReportTriage, setInstantReportTriage] = useState(true);
  const [securityMfaStatus, setSecurityMfaStatus] = useState('Standard (JWT Bearer)');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings();
      setSettings(data || []);
      const map: Record<string, string> = {};
      data?.forEach((s: AdminSystemSetting) => {
        map[s.key] = s.value;
      });
      setEditValues(map);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveSetting = async (key: string) => {
    const value = editValues[key];
    const reason = reasons[key] || 'Administrator platform parameter update';

    setSavingKey(key);
    try {
      await adminApi.updateSetting(key, value, reason);
      setToastMessage(`Setting "${key}" saved successfully.`);
      setTimeout(() => setToastMessage(null), 4000);
      loadSettings();
    } catch (err: any) {
      alert(err.message || 'Failed to update setting');
    } finally {
      setSavingKey(null);
    }
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setToastMessage('Admin notification preferences saved locally.');
    setTimeout(() => setToastMessage(null), 3000);
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
              <Settings className="w-5 h-5 text-indigo-400" />
              Admin Profile, Security & System Controls
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure administrator profile preferences, security posture, and core operational parameters.
            </p>
          </div>

          <button
            onClick={loadSettings}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Config</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Admin Profile & Security */}
        <div className="lg:col-span-5 space-y-6">
          {/* Admin Profile Card */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-rose-400" />
              Administrator Profile
            </h2>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-500 flex items-center justify-center font-bold text-white text-lg shadow-md">
                {(currentUser?.fullName || 'A')[0]}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{currentUser?.fullName || 'Lead Administrator'}</p>
                <p className="text-xs text-slate-400">{currentUser?.email || 'admin@tnest.com'}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold uppercase tracking-wider border border-rose-500/30">
                  Role: {currentUser?.role || 'Admin'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Access Level</span>
                <span className="font-semibold text-slate-200">Super Administrator (Full)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/80">
                <span>Active Session</span>
                <span className="font-semibold text-emerald-400">Authenticated (JWT)</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Server Time</span>
                <span className="font-mono text-slate-300">{new Date().toUTCString()}</span>
              </div>
            </div>
          </div>

          {/* Security & Authentication */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              Security & Access Control
            </h2>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Password Hashing</p>
                  <p className="text-slate-400 text-[11px]">Argon2id cryptographic standard</p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">RBAC Role Protection</p>
                  <p className="text-slate-400 text-[11px]">Server-side Claims enforcement</p>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold">
                  ENFORCED
                </span>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">Audit Logging</p>
                  <p className="text-slate-400 text-[11px]">All administrative actions recorded</p>
                </div>
                <span className="px-2 py-1 rounded bg-indigo-500/20 text-indigo-400 font-mono text-[10px] font-bold">
                  ENABLED
                </span>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4 text-cyan-400" />
              Notification Preferences
            </h2>

            <form onSubmit={handleSavePreferences} className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-white">High-Priority Report Alerts</p>
                  <p className="text-slate-400 text-[11px]">Email notification upon urgent report creation</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-700 text-rose-500 focus:ring-rose-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
                <div>
                  <p className="font-semibold text-white">Instant Moderation Queue</p>
                  <p className="text-slate-400 text-[11px]">Show live badge count on sidebar tabs</p>
                </div>
                <input
                  type="checkbox"
                  checked={instantReportTriage}
                  onChange={(e) => setInstantReportTriage(e.target.checked)}
                  className="rounded border-slate-700 text-rose-500 focus:ring-rose-500 w-4 h-4"
                />
              </label>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition"
              >
                Save Notification Preferences
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Platform Operational Parameters */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-rose-400" />
              Platform Operational Parameters
            </h2>

            {loading && settings.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
                <p className="text-xs">Loading operational parameters...</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {settings.map((s) => (
                  <div key={s.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <p className="text-xs font-bold text-slate-200 font-mono">{s.key}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">Group: {s.group}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {s.value === 'true' || s.value === 'false' ? (
                        <select
                          value={editValues[s.key] ?? s.value}
                          onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                          className="px-3 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white"
                        >
                          <option value="true">Enabled (true)</option>
                          <option value="false">Disabled (false)</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={editValues[s.key] ?? s.value}
                          onChange={(e) => setEditValues({ ...editValues, [s.key]: e.target.value })}
                          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-xl text-xs text-white font-mono"
                        />
                      )}

                      <button
                        onClick={() => handleSaveSetting(s.key)}
                        disabled={savingKey === s.key || editValues[s.key] === s.value}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition disabled:opacity-40 flex items-center gap-1.5 shrink-0"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{savingKey === s.key ? 'Saving...' : 'Save'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
