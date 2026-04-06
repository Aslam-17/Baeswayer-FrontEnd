import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useStatus } from '../hooks/useStatus';
import VideoStream from '../components/VideoStream';
import StatusBadge from '../components/StatusBadge';
import ActivityLog from '../components/ActivityLog';
import NotificationPanel from '../components/NotificationPanel';

const StatCard = ({ label, value, icon, accent = '#ff5a96' }) => (
  <div className="card p-4 flex items-center gap-3">
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg"
      style={{ background: `${accent}18`, border: `1px solid ${accent}25` }}>
      {icon}
    </div>
    <div>
      <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#a06080', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 24, color: '#fce8f0', lineHeight: 1 }}>
        {value}
      </p>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const { status, history, loading, notifications, dismissNotification } = useStatus();

  const cryingCount  = history.filter(l => l.status === 'crying').length;
  const silentCount  = history.filter(l => l.status === 'silent').length;
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

      <div className="p-4 md:p-6 space-y-5 animate-fade-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 26, color: '#fce8f0', letterSpacing: '-0.01em', fontStyle: 'italic' }}>
              {greeting()}, {user?.name?.split(' ')[0]} 🌸
            </h2>
            <p style={{ fontSize: 13, color: '#a06080', marginTop: 4 }}>
              Your baby is being monitored in real-time
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(240,50,116,0.1)', border: '1px solid rgba(240,50,116,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#ff5a96' }} />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#ff85b3', fontWeight: 600 }}>LIVE</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Events" value={history.length} icon="📋" accent="#ff5a96" />
          <StatCard label="Crying" value={cryingCount} icon="😢" accent="#ef4444" />
          <StatCard label="Silent" value={silentCount} icon="😌" accent="#34d399" />
          <StatCard label="Sleeping" value={sleepingCount} icon="😴" accent="#93c5fd" />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Video */}
          <div className="lg:col-span-2">
            <VideoStream />
          </div>

          {/* Status panel */}
          <div className="flex flex-col gap-4">
            <div className="card p-5 flex-1">
              <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 11, color: '#a06080', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
                Current Status
              </p>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'rgba(255,90,150,0.3)', borderTopColor: '#ff5a96' }} />
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

            {status && (
              <div className="card p-4">
                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#a06080', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Last Update
                </p>
                <div className="space-y-2.5">
                  {[
                    { label: 'Time', value: new Date(status.createdAt || status.timestamp).toLocaleTimeString() },
                    { label: 'Confidence', value: `${status.confidence ?? 0}%` },
                    { label: 'Source', value: status.source || 'ai_model' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span style={{ fontSize: 12, color: '#a06080' }}>{label}</span>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e8b4c8' }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity log */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,90,150,0.08)' }}>
            <div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 16, color: '#fce8f0', fontStyle: 'italic' }}>
                Activity History
              </h3>
              <p style={{ fontSize: 12, color: '#a06080', marginTop: 2 }}>Recent baby status events</p>
            </div>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a06080' }}>
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
