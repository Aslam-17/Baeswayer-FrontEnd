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
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🌸');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-mesh">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 p-12 relative overflow-hidden"
        style={{ borderRight: '1px solid rgba(255,90,150,0.1)' }}>
        {/* Glows */}
        <div className="absolute top-1/4 left-0 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f03274, transparent)' }} />
        <div className="absolute bottom-1/4 right-0 w-60 h-60 rounded-full blur-3xl opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #ff85b3, transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ff5a96, #c4195a)', boxShadow: '0 8px 24px rgba(240,50,116,0.4)' }}>
            <span className="text-xl">🌸</span>
          </div>
          <div>
            <h1 className="logo-text" style={{ fontSize: 26 }}>Baeswayer</h1>
            <p style={{ fontSize: 10, color: '#a06080', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em' }}>
              BABY MONITOR AI
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="z-10 space-y-7">
          <div>
            <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, color: '#fce8f0', lineHeight: 1.3, fontStyle: 'italic' }}>
              Watch over your little one, always.
            </p>
          </div>
          {[
            { icon: '📹', title: 'Live Camera Feed', desc: 'Real-time WebRTC streaming' },
            { icon: '🤖', title: 'AI Cry Detection', desc: 'Instant alerts with confidence scores' },
            { icon: '💌', title: 'Smart Notifications', desc: 'Never miss a moment' },
            { icon: '📊', title: 'Activity History', desc: 'Complete monitoring logs' },
          ].map(f => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,90,150,0.1)', border: '1px solid rgba(255,90,150,0.15)' }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
              </div>
              <div>
                <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 14, color: '#fce8f0' }}>{f.title}</p>
                <p style={{ fontSize: 12, color: '#a06080', marginTop: 2 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#3d1830', fontFamily: 'JetBrains Mono, monospace', zIndex: 10 }}>
          © 2025 Baeswayer · Made with 🌸
        </p>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #ff5a96, #c4195a)' }}>
              <span>🌸</span>
            </div>
            <h1 className="logo-text" style={{ fontSize: 24 }}>Baeswayer</h1>
          </div>

          <div className="mb-8">
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 32, color: '#fce8f0', letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ fontSize: 14, color: '#a06080', marginTop: 6 }}>Sign in to your monitor</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: '#a06080', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Email
              </label>
              <input type="email" className="input-field" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({...form, email: e.target.value})} autoComplete="email" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: '#a06080', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} className="input-field pr-12"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: '#a06080', fontSize: 16 }}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2" style={{ fontSize: 15 }} disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign In 🌸'}
            </button>
          </form>

          <p className="text-center mt-6" style={{ fontSize: 13, color: '#a06080' }}>
            New here?{' '}
            <Link to="/register" style={{ color: '#ff85b3', fontWeight: 700 }}>Create account</Link>
          </p>

          <div className="mt-6 p-4 rounded-2xl"
            style={{ background: 'rgba(255,90,150,0.06)', border: '1px solid rgba(255,90,150,0.12)' }}>
            <p style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#ff85b3', marginBottom: 4, fontWeight: 600, letterSpacing: '0.08em' }}>
              FIRST SETUP
            </p>
            <p style={{ fontSize: 12, color: '#a06080', lineHeight: 1.6 }}>
              Register the first account — it becomes Admin automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
