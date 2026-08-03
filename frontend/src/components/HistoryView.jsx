import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, ExternalLink, Download, Layers, Calendar } from 'lucide-react';
import { projectsAPI, pdfAPI } from '../services/api';

export default function HistoryView({ onSelectProject, user }) {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      if (!user) {
        setHistoryList([]);
        setLoading(false);
        return;
      }
      const res = await projectsAPI.getHistory();
      setHistoryList(res.data || []);
    } catch (err) {
      setError("Please log in to view and save your architecture evaluation history.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this architecture evaluation from history?")) return;
    try {
      await projectsAPI.delete(id);
      setHistoryList(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert("Failed to delete project evaluation.");
    }
  };

  const handleDownloadPDF = async (project, e) => {
    e.stopPropagation();
    try {
      const response = await pdfAPI.exportReport(project.evaluation_result);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.project_name.replace(/\s+/g, '_')}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert("PDF download failed.");
    }
  };

  const filteredHistory = historyList.filter(item =>
    item.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.recommended_pattern.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 24px' }} className="animate-fade-in">
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History color="#818cf8" size={28} /> Saved Architecture History
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Access and re-evaluate your saved enterprise software architecture blueprints.
          </p>
        </div>

        {/* Search Input */}
        {user && (
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '36px', width: '100%' }}
              placeholder="Search history by name/domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}
      </div>

      {!user ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <History size={48} color="#6366f1" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '8px' }}>User Authentication Required</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 20px' }}>
            Please log in or sign up to save your architecture evaluations and view your project history across sessions.
          </p>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Loading saved architecture evaluations...
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <Layers size={48} color="#94a3b8" style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '8px' }}>No Architecture History Found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>You haven't saved any project evaluations yet. Generate a new architecture to start!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="glass-panel glass-panel-hover"
              onClick={() => onSelectProject(item.evaluation_result)}
              style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="badge badge-indigo">{item.domain}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffffff', marginBottom: '6px' }}>
                  {item.project_name}
                </h3>

                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {item.description}
                </p>

                <div style={{ background: 'rgba(99,102,241,0.08)', borderRadius: '8px', padding: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Pattern:</span>{' '}
                  <span style={{ fontWeight: '700', color: '#38bdf8' }}>{item.recommended_pattern}</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                <span style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  View Details <ExternalLink size={14} />
                </span>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => handleDownloadPDF(item, e)}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                    title="Export PDF"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(item.id, e)}
                    className="btn-secondary"
                    style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#fca5a5', borderColor: 'rgba(239,68,68,0.3)' }}
                    title="Delete Evaluation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
