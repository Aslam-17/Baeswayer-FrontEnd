import React from 'react';

const NotificationPanel = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2" style={{ maxWidth: 340 }}>
      {notifications.map(n => (
        <div key={n.id} className="flex items-start gap-3 p-4 rounded-2xl animate-slide-up"
          style={{ background: 'linear-gradient(135deg, #2a1020, #1a0a10)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 8px 32px rgba(239,68,68,0.2)' }}>
          <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.12)', fontSize: 16 }}>🚨</div>
          <div className="flex-1 min-w-0">
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 13, color: '#fca5a5' }}>Alert</p>
            <p style={{ fontSize: 13, color: '#fce8f0', marginTop: 2, lineHeight: 1.4 }}>{n.message}</p>
            <p style={{ fontSize: 11, color: '#a06080', marginTop: 4, fontFamily: 'JetBrains Mono, monospace' }}>
              {new Date(n.time).toLocaleTimeString()}
            </p>
          </div>
          <button onClick={() => onDismiss(n.id)} style={{ color: '#a06080', fontSize: 18, flexShrink: 0 }}
            className="hover:text-pink-300 transition-colors">×</button>
        </div>
      ))}
    </div>
  );
};

export default NotificationPanel;
