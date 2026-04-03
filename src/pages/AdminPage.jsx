import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import ActivityLog from '../components/ActivityLog';
import { StatusPill } from '../components/StatusBadge';
import toast from 'react-hot-toast';

const tabs = ['users', 'logs', 'stats'];

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(5,13,26,0.85)' }}>
    <div className="card p-6 max-w-sm w-full animate-slide-up" style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#e2e8f0', marginBottom: 12 }}>
        Confirm Action
      </h3>
      <p style={{ fontSize: 14, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>{message}</p>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="btn-danger flex-1 py-2.5">Confirm</button>
        <button onClick={onCancel} className="btn-ghost flex-1 py-2.5">Cancel</button>
      </div>
    </div>
  </div>
);

const AddUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return toast.error('All fields required');
    setLoading(true);
    try {
      await api.post('/users', form);
      toast.success('User created!');
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(5,13,26,0.85)' }}>
      <div className="card p-6 max-w-sm w-full animate-slide-up">
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#e2e8f0' }}>
            Add New User
          </h3>
          <button onClick={onClose} style={{ color: '#475569', fontSize: 20 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[['name','Full Name','text','Jane Smith'],['email','Email','email','jane@example.com'],['password','Password','password','Min. 6 chars']].map(([key,label,type,ph]) => (
            <div key={key}>
              <label style={{ display:'block', fontSize:11, fontFamily:'Syne,sans-serif', fontWeight:600, color:'#64748b', marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' }}>
                {label}
              </label>
              <input type={type} className="input-field" placeholder={ph} value={form[key]}
                onChange={e => setForm({...form,[key]:e.target.value})} />
            </div>
          ))}
          <div>
            <label style={{ display:'block', fontSize:11, fontFamily:'Syne,sans-serif', fontWeight:600, color:'#64748b', marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' }}>
              Role
            </label>
            <select className="input-field" value={form.role} onChange={e => setForm({...form, role:e.target.value})}>
              <option value="user">User (Parent)</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminPage = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users');
      setUsers(data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/logs?limit=100');
      setLogs(data.logs);
    } catch { toast.error('Failed to load logs'); }
    finally { setLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/logs/stats');
      setStats(data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'logs') fetchLogs();
    else if (activeTab === 'stats') fetchStats();
  }, [activeTab, fetchUsers, fetchLogs, fetchStats]);

  const handleDeleteUser = (userId) => {
    setConfirm({
      message: 'Are you sure you want to delete this user? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete(`/users/${userId}`);
          toast.success('User deleted');
          fetchUsers();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete'); }
        setConfirm(null);
      },
    });
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const handleToggleActive = async (userId, isActive) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !isActive });
      toast.success(`Account ${isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch { toast.error('Failed to update status'); }
  };

  const handleClearLogs = () => {
    setConfirm({
      message: 'Clear all activity logs? This cannot be undone.',
      onConfirm: async () => {
        try {
          await api.delete('/logs');
          toast.success('Logs cleared');
          fetchLogs();
        } catch { toast.error('Failed to clear logs'); }
        setConfirm(null);
      },
    });
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
      {showAddModal && <AddUserModal onClose={() => setShowAddModal(false)} onCreated={fetchUsers} />}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
            Admin Panel
          </h2>
          <p style={{ fontSize: 14, color: '#475569', marginTop: 4 }}>
            System management and monitoring
          </p>
        </div>
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
          style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.15)' }}>
          <span style={{ fontSize: 10, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#2dd4bf', letterSpacing: '0.1em' }}>
            ⚙️ ADMIN
          </span>
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: '#071224' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13,
              padding: '8px 20px', borderRadius: 10, transition: 'all 0.2s',
              background: activeTab === tab ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : 'transparent',
              color: activeTab === tab ? 'white' : '#475569',
              letterSpacing: '0.02em', textTransform: 'capitalize', border: 'none', cursor: 'pointer',
            }}
          >
            {tab === 'users' ? '👥 Users' : tab === 'logs' ? '📋 Logs' : '📊 Stats'}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
                All Users
              </h3>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>{users.length} accounts</p>
            </div>
            <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
              <span>+</span> Add User
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table w-full">
                <thead>
                  <tr style={{ background: 'rgba(5,13,26,0.5)' }}>
                    <th className="text-left">User</th>
                    <th className="text-left">Role</th>
                    <th className="text-left">Status</th>
                    <th className="text-left">Joined</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, #14b8a6, #0891b2)', fontFamily: 'Syne, sans-serif' }}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1', fontFamily: 'Syne, sans-serif' }}>
                              {u.name}
                              {u._id === currentUser?.id && (
                                <span style={{ marginLeft: 6, fontSize: 10, color: '#2dd4bf', fontFamily: 'JetBrains Mono, monospace' }}>(you)</span>
                              )}
                            </p>
                            <p style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          disabled={u._id === currentUser?.id}
                          style={{
                            background: 'rgba(10,26,51,0.8)', border: '1px solid #1e3a5f',
                            borderRadius: 8, color: '#94a3b8', padding: '4px 10px',
                            fontFamily: 'JetBrains Mono, monospace', fontSize: 12, cursor: 'pointer',
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          background: u.isActive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          border: `1px solid ${u.isActive ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                          borderRadius: 999, padding: '2px 10px',
                          fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 11,
                          color: u.isActive ? '#22c55e' : '#ef4444',
                        }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: u.isActive ? '#22c55e' : '#ef4444', display: 'inline-block' }} />
                          {u.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#475569' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleActive(u._id, u.isActive)}
                            disabled={u._id === currentUser?.id}
                            className="btn-ghost text-xs py-1.5 px-3"
                            style={{ opacity: u._id === currentUser?.id ? 0.3 : 1 }}
                          >
                            {u.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            disabled={u._id === currentUser?.id}
                            className="btn-danger text-xs py-1.5 px-3"
                            style={{ opacity: u._id === currentUser?.id ? 0.3 : 1 }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Logs Tab */}
      {activeTab === 'logs' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
                System Logs
              </h3>
              <p style={{ fontSize: 12, color: '#475569', marginTop: 2 }}>All cry detection events</p>
            </div>
            <button onClick={handleClearLogs} className="btn-danger text-sm py-2 px-4 flex items-center gap-2">
              🗑 Clear All
            </button>
          </div>
          <ActivityLog logs={logs} loading={loading} />
        </div>
      )}

      {/* Stats Tab */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Events', value: stats.stats.total, icon: '📋', color: '#2dd4bf' },
              { label: 'Crying', value: stats.stats.crying, icon: '😢', color: '#ef4444' },
              { label: 'Silent', value: stats.stats.silent, icon: '😌', color: '#22c55e' },
              { label: 'Sleeping', value: stats.stats.sleeping, icon: '😴', color: '#60a5fa' },
            ].map(s => (
              <div key={s.label} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {s.label}
                  </span>
                </div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: s.color, letterSpacing: '-0.03em' }}>
                  {s.value}
                </p>
                {stats.stats.total > 0 && (
                  <p style={{ fontSize: 12, color: '#475569', marginTop: 4 }}>
                    {((s.value / stats.stats.total) * 100).toFixed(1)}% of total
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Recent logs */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
                Recent Events
              </h3>
            </div>
            <ActivityLog logs={stats.recent} loading={false} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
