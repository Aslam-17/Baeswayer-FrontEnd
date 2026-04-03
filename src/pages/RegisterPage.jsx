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
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (key, label, type, placeholder) => (
    <div>
      <label style={{ display: 'block', fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#64748b', marginBottom: 6, letterSpacing: '0.06em' }}>
        {label}
      </label>
      <input
        type={type === 'password' ? (showPw ? 'text' : 'password') : type}
        className="input-field"
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#050d1a' }}>
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <span className="text-lg">👶</span>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#e2e8f0' }}>
            Baeswayer Monitoring System
          </span>
        </div>

        <div className="mb-8">
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
            Create account
          </h2>
          <p style={{ fontSize: 14, color: '#475569', marginTop: 6 }}>
            Set up your baby monitoring system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {field('name', 'FULL NAME', 'text', 'Jane Smith')}
          {field('email', 'EMAIL', 'email', 'parent@example.com')}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#64748b', marginBottom: 6, letterSpacing: '0.06em' }}>
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                style={{ fontSize: 16 }}>
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {field('confirm', 'CONFIRM PASSWORD', 'password', 'Repeat password')}

          <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating account...
              </span>
            ) : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-6" style={{ fontSize: 13, color: '#475569' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#2dd4bf', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
