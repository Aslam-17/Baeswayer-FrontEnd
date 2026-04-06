import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome 🌸');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-mesh">
      {/* Background glow */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #f03274, transparent)' }} />

      <div className="w-full max-w-sm animate-fade-in relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ff5a96, #c4195a)', boxShadow: '0 8px 24px rgba(240,50,116,0.4)' }}>
            <span className="text-lg">🌸</span>
          </div>
          <div>
            <h1 className="logo-text" style={{ fontSize: 22 }}>Baeswayer</h1>
            <p style={{ fontSize: 9, color: '#a06080', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.12em' }}>BABY MONITOR AI</p>
          </div>
        </div>

        <div className="mb-7">
          <h2 style={{ fontFamily: 'Playfair Display, serif', fontWeight: 700, fontSize: 30, color: '#fce8f0', letterSpacing: '-0.02em' }}>
            Create account
          </h2>
          <p style={{ fontSize: 14, color: '#a06080', marginTop: 5 }}>Set up your baby monitor</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', type: 'text', ph: 'Your name' },
            { key: 'email', label: 'Email', type: 'email', ph: 'you@example.com' },
          ].map(({ key, label, type, ph }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: '#a06080', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {label}
              </label>
              <input type={type} className="input-field" placeholder={ph}
                value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
            </div>
          ))}

          <div>
            <label style={{ display: 'block', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: '#a06080', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Password
            </label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input-field pr-12"
                placeholder="Min. 6 characters" value={form.password}
                onChange={e => setForm({...form, password: e.target.value})} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2" style={{ color: '#a06080', fontSize: 16 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: '#a06080', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Confirm Password
            </label>
            <input type={showPw ? 'text' : 'password'} className="input-field"
              placeholder="Repeat password" value={form.confirm}
              onChange={e => setForm({...form, confirm: e.target.value})} />
          </div>

          <button type="submit" className="btn-primary w-full" style={{ fontSize: 15 }} disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating...
              </span>
            ) : 'Create Account 🌸'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: 13, color: '#a06080' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#ff85b3', fontWeight: 700 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
