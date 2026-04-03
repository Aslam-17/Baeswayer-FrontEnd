import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#050d1a' }}>
      {/* Left panel - decorative */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #071224, #0a1a33)' }}>
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #14b8a6, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <span className="text-xl">👶</span>
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#e2e8f0' }}>
              BabyWatch
            </h1>
            <p style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
              AI MONITORING SYSTEM
            </p>
          </div>
        </div>

        {/* Features list */}
        <div className="z-10 space-y-6">
          {[
            { icon: '🎥', title: 'Live Video Stream', desc: 'Real-time WebRTC camera feed' },
            { icon: '🤖', title: 'AI Detection', desc: 'Instant cry detection with confidence scores' },
            { icon: '🔔', title: 'Smart Alerts', desc: 'Instant notifications when baby needs you' },
            { icon: '📊', title: 'Activity History', desc: 'Complete logs of all baby activity' },
          ].map((f) => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(45,212,191,0.08)', border: '1px solid rgba(45,212,191,0.12)' }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 14, color: '#cbd5e1' }}>
                  {f.title}
                </p>
                <p style={{ fontSize: 13, color: '#475569', marginTop: 2 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#1e3a5f', fontFamily: 'JetBrains Mono, monospace', zIndex: 10 }}>
          © 2025 BabyWatch · Powered by AI
        </p>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <span className="text-2xl">👶</span>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#e2e8f0' }}>
              BabyWatch
            </span>
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
              Sign in
            </h2>
            <p style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>
              Monitor your baby from anywhere
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#64748b', marginBottom: 6, letterSpacing: '0.06em' }}>
                EMAIL
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="parent@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoComplete="email"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#64748b', marginBottom: 6, letterSpacing: '0.06em' }}>
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  style={{ fontSize: 16 }}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center mt-6" style={{ fontSize: 13, color: '#475569' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2dd4bf', fontWeight: 600 }}>
              Create one
            </Link>
          </p>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl"
            style={{ background: 'rgba(45,212,191,0.05)', border: '1px solid rgba(45,212,191,0.1)' }}>
            <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#2dd4bf', marginBottom: 4, fontWeight: 600 }}>
              FIRST SETUP
            </p>
            <p style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>
              Register the first account — it will automatically become an Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
