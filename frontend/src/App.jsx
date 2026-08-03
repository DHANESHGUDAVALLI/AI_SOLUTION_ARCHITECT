import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ProjectForm from './components/ProjectForm';
import ArchitectureDashboard from './components/ArchitectureDashboard';
import HistoryView from './components/HistoryView';
import AuthModal from './components/AuthModal';
import ApiKeyModal from './components/ApiKeyModal';
import { architectAPI, authAPI } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('new');
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [customGeminiKey, setCustomGeminiKey] = useState(
    localStorage.getItem('gemini_api_key') || ''
  );

  // Check auth session on boot
  useEffect(() => {
    const token = localStorage.getItem('architect_auth_token');
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data))
        .catch(() => localStorage.removeItem('architect_auth_token'));
    }
  }, []);

  // Submit Architecture Evaluation Form
  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        custom_gemini_key: customGeminiKey || null
      };
      const res = await architectAPI.recommend(payload);
      setCurrentEvaluation(res.data);
    } catch (err) {
      alert("Error generating architecture recommendation: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = (key) => {
    setCustomGeminiKey(key);
    if (key) {
      localStorage.setItem('gemini_api_key', key);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('architect_auth_token');
    setUser(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenApiKeyModal={() => setApiKeyModalOpen(true)}
        hasCustomKey={!!customGeminiKey}
      />

      {/* Main Content Workspace */}
      <main style={{ flex: 1 }}>
        {activeTab === 'new' ? (
          currentEvaluation ? (
            <ArchitectureDashboard
              evaluation={currentEvaluation}
              onBackToForm={() => setCurrentEvaluation(null)}
              customGeminiKey={customGeminiKey}
            />
          ) : (
            <ProjectForm
              onSubmit={handleFormSubmit}
              loading={loading}
            />
          )
        ) : activeTab === 'history' ? (
          <HistoryView
            user={user}
            onSelectProject={(evalData) => {
              setCurrentEvaluation(evalData);
              setActiveTab('new');
            }}
          />
        ) : null}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '20px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        AI Solution Architect System • Enterprise Architecture Recommendation Engine • Powered by AntiGravity & Google Gemini API
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(u) => setUser(u)}
      />

      <ApiKeyModal
        isOpen={apiKeyModalOpen}
        onClose={() => setApiKeyModalOpen(false)}
        apiKey={customGeminiKey}
        onSaveKey={handleSaveApiKey}
      />

    </div>
  );
}
