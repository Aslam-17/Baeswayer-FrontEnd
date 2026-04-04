import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '../utils/socket';

const ROOM_ID = 'baby-monitor-room';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:openrelay.metered.ca:80',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
    {
      urls: 'turn:openrelay.metered.ca:443',
      username: 'openrelayproject',
      credential: 'openrelayproject',
    },
  ],
};

/**
 * CORRECT WebRTC Flow:
 *
 * BROADCASTER (admin):
 *   1. Gets camera stream
 *   2. Joins room
 *   3. When viewer joins → broadcaster creates offer WITH tracks → sends to viewer
 *
 * VIEWER:
 *   1. Joins room
 *   2. Waits for broadcaster's offer
 *   3. Receives offer → creates answer → sends back
 *   4. Receives video via ontrack
 *
 * KEY: Only the BROADCASTER creates offers. Viewer only answers.
 */

export const useWebRTC = ({ role = 'viewer' }) => {
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const localStreamRef     = useRef(null);
  const pendingCandidates  = useRef({});
  const isBroadcaster      = useRef(false);

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming,  setIsStreaming] = useState(false);
  const [peers,        setPeers]      = useState([]);
  const [error,        setError]      = useState(null);

  const socket = getSocket();

  // ── Flush buffered ICE candidates ──────────────────────────────────────────
  const flushCandidates = useCallback(async (peerId) => {
    const pc = peerConnectionsRef.current[peerId];
    if (!pc) return;
    const candidates = pendingCandidates.current[peerId] || [];
    for (const c of candidates) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch {}
    }
    pendingCandidates.current[peerId] = [];
  }, []);

  // ── Create peer connection ──────────────────────────────────────────────────
  const createPC = useCallback((peerId) => {
    // Close existing if any
    if (peerConnectionsRef.current[peerId]) {
      try { peerConnectionsRef.current[peerId].close(); } catch {}
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pendingCandidates.current[peerId] = [];

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit('webrtc-ice-candidate', { to: peerId, candidate });
      }
    };

    // ✅ This fires on the VIEWER when broadcaster's tracks arrive
    pc.ontrack = ({ streams }) => {
      console.log('[WebRTC] Got remote track!', streams[0]);
      if (streams[0] && remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = streams[0];
        // Force play
        remoteVideoRef.current.play().catch(() => {
          remoteVideoRef.current.muted = true;
          remoteVideoRef.current.play().catch(() => {});
        });
        setIsConnected(true);
      }
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state (${peerId}):`, pc.connectionState);
      if (pc.connectionState === 'connected') setIsConnected(true);
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        if (!isBroadcaster.current) setIsConnected(false);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE state (${peerId}):`, pc.iceConnectionState);
    };

    peerConnectionsRef.current[peerId] = pc;
    return pc;
  }, [socket]);

  // ── BROADCASTER: get camera, join room, wait for viewers ───────────────────
  const startBroadcast = useCallback(async () => {
    try {
      setError(null);
      isBroadcaster.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: true,
      });
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.play().catch(() => {});
      }

      setIsStreaming(true);
      socket.emit('join-room', ROOM_ID);
      console.log('[WebRTC] Broadcasting started, joined room');

    } catch (err) {
      isBroadcaster.current = false;
      setError('Camera access denied. Please allow camera permissions.');
      console.error('[WebRTC] startBroadcast error:', err);
    }
  }, [socket]);

  // ── VIEWER: join room, wait for broadcaster's offer ────────────────────────
  const startViewing = useCallback(() => {
    setError(null);
    isBroadcaster.current = false;
    socket.emit('join-room', ROOM_ID);
    console.log('[WebRTC] Viewer joined room, waiting for broadcaster offer...');
    // Viewer does NOT create offer — waits for broadcaster to send one
  }, [socket]);

  // ── Stop ───────────────────────────────────────────────────────────────────
  const stopStream = useCallback(() => {
    isBroadcaster.current = false;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }

    Object.values(peerConnectionsRef.current).forEach(pc => {
      try { pc.close(); } catch {}
    });
    peerConnectionsRef.current = {};
    pendingCandidates.current = {};

    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;

    socket.emit('leave-room', ROOM_ID);
    socket.off('peer-joined');
    socket.off('room-peers');

    setIsStreaming(false);
    setIsConnected(false);
    setPeers([]);
  }, [socket]);

  // ── Signaling event handlers ────────────────────────────────────────────────
  useEffect(() => {

    // ── New viewer joined → broadcaster sends offer WITH camera tracks ──
    const handlePeerJoined = async (viewerId) => {
      if (!isBroadcaster.current || !localStreamRef.current) return;

      console.log('[WebRTC] Viewer joined:', viewerId, '— sending offer with tracks');
      const pc = createPC(viewerId);

      // Add all camera tracks to the connection
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
        console.log('[WebRTC] Added track:', track.kind);
      });

      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { to: viewerId, offer });
        setPeers(prev => [...new Set([...prev, viewerId])]);
        console.log('[WebRTC] Offer sent to viewer:', viewerId);
      } catch (err) {
        console.error('[WebRTC] Error creating offer:', err);
      }
    };

    // ── Broadcaster already in room when viewer joins ──
    const handleRoomPeers = async (broadcasterIds) => {
      if (isBroadcaster.current) return; // broadcaster doesn't need this
      console.log('[WebRTC] Room peers (broadcasters):', broadcasterIds);
      // Viewer just joined — broadcaster will get 'peer-joined' and send offer
      // Nothing to do here for viewer
    };

    // ── Incoming OFFER → only viewer receives this from broadcaster ──
    const handleOffer = async ({ from, offer }) => {
      console.log('[WebRTC] Received offer from:', from, 'isBroadcaster:', isBroadcaster.current);

      // If we're the broadcaster receiving a viewer's offer — ignore
      // (in our flow, only broadcaster sends offers)
      if (isBroadcaster.current) {
        console.warn('[WebRTC] Broadcaster received offer — ignoring (wrong flow)');
        return;
      }

      const pc = createPC(from);

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushCandidates(from);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('webrtc-answer', { to: from, answer });
        console.log('[WebRTC] Answer sent to broadcaster:', from);
      } catch (err) {
        console.error('[WebRTC] Error handling offer:', err.message);
      }
    };

    // ── Incoming ANSWER → only broadcaster receives this from viewer ──
    const handleAnswer = async ({ from, answer }) => {
      console.log('[WebRTC] Received answer from:', from);
      const pc = peerConnectionsRef.current[from];
      if (!pc) {
        console.warn('[WebRTC] No PC found for:', from);
        return;
      }
      if (pc.signalingState !== 'have-local-offer') {
        console.warn('[WebRTC] Wrong state for answer:', pc.signalingState);
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushCandidates(from);
        console.log('[WebRTC] Answer set — connection establishing...');
      } catch (err) {
        console.error('[WebRTC] Error handling answer:', err.message);
      }
    };

    // ── ICE candidates ──
    const handleIce = async ({ from, candidate }) => {
      const pc = peerConnectionsRef.current[from];
      if (!pc) return;
      if (!pc.remoteDescription?.type) {
        pendingCandidates.current[from] = pendingCandidates.current[from] || [];
        pendingCandidates.current[from].push(candidate);
        return;
      }
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    };

    // ── Peer disconnected ──
    const handlePeerLeft = (peerId) => {
      console.log('[WebRTC] Peer left:', peerId);
      const pc = peerConnectionsRef.current[peerId];
      if (pc) { try { pc.close(); } catch {} delete peerConnectionsRef.current[peerId]; }
      delete pendingCandidates.current[peerId];
      setPeers(prev => prev.filter(id => id !== peerId));
      if (!isBroadcaster.current && Object.keys(peerConnectionsRef.current).length === 0) {
        setIsConnected(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      }
    };

    socket.on('peer-joined',          handlePeerJoined);
    socket.on('room-peers',           handleRoomPeers);
    socket.on('webrtc-offer',         handleOffer);
    socket.on('webrtc-answer',        handleAnswer);
    socket.on('webrtc-ice-candidate', handleIce);
    socket.on('peer-left',            handlePeerLeft);

    return () => {
      socket.off('peer-joined',          handlePeerJoined);
      socket.off('room-peers',           handleRoomPeers);
      socket.off('webrtc-offer',         handleOffer);
      socket.off('webrtc-answer',        handleAnswer);
      socket.off('webrtc-ice-candidate', handleIce);
      socket.off('peer-left',            handlePeerLeft);
    };
  }, [socket, createPC, flushCandidates]);

  return {
    localVideoRef,
    remoteVideoRef,
    isConnected,
    isStreaming,
    peers,
    error,
    startBroadcast,
    startViewing,
    stopStream,
  };
};
