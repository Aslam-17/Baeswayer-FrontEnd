import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon, label, adminBadge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer select-none ${
        isActive
          ? 'nav-item-active font-semibold'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
      }`
    }
    style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '0.02em' }}
  >
    <span className="text-lg">{icon}</span>
    <span>{label}</span>
    {adminBadge && (
      <span className="ml-auto text-xs px-1.5 py-0.5 rounded-md font-mono"
        style={{ background: 'rgba(45,212,191,0.1)', color: '#2dd4bf', fontSize: 10, letterSpacing: '0.05em' }}>
        ADMIN
      </span>
    )}
  </NavLink>
);

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const Sidebar = () => (
    <aside className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #071224 0%, #050d1a 100%)' }}>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
            <span className="text-lg">👶</span>
          </div>
          <div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#e2e8f0', letterSpacing: '-0.01em' }}>
              BabyWatch
            </h1>
            <p style={{ fontSize: 10, color: '#475569', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em' }}>
              MONITOR SYSTEM
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p style={{ fontSize: 10, color: '#334155', fontFamily: 'Syne, sans-serif', letterSpacing: '0.12em', padding: '8px 12px 6px', fontWeight: 600 }}>
          MAIN
        </p>
        <NavItem to="/dashboard" icon="📹" label="Live Monitor" />
        {isAdmin && (
          <>
            <p style={{ fontSize: 10, color: '#334155', fontFamily: 'Syne, sans-serif', letterSpacing: '0.12em', padding: '16px 12px 6px', fontWeight: 600 }}>
              ADMINISTRATION
            </p>
            <NavItem to="/admin" icon="⚙️" label="Admin Panel" adminBadge />
          </>
        )}
      </nav>

      {/* User info */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2"
          style={{ background: 'rgba(255,255,255,0.03)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #14b8a6, #0891b2)', fontFamily: 'Syne, sans-serif' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#cbd5e1' }}>
              {user?.name}
            </p>
            <p className="truncate" style={{ fontSize: 11, color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>
              {user?.role?.toUpperCase()}
            </p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-500/10 hover:text-red-400"
          style={{ fontFamily: 'Syne, sans-serif', color: '#475569', letterSpacing: '0.02em' }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050d1a' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-60 flex-shrink-0 border-r border-white/5">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 flex flex-col border-r border-white/5">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-white/5"
          style={{ background: '#071224' }}>
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-slate-200 text-xl">☰</button>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#e2e8f0' }}>BabyWatch</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
