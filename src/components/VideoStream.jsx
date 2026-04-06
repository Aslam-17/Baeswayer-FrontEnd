import React, { useState, useEffect } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../context/AuthContext';

const VideoStream = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [mode, setMode] = useState(null);

  const { localVideoRef, remoteVideoRef, isConnected, isStreaming, peers, error, startBroadcast, startViewing, stopStream } = useWebRTC({ role: mode });

  useEffect(() => {
    if (isConnected && remoteVideoRef.current) {
      const video = remoteVideoRef.current;
      if (video.srcObject) {
        video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
      }
    }
  }, [isConnected, remoteVideoRef]);

  useEffect(() => {
    const video = remoteVideoRef.current;
    if (!video) return;
    const handleMetadata = () => {
      video.play().catch(() => { video.muted = true; video.play().catch(() => {}); });
    };
    video.addEventListener('loadedmetadata', handleMetadata);
    return () => video.removeEventListener('loadedmetadata', handleMetadata);
  }, [remoteVideoRef]);

  const handleStartBroadcast = async () => { setMode('broadcast'); await startBroadcast(); };
  const handleStartView = () => { setMode('view'); startViewing(); };
  const handleStop = () => { stopStream(); setMode(null); };

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'rgba(255,90,150,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(255,90,150,0.1)', border: '1px solid rgba(255,90,150,0.15)' }}>
            <span style={{ fontSize: 16 }}>📹</span>
          </div>
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 15, color: '#fce8f0', fontStyle: 'italic' }}>Live Camera</h3>
            <p style={{ fontSize: 11, color: '#a06080', fontFamily: 'JetBrains Mono, monospace' }}>WebRTC Stream</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isStreaming || isConnected) && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11, color: '#f87171', fontWeight: 700 }}>LIVE</span>
            </span>
          )}
          {peers.length > 0 && (
            <span style={{ fontSize: 11, color: '#a06080', fontFamily: 'JetBrains Mono, monospace' }}>
              {peers.length} viewer{peers.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Video area */}
      <div className="video-wrap relative flex-1" style={{ minHeight: 260 }}>
        {/* Remote */}
        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"
          style={{ display: 'block', visibility: (mode === 'view' && isConnected) ? 'visible' : 'hidden',
            position: (mode === 'view' && isConnected) ? 'relative' : 'absolute' }} />

        {/* Local */}
        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"
          style={{ display: mode === 'broadcast' ? 'block' : 'none', transform: 'scaleX(-1)' }} />

        {/* Offline placeholder */}
        {!mode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: 'linear-gradient(135deg, #2a1020, #1a0a10)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center animate-float"
              style={{ background: 'rgba(255,90,150,0.08)', border: '1px solid rgba(255,90,150,0.15)' }}>
              <span style={{ fontSize: 28 }}>📷</span>
            </div>
            <div className="text-center">
              <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#a06080', fontStyle: 'italic' }}>Camera Offline</p>
              <p style={{ fontSize: 12, color: '#3d1830', marginTop: 4 }}>
                {isAdmin ? 'Start broadcasting or viewing' : 'Waiting for stream'}
              </p>
            </div>
          </div>
        )}

        {/* Connecting */}
        {mode === 'view' && !isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(26,10,16,0.92)' }}>
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: 'rgba(255,90,150,0.2)', borderTopColor: '#ff5a96' }} />
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 13, color: '#ff85b3', fontWeight: 600 }}>
              Connecting to stream...
            </p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#3d1830' }}>
              Make sure broadcaster is active
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(26,10,16,0.92)' }}>
            <div className="text-center px-6">
              <p style={{ fontSize: 28, marginBottom: 8 }}>⚠️</p>
              <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 14, color: '#f87171', fontWeight: 600 }}>{error}</p>
            </div>
          </div>
        )}

        {/* Connected badge */}
        {isConnected && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
            style={{ background: 'rgba(26,10,16,0.7)', backdropFilter: 'blur(4px)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#34d399' }}>Connected</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 py-4 border-t flex flex-wrap gap-3" style={{ borderColor: 'rgba(255,90,150,0.08)' }}>
        {!mode ? (
          <>
            {isAdmin && (
              <button onClick={handleStartBroadcast} className="btn-primary flex items-center gap-2 text-sm py-2.5 px-5">
                <span>🎥</span> Start Broadcasting
              </button>
            )}
            <button onClick={handleStartView} className="btn-ghost flex items-center gap-2 text-sm py-2.5 px-5">
              <span>👁️</span> Watch Stream
            </button>
          </>
        ) : (
          <button onClick={handleStop} className="btn-danger flex items-center gap-2 text-sm py-2.5 px-5">
            <span>⏹</span> Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoStream;
