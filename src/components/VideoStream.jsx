import React, { useState } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';
import { useAuth } from '../context/AuthContext';

const VideoStream = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [mode, setMode] = useState(null); // 'broadcast' | 'view' | null

  const {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isStreaming,
    peers,
    error,
    startBroadcast,
    startViewing,
    stopStream,
  } = useWebRTC({ role: mode });

  const handleStartBroadcast = async () => {
    setMode('broadcast');
    await startBroadcast();
  };

  const handleStartView = () => {
    setMode('view');
    startViewing();
  };

  const handleStop = () => {
    stopStream();
    setMode(null);
  };

  return (
    <div className="card flex flex-col overflow-hidden" style={{ background: 'linear-gradient(135deg, #071224, #050d1a)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 18 }}>📹</span>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
              Live Camera
            </h3>
            <p style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
              WebRTC Stream
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(isStreaming || isConnected) && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, color: '#f87171', fontWeight: 700 }}>LIVE</span>
            </span>
          )}
          {peers.length > 0 && (
            <span style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
              {peers.length} viewer{peers.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Video Area */}
      <div className="relative flex-1 bg-black" style={{ minHeight: 280, aspectRatio: '16/9' }}>
        {/* Remote stream (viewer mode) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
          style={{ display: mode === 'view' ? 'block' : 'none' }}
        />

        {/* Local stream (broadcast mode) */}
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ display: mode === 'broadcast' ? 'block' : 'none', transform: 'scaleX(-1)' }}
        />

        {/* Placeholder when not streaming */}
        {!mode && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            style={{ background: 'linear-gradient(135deg, #071224, #050d1a)' }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)' }}>
              <span style={{ fontSize: 28 }}>📷</span>
            </div>
            <div className="text-center">
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, color: '#475569', fontWeight: 600 }}>
                Camera Offline
              </p>
              <p style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
                {isAdmin ? 'Start broadcasting or viewing' : 'Waiting for camera stream'}
              </p>
            </div>
          </div>
        )}

        {/* View mode: waiting for broadcaster */}
        {mode === 'view' && !isConnected && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            style={{ background: 'rgba(5,13,26,0.85)' }}>
            <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, color: '#2dd4bf' }}>
              Connecting to stream...
            </p>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(5,13,26,0.9)' }}>
            <div className="text-center px-6">
              <p style={{ fontSize: 24, marginBottom: 8 }}>⚠️</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, color: '#f87171' }}>{error}</p>
            </div>
          </div>
        )}

        {/* Corner overlay info */}
        {isConnected && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(5,13,26,0.7)', backdropFilter: 'blur(4px)' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#22c55e' }}>
              Connected
            </span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-5 py-4 border-t border-white/5 flex flex-wrap gap-3">
        {!mode ? (
          <>
            {isAdmin && (
              <button onClick={handleStartBroadcast} className="btn-primary flex items-center gap-2 text-sm py-2.5">
                <span>🎥</span> Start Broadcasting
              </button>
            )}
            <button onClick={handleStartView} className="btn-ghost flex items-center gap-2 text-sm py-2.5">
              <span>👁️</span> Watch Stream
            </button>
          </>
        ) : (
          <button onClick={handleStop} className="btn-danger flex items-center gap-2 text-sm py-2.5">
            <span>⏹</span> Stop
          </button>
        )}
      </div>
    </div>
  );
};

export default VideoStream;
