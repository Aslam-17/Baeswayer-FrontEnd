import React from 'react';
import { StatusPill } from './StatusBadge';

const ActivityLog = ({ logs, loading, compact = false }) => {
  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: 'rgba(255,90,150,0.2)', borderTopColor: '#ff5a96' }} />
    </div>
  );

  if (!logs || logs.length === 0) return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <span style={{ fontSize: 32 }}>🌸</span>
      <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 15, color: '#a06080', fontStyle: 'italic' }}>No activity yet</p>
      <p style={{ fontSize: 12, color: '#3d1830' }}>Logs will appear when the AI model sends updates</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="data-table w-full">
        <thead>
          <tr style={{ background: 'rgba(26,10,16,0.5)' }}>
            <th className="text-left">Status</th>
            {!compact && <th className="text-left">Confidence</th>}
            {!compact && <th className="text-left">Source</th>}
            <th className="text-left">Time</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log._id}>
              <td><StatusPill status={log.status} /></td>
              {!compact && (
                <td>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,90,150,0.1)', maxWidth: 70 }}>
                      <div className="h-full rounded-full" style={{
                        width: `${log.confidence}%`,
                        background: log.confidence > 80 ? '#ef4444' : log.confidence > 50 ? '#f59e0b' : '#34d399',
                      }} />
                    </div>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a06080' }}>
                      {log.confidence}%
                    </span>
                  </div>
                </td>
              )}
              {!compact && (
                <td>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#a06080', background: 'rgba(255,90,150,0.06)', padding: '2px 8px', borderRadius: 6 }}>
                    {log.source || 'ai_model'}
                  </span>
                </td>
              )}
              <td>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a06080' }}>
                  {new Date(log.createdAt).toLocaleTimeString()}
                </p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#3d1830' }}>
                  {new Date(log.createdAt).toLocaleDateString()}
                </p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLog;
