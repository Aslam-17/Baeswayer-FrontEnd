import React from 'react';

const NotificationPanel = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" style={{ maxWidth: 360 }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-start gap-3 p-4 rounded-2xl animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, #0a1a33, #071224)',
            border: '1px solid rgba(239,68,68,0.35)',
            boxShadow: '0 8px 32px rgba(239,68,68,0.15)',
          }}
        >
          <div
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.12)', fontSize: 16 }}
          >
            🚨
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, color: '#fca5a5' }}>
              Alert
            </p>
            <p style={{ fontSize: 13, color: '#cbd5e1', marginTop: 2, lineHeight: 1.4 }}>
              {n.message}
            </p>
            <p style={{ fontSize: 11, color: '#475569', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
              {new Date(n.time).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => onDismiss(n.id)}
            style={{ color: '#475569', fontSize: 18, lineHeight: 1, flexShrink: 0 }}
            className="hover:text-slate-300 transition-colors"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;
