import React from 'react';
import { StatusPill } from './StatusBadge';

const ActivityLog = ({ logs, loading, compact = false }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <span style={{ fontSize: 32 }}>📋</span>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, color: '#475569' }}>
          No activity logs yet
        </p>
        <p style={{ fontSize: 12, color: '#334155' }}>
          Logs will appear when the AI model sends updates
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'rgba(5,13,26,0.5)' }}>
            <th className="text-left">Status</th>
            {!compact && <th className="text-left">Confidence</th>}
            {!compact && <th className="text-left">Source</th>}
            <th className="text-left">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log._id}>
              <td>
                <StatusPill status={log.status} />
              </td>
              {!compact && (
                <td>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#0f2647', maxWidth: 80 }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${log.confidence}%`,
                          background: log.confidence > 80 ? '#ef4444' : log.confidence > 50 ? '#f59e0b' : '#22c55e',
                        }}
                      />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#64748b' }}>
                      {log.confidence}%
                    </span>
                  </div>
                </td>
              )}
              {!compact && (
                <td>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#475569',
                    background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4,
                  }}>
                    {log.source || 'ai_model'}
                  </span>
                </td>
              )}
              <td>
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#64748b' }}>
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </p>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#334155' }}>
                    {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLog;
