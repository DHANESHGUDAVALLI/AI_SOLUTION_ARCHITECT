import React from 'react';
import { Cpu, History, PlusCircle, Key, User, LogOut, ShieldCheck, Sparkles } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
  onOpenApiKeyModal,
  hasCustomKey
}) {
  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setActiveTab('new')}>
          <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            padding: '10px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)'
          }}>
            <Cpu size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>AI Solution Architect</span>
              <span className="badge badge-indigo">Enterprise</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Intelligent Software System Recommendation Engine
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('new')}
            className={activeTab === 'new' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            <PlusCircle size={18} />
            <span>New Architecture</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 16px', fontSize: '0.9rem' }}
          >
            <History size={18} />
            <span>Architecture History</span>
          </button>
        </nav>

        {/* User & Settings Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Gemini API Key Indicator */}
          <button
            onClick={onOpenApiKeyModal}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderColor: hasCustomKey ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)',
              background: hasCustomKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)'
            }}
            title="Configure Gemini API Key"
          >
            <Key size={14} color={hasCustomKey ? '#10b981' : '#94a3b8'} />
            <span style={{ color: hasCustomKey ? '#6ee7b7' : 'var(--text-secondary)' }}>
              {hasCustomKey ? 'Gemini AI Active' : 'Configure Gemini API Key'}
            </span>
          </button>

          {/* User Auth Profile */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <User size={16} color="#818cf8" />
                <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="btn-secondary"
                style={{ padding: '6px 10px' }}
                title="Log Out"
              >
                <LogOut size={16} color="#fca5a5" />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-accent" style={{ padding: '8px 16px', fontSize: '0.875rem' }}>
              <ShieldCheck size={16} />
              <span>Login / Sign Up</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
