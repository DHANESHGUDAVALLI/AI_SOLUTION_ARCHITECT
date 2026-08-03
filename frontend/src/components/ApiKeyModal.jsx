import React, { useState } from 'react';
import { Key, Sparkles, X, ExternalLink } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveKey }) {
  const [inputKey, setInputKey] = useState(apiKey || '');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveKey(inputKey.trim());
    onClose();
  };

  const handleClear = () => {
    setInputKey('');
    onSaveKey('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      padding: '20px'
    }} className="animate-fade-in">
      
      <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '32px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '50%', width: '48px', height: '48px', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Key size={26} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800' }}>Google Gemini API Settings</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
            Configure your Gemini API key to enable live Generative AI reasoning for architecture evaluations.
          </p>
        </div>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label className="form-label">Gemini API Key</label>
            <input
              type="password"
              className="form-input"
              placeholder="AIzaSy..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Stored locally in browser session. Leave empty to use default local architect engine.
            </span>
          </div>

          <div style={{ margin: '16px 0', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            💡 Need an API Key? Get one free from Google AI Studio at{' '}
            <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
              aistudio.google.com <ExternalLink size={12} />
            </a>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {apiKey && (
              <button type="button" onClick={handleClear} className="btn-secondary" style={{ flex: 1, color: '#fca5a5' }}>
                Clear Key
              </button>
            )}
            <button type="submit" className="btn-accent" style={{ flex: 2, justifyContent: 'center' }}>
              <Sparkles size={16} /> Save Settings
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
