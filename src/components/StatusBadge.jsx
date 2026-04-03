import React from 'react';

const STATUS_CONFIG = {
  crying: {
    label: 'Crying',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.3)',
    glow: '0 0 24px rgba(239,68,68,0.35)',
    dot: '#ef4444',
    emoji: '😢',
    desc: 'Baby needs attention',
  },
  silent: {
    label: 'Silent',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.3)',
    glow: '0 0 24px rgba(34,197,94,0.25)',
    dot: '#22c55e',
    emoji: '😌',
    desc: 'Baby is calm and quiet',
  },
  sleeping: {
    label: 'Sleeping',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.3)',
    glow: '0 0 24px rgba(96,165,250,0.25)',
    dot: '#60a5fa',
    emoji: '😴',
    desc: 'Baby is resting peacefully',
  },
};

const StatusBadge = ({ status, confidence, timestamp, large = false }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.silent;
  const isCrying = status === 'crying';

  return (
    <div
      className="rounded-2xl flex flex-col items-center justify-center text-center transition-all duration-500"
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: cfg.glow,
        padding: large ? '32px 40px' : '20px 28px',
        minWidth: large ? 220 : 160,
      }}
    >
      {/* Pulsing emoji */}
      <div
        className={isCrying ? 'animate-bounce' : ''}
        style={{ fontSize: large ? 48 : 32, marginBottom: 12 }}
      >
        {cfg.emoji}
      </div>

      {/* Status dot + label */}
      <div className="flex items-center gap-2 mb-1">
        <span
          className={isCrying ? 'animate-pulse' : ''}
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: cfg.dot,
            boxShadow: `0 0 6px ${cfg.dot}`,
            display: 'inline-block',
          }}
        />
        <span style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 700,
          fontSize: large ? 24 : 16,
          color: cfg.color,
          letterSpacing: '-0.01em',
        }}>
          {cfg.label}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: '#64748b', fontFamily: 'DM Sans, sans-serif', marginBottom: 10 }}>
        {cfg.desc}
      </p>

      {/* Confidence */}
      {confidence !== undefined && (
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 8,
          padding: '4px 12px',
          marginBottom: 8,
        }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94a3b8' }}>
            {confidence}% confidence
          </span>
        </div>
      )}

      {/* Timestamp */}
      {timestamp && (
        <p style={{ fontSize: 11, color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>
          {new Date(timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export const StatusDot = ({ status, size = 10 }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.silent;
  const isCrying = status === 'crying';
  return (
    <span
      className={isCrying ? 'animate-pulse' : ''}
      style={{
        display: 'inline-block',
        width: size, height: size,
        borderRadius: '50%',
        background: cfg.dot,
        boxShadow: `0 0 ${size}px ${cfg.dot}`,
        flexShrink: 0,
      }}
    />
  );
};

export const StatusPill = ({ status }) => {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.silent;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      borderRadius: 999, padding: '3px 10px',
      fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 12,
      color: cfg.color, letterSpacing: '0.03em',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
