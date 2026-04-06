import React from 'react';

const STATUS_CONFIG = {
  crying: {
    label: 'Crying',
    color: '#f87171',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.25)',
    glow: '0 0 30px rgba(239,68,68,0.3)',
    dot: '#ef4444',
    emoji: '😢',
    desc: 'Baby needs attention',
  },
  silent: {
    label: 'Silent',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.25)',
    glow: '0 0 30px rgba(52,211,153,0.2)',
    dot: '#34d399',
    emoji: '😌',
    desc: 'Baby is calm and quiet',
  },
  sleeping: {
    label: 'Sleeping',
    color: '#93c5fd',
    bg: 'rgba(147,197,253,0.08)',
    border: 'rgba(147,197,253,0.25)',
    glow: '0 0 30px rgba(147,197,253,0.2)',
    dot: '#93c5fd',
    emoji: '😴',
    desc: 'Baby is resting peacefully',
  },
};

const StatusBadge = ({ status, confidence, timestamp, large = false }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.silent;
  const isCrying = status === 'crying';

  return (
    <div className="rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-500"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        padding: large ? '28px 36px' : '18px 24px',
        minWidth: large ? 200 : 150,
      }}>
      <div className={isCrying ? 'animate-bounce' : 'animate-float'}
        style={{ fontSize: large ? 44 : 30, marginBottom: 10 }}>
        {cfg.emoji}
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className={isCrying ? 'animate-pulse' : ''}
          style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}`, display: 'inline-block', flexShrink: 0 }} />
        <span style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: large ? 22 : 15, color: cfg.color, fontStyle: 'italic' }}>
          {cfg.label}
        </span>
      </div>
      <p style={{ fontSize: 11, color: '#a06080', fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: 10 }}>
        {cfg.desc}
      </p>
      {confidence !== undefined && (
        <div style={{ background: 'rgba(255,90,150,0.08)', borderRadius: 8, padding: '4px 12px', marginBottom: 8, border: '1px solid rgba(255,90,150,0.12)' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#e8b4c8' }}>
            {confidence}% confidence
          </span>
        </div>
      )}
      {timestamp && (
        <p style={{ fontSize: 11, color: '#3d1830', fontFamily: 'JetBrains Mono, monospace' }}>
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export const StatusDot = ({ status, size = 10 }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.silent;
  return (
    <span className={status === 'crying' ? 'animate-pulse' : ''}
      style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 ${size}px ${cfg.dot}`, flexShrink: 0 }} />
  );
};

export const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.silent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 999, padding: '3px 10px',
      fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 12, color: cfg.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
