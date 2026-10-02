import React, { useEffect, useState } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  EyeOff, 
  UserX, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import { adminApi } from '../../api';

interface AdminNotificationsProps {
  onNavigateTab?: (tab: string) => void;
}

export const AdminNotifications: React.FC<AdminNotificationsProps> = ({ onNavigateTab }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getNotifications();
      setNotifications(data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Report':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      case 'OpportunityHidden':
        return <EyeOff className="w-5 h-5 text-amber-400" />;
      case 'UserSuspended':
        return <UserX className="w-5 h-5 text-purple-400" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getNotificationBadge = (type: string, priority?: string) => {
    if (type === 'Report') {
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/30';
    }
    if (type === 'OpportunityHidden') {
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    }
    return 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30';
  };

  const handleAction = (item: any) => {
    if (!onNavigateTab) return;
    if (item.type === 'Report') {
      onNavigateTab('reports');
    } else if (item.type === 'OpportunityHidden') {
      onNavigateTab('opportunities');
    } else if (item.type === 'UserSuspended') {
      onNavigateTab('users');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Administrative Alerts & Operational Queue
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Live operational triage feed notifying administrators of newly submitted reports, content moderation queues, and user state changes.
            </p>
          </div>

          <button
            onClick={loadNotifications}
            disabled={loading}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto mb-2" />
            <p className="text-xs">Aggregating administrative alerts...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-16 text-center text-slate-400 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">All Clear!</p>
            <p className="text-xs text-slate-500">No unhandled high-priority reports or moderation items pending.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {notifications.map((item) => (
              <div key={item.id} className="p-5 hover:bg-slate-850/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getNotificationBadge(item.type)}`}>
                        {item.type}
                      </span>
                      {item.priority && (
                        <span className="text-[10px] text-rose-400 font-semibold uppercase">
                          Priority: {item.priority}
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-bold text-white mt-1">{item.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.description}</p>
                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                {onNavigateTab && (
                  <button
                    onClick={() => handleAction(item)}
                    className="shrink-0 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition self-end sm:self-center"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
