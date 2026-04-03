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

export const useWebRTC = ({ role = 'viewer' }) => {
  const localVideoRef  = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionsRef = useRef({});
  const localStreamRef     = useRef(null);
  const pendingCandidates  = useRef({});

  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming,  setIsStreaming]  = useState(false);
  const [peers,        setPeers]        = useState([]);
  const [error,        setError]        = useState(null);

  const socket = getSocket();

  const flushCandidates = useCallback(async (peerId) => {
    const pc = peerConnectionsRef.current[peerId];
    const candidates = pendingCandidates.current[peerId] || [];
    for (const candidate of candidates) {
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    }
    pendingCandidates.current[peerId] = [];
  }, []);

  const createPeerConnection = useCallback((peerId) => {
    if (peerConnectionsRef.current[peerId]) {
      const existing = peerConnectionsRef.current[peerId];
      if (existing.connectionState !== 'closed') return existing;
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pendingCandidates.current[peerId] = [];

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', { to: peerId, candidate: event.candidate });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        setIsConnected(true);
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') setIsConnected(true);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        setIsConnected(false);
      }
    };

    peerConnectionsRef.current[peerId] = pc;
    return pc;
  }, [socket]);

  const startBroadcast = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setIsStreaming(true);

      socket.emit('join-room', ROOM_ID);

      socket.on('peer-joined', async (peerId) => {
        const pc = createPeerConnection(peerId);
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { to: peerId, offer });
        setPeers(prev => [...new Set([...prev, peerId])]);
      });

    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      console.error('[WebRTC] Broadcast error:', err);
    }
  }, [socket, createPeerConnection]);

  const startViewing = useCallback(() => {
    setError(null);
    socket.emit('join-room', ROOM_ID);

    socket.on('room-peers', async (existingPeers) => {
      for (const peerId of existingPeers) {
        const pc = createPeerConnection(peerId);
        pc.addTransceiver('video', { direction: 'recvonly' });
        pc.addTransceiver('audio', { direction: 'recvonly' });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('webrtc-offer', { to: peerId, offer });
      }
    });
  }, [socket, createPeerConnection]);

  const stopStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    Object.values(peerConnectionsRef.current).forEach(pc => { try { pc.close(); } catch {} });
    peerConnectionsRef.current = {};
    pendingCandidates.current  = {};
    if (localVideoRef.current)  localVideoRef.current.srcObject  = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    socket.emit('leave-room', ROOM_ID);
    socket.off('peer-joined');
    socket.off('room-peers');
    setIsStreaming(false);
    setIsConnected(false);
    setPeers([]);
  }, [socket]);

  useEffect(() => {

    // ✅ FIX 1: Only handle offer when in stable state
    const handleOffer = async ({ from, offer }) => {
      const pc = createPeerConnection(from);

      if (pc.signalingState !== 'stable') {
        console.warn(`[WebRTC] Ignoring offer, wrong state: ${pc.signalingState}`);
        return;
      }

      if (localStreamRef.current) {
        const senders = pc.getSenders();
        localStreamRef.current.getTracks().forEach(track => {
          if (!senders.find(s => s.track === track)) pc.addTrack(track, localStreamRef.current);
        });
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        await flushCandidates(from);

        // ✅ FIX 2: Check state before setting local answer
        if (pc.signalingState === 'have-remote-offer') {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('webrtc-answer', { to: from, answer });
        }
      } catch (err) {
        console.error('[WebRTC] Offer handling error:', err.message);
      }
    };

    // ✅ FIX 3: Only accept answer in have-local-offer state
    const handleAnswer = async ({ from, answer }) => {
      const pc = peerConnectionsRef.current[from];
      if (!pc) return;
      if (pc.signalingState !== 'have-local-offer') {
        console.warn(`[WebRTC] Ignoring answer, wrong state: ${pc.signalingState}`);
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await flushCandidates(from);
      } catch (err) {
        console.error('[WebRTC] Answer handling error:', err.message);
      }
    };

    // ✅ FIX 4: Buffer ICE candidates until remote description is ready
    const handleIce = async ({ from, candidate }) => {
      const pc = peerConnectionsRef.current[from];
      if (!pc) return;
      if (!pc.remoteDescription || !pc.remoteDescription.type) {
        pendingCandidates.current[from] = pendingCandidates.current[from] || [];
        pendingCandidates.current[from].push(candidate);
        return;
      }
      try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch {}
    };

    const handlePeerLeft = (peerId) => {
      const pc = peerConnectionsRef.current[peerId];
      if (pc) { try { pc.close(); } catch {} delete peerConnectionsRef.current[peerId]; }
      delete pendingCandidates.current[peerId];
      setPeers(prev => prev.filter(id => id !== peerId));
      if (Object.keys(peerConnectionsRef.current).length === 0) {
        setIsConnected(false);
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
      }
    };

    socket.on('webrtc-offer',         handleOffer);
    socket.on('webrtc-answer',        handleAnswer);
    socket.on('webrtc-ice-candidate', handleIce);
    socket.on('peer-left',            handlePeerLeft);

    return () => {
      socket.off('webrtc-offer',         handleOffer);
      socket.off('webrtc-answer',        handleAnswer);
      socket.off('webrtc-ice-candidate', handleIce);
      socket.off('peer-left',            handlePeerLeft);
    };
  }, [socket, createPeerConnection, flushCandidates, stopStream]);

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