import { useState, useEffect, useCallback } from 'react';
import { getSocket } from '../utils/socket';
import api from '../utils/api';

export const useStatus = () => {
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((msg) => {
    const id = Date.now();
    setNotifications(prev => [{ id, message: msg, time: new Date() }, ...prev.slice(0, 9)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 8000);
  }, []);

  // Fetch latest status + history on mount
  const fetchInitial = useCallback(async () => {
    try {
      setLoading(true);
      const [statusRes, logsRes] = await Promise.all([
        api.get('/status'),
        api.get('/logs?limit=20'),
      ]);
      if (statusRes.data.status) setStatus(statusRes.data.status);
      setHistory(logsRes.data.logs || []);
    } catch (err) {
      console.error('[Status] Failed to fetch initial data:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();

    const socket = getSocket();

    const handleUpdate = (data) => {
      setStatus(data);
      setHistory(prev => [
        { _id: data.logId, status: data.status, confidence: data.confidence, createdAt: data.timestamp },
        ...prev.slice(0, 49),
      ]);
      if (data.status === 'crying') {
        addNotification(`⚠️ Baby is crying! (${data.confidence}% confidence)`);
      }
    };

    socket.on('status-update', handleUpdate);
    return () => socket.off('status-update', handleUpdate);
  }, [fetchInitial, addNotification]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return { status, history, loading, notifications, dismissNotification, refetch: fetchInitial };
};
