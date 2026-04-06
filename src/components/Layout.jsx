import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const NavItem = ({ to, icon, label, adminBadge }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 cursor-pointer select-none ${
        isActive ? 'nav-item-active font-semibold' : 'text-[#a06080] hover:text-[#fce8f0] hover:bg-white/5'
      }`
    }
    style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 600 }}
  >
    <span className="text-base">{icon}</span>
    <span>{label}</span>
    {adminBadge && (
      <span className="ml-auto pill"
        style={{ background: 'rgba(240,50,116,0.12)', color: '#ff85b3', border: '1px solid rgba(240,50,116,0.2)', fontSize: 9, letterSpacing: '0.1em' }}>
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
    toast.success('Signed out');
    navigate('/login');
  };

  const SidebarContent = () => (
    <aside className="flex flex-col h-full" style={{ background: 'linear-gradient(180deg, #2a1020 0%, #1a0a10 100%)' }}>
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,90,150,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff5a96, #c4195a)', boxShadow: '0 4px 16px rgba(240,50,116,0.4)' }}>
            <span className="text-base">🌸</span>
          </div>
          <div>
            <h1 className="logo-text" style={{ fontSize: 18, lineHeight: 1 }}>Baeswayer</h1>
            <p style={{ fontSize: 9, color: '#a06080', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.15em', marginTop: 2 }}>
              BABY MONITOR
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p style={{ fontSize: 10, color: '#a06080', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.12em', padding: '8px 12px 6px', fontWeight: 700, textTransform: 'uppercase' }}>
          Monitor
        </p>
        <NavItem to="/dashboard" icon="📹" label="Live Monitor" />
        {isAdmin && (
          <>
            <p style={{ fontSize: 10, color: '#a06080', fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.12em', padding: '16px 12px 6px', fontWeight: 700, textTransform: 'uppercase' }}>
              Admin
            </p>
            <NavItem to="/admin" icon="⚙️" label="Admin Panel" adminBadge />
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'rgba(255,90,150,0.08)' }}>
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl mb-2"
          style={{ background: 'rgba(255,90,150,0.06)' }}>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #ff5a96, #c4195a)', fontFamily: 'Playfair Display, serif' }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ fontSize: 13, fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, color: '#fce8f0' }}>
              {user?.name}
            </p>
            <p className="truncate" style={{ fontSize: 10, color: '#a06080', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em' }}>
              {user?.role?.toUpperCase()}
            </p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all hover:bg-red-500/10 hover:text-red-400"
          style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: '#a06080', fontWeight: 600 }}>
          <span>🚪</span> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-mesh">
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-col w-56 flex-shrink-0 border-r" style={{ borderColor: 'rgba(255,90,150,0.1)' }}>
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-60 flex flex-col border-r" style={{ borderColor: 'rgba(255,90,150,0.1)' }}>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b"
          style={{ background: 'rgba(42,16,32,0.9)', borderColor: 'rgba(255,90,150,0.1)', backdropFilter: 'blur(10px)' }}>
          <button onClick={() => setSidebarOpen(true)} className="text-pink-300 text-xl p-1">☰</button>
          <h1 className="logo-text" style={{ fontSize: 20 }}>Baeswayer</h1>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #ff5a96, #c4195a)' }}>
            <span style={{ fontSize: 14 }}>🌸</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
