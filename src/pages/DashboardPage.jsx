import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStatus } from '../hooks/useStatus';
import VideoStream from '../components/VideoStream';
import StatusBadge from '../components/StatusBadge';
import ActivityLog from '../components/ActivityLog';
import NotificationPanel from '../components/NotificationPanel';

const StatCard = ({ label, value, sub, icon, color = '#2dd4bf' }) => (
  <div className="card p-5 flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: `rgba(${color === '#ef4444' ? '239,68,68' : color === '#22c55e' ? '34,197,94' : '45,212,191'},0.1)`, fontSize: 20 }}>
      {icon}
    </div>
    <div>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#e2e8f0', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{sub}</p>}
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { status, history, loading, notifications, dismissNotification } = useStatus();

  const cryingCount = history.filter(l => l.status === 'crying').length;
  const silentCount = history.filter(l => l.status === 'silent').length;
  const sleepingCount = history.filter(l => l.status === 'sleeping').length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <>
      <NotificationPanel notifications={notifications} onDismiss={dismissNotification} />

      <div className="p-6 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
              {greeting()}, {user?.name?.split(' ')[0]}
            </h2>
            <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
              Your baby is being monitored in real-time
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#2dd4bf' }}>
              LIVE
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Today Events" value={history.length} icon="📋" />
          <StatCard label="Crying" value={cryingCount} icon="😢" color="#ef4444" />
          <StatCard label="Silent" value={silentCount} icon="😌" color="#22c55e" />
          <StatCard label="Sleeping" value={sleepingCount} icon="😴" color="#60a5fa" />
        </div>

        {/* Main content: video + status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video - takes 2/3 */}
          <div className="lg:col-span-2">
            <VideoStream />
          </div>

          {/* Current Status - takes 1/3 */}
          <div className="flex flex-col gap-4">
            <div className="card p-5 flex-1">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#64748b', letterSpacing: '0.06em', marginBottom: 16, textTransform: 'uppercase', fontSize: 11 }}>
                Current Status
              </h3>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="flex justify-center">
                  <StatusBadge
                    status={status?.status || 'silent'}
                    confidence={status?.confidence}
                    timestamp={status?.createdAt || status?.timestamp}
                    large
                  />
                </div>
              )}
            </div>

            {/* Last update info */}
            {status && (
              <div className="card p-4">
                <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, color: '#475569', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Last Update
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 12, color: '#64748b' }}>Time</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94a3b8' }}>
                      {new Date(status.createdAt || status.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 12, color: '#64748b' }}>Confidence</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94a3b8' }}>
                      {status.confidence ?? 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span style={{ fontSize: 12, color: '#64748b' }}>Source</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94a3b8' }}>
                      {status.source || 'ai_model'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Log */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
                Activity History
              </h3>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>
                Recent baby status events
              </p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#475569' }}>
              {history.length} events
            </span>
          </div>
          <ActivityLog logs={history} loading={loading} />
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
