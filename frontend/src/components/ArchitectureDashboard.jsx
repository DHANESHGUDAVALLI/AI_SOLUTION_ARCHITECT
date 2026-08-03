import React, { useState } from 'react';
import {
  Layers, CheckCircle, AlertTriangle, DollarSign, Calendar, ShieldAlert,
  Download, ArrowLeft, Send, MessageSquare, Sparkles, RefreshCw, Box, Activity, ChevronRight, HelpCircle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { pdfAPI, architectAPI } from '../services/api';

const COLORS = ['#6366f1', '#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function ArchitectureDashboard({ evaluation, onBackToForm, customGeminiKey }) {
  const [activeTab, setActiveTab] = useState('stack');
  const [scaleMultiplier, setScaleMultiplier] = useState(1.0); // Interactive scale slider
  
  // AI Chat Assistant State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { sender: 'ai', text: `Hello! I am your AI Solution Architect. Ask me any follow-up questions about the recommended **${evaluation.recommended_pattern}** architecture for ${evaluation.project_name}.` }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Cost data calculation with interactive scaling slider
  const itemizedCosts = evaluation.cost_estimation?.itemized || [];
  const scaledCostData = itemizedCosts.map(item => ({
    ...item,
    scaled_cost: Math.round(item.estimated_monthly_usd * scaleMultiplier * 100) / 100
  }));
  const totalScaledMonthly = scaledCostData.reduce((acc, curr) => acc + curr.scaled_cost, 0);

  // Handle PDF Export
  const handleExportPDF = async () => {
    try {
      setPdfLoading(true);
      const response = await pdfAPI.exportReport(evaluation);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${evaluation.project_name.replace(/\s+/g, '_')}_Architecture_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download PDF. Generating fallback print...');
      window.print();
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle Chat Submit
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userText = inputQuery;
    setInputQuery('');
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatLoading(true);

    try {
      const res = await architectAPI.chat({
        architecture_context: evaluation,
        user_query: userText,
        custom_gemini_key: customGeminiKey
      });
      setChatMessages(prev => [...prev, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I had trouble processing that request. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '24px auto', padding: '0 24px' }} className="animate-fade-in">
      
      {/* Top Banner & Control Bar */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          
          <div>
            <button onClick={onBackToForm} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem', marginBottom: '12px' }}>
              <ArrowLeft size={16} /> Edit Requirements
            </button>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span>{evaluation.project_name}</span>
              <span className="badge badge-indigo">{evaluation.domain}</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '0.95rem' }}>
              <b>Recommended Pattern:</b> <span className="gradient-text-primary" style={{ fontWeight: '700' }}>{evaluation.recommended_pattern}</span>
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => setChatOpen(true)} className="btn-secondary">
              <MessageSquare size={18} color="#818cf8" />
              <span>Ask AI Architect</span>
            </button>

            <button onClick={handleExportPDF} disabled={pdfLoading} className="btn-primary">
              <Download size={18} />
              <span>{pdfLoading ? 'Exporting PDF...' : 'Download PDF Report'}</span>
            </button>
          </div>

        </div>

        {/* Executive Summary Quote Box */}
        <div style={{
          marginTop: '20px',
          padding: '16px 20px',
          background: 'rgba(99, 102, 241, 0.08)',
          borderLeft: '4px solid #6366f1',
          borderRadius: '8px',
          color: '#e2e8f0',
          fontSize: '0.95rem',
          lineHeight: '1.6'
        }}>
          <b>Executive Summary:</b> {evaluation.executive_summary}
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'stack', label: '🛠️ Recommended Tech Stack', icon: Layers },
          { id: 'diagram', label: '📐 Architecture Diagram', icon: Box },
          { id: 'tradeoff', label: '⚖️ Trade-off Comparison', icon: RefreshCw },
          { id: 'cost', label: '💰 Infra Cost Calculator', icon: DollarSign },
          { id: 'sprint', label: '📅 Agile Sprint Roadmap', icon: Calendar },
          { id: 'risk', label: '🛡️ Risk Matrix & Mitigation', icon: ShieldAlert },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '10px 18px', fontSize: '0.9rem' }}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: RECOMMENDED TECH STACK & JUSTIFICATIONS */}
      {activeTab === 'stack' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {evaluation.tech_stack?.map((item, idx) => (
              <div key={idx} className="glass-panel glass-panel-hover" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-indigo">{item.category}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.version_or_tier}</span>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '16px' }}>
                  {item.technology}
                </h3>

                {/* Why This Technology? */}
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '12px 14px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <CheckCircle size={14} /> Why This Technology?
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {item.why_this}
                  </div>
                </div>

                {/* Why Not Alternatives? */}
                <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fcd34d', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={14} /> Why Not Alternatives?
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {item.why_not_alternatives}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL ARCHITECTURE DIAGRAM */}
      {activeTab === 'diagram' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>
            System Component Topology & Architecture Flow
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
            Visual map of data flow across client tier, API gateway, microservices, caches, and database clusters.
          </p>

          {/* Node Flow Canvas Display */}
          <div style={{
            background: '#090d16',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            padding: '32px',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {evaluation.diagram?.nodes?.map((node) => (
                <div key={node.id} style={{
                  background: 'rgba(30, 41, 59, 0.8)',
                  border: '1px solid #3b82f6',
                  borderRadius: '12px',
                  padding: '16px',
                  boxShadow: '0 4px 20px rgba(59, 130, 246, 0.2)'
                }}>
                  <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>{node.layer}</span>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: '#ffffff' }}>{node.label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>{node.subtext}</div>
                </div>
              ))}
            </div>

            {/* Inter-Node Connections Flow Table */}
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '12px', color: '#94a3b8' }}>Component Interaction Protocols:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                {evaluation.diagram?.connections?.map((conn, idx) => (
                  <div key={idx} style={{
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: '600', color: '#38bdf8' }}>{conn.from_node} → {conn.to_node}</span>
                    <span className="badge badge-emerald">{conn.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: TRADEOFF MATRIX */}
      {activeTab === 'tradeoff' && (
        <div className="animate-fade-in">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {evaluation.tradeoff_options?.map((opt, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '24px',
                  borderColor: idx === 0 ? '#6366f1' : 'var(--border-color)',
                  background: idx === 0 ? 'rgba(99, 102, 241, 0.06)' : 'var(--bg-card)'
                }}
              >
                {idx === 0 && (
                  <div className="badge badge-emerald" style={{ marginBottom: '12px' }}>
                    🏆 Recommended Architecture
                  </div>
                )}

                <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '6px' }}>{opt.architecture_name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>{opt.summary}</p>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Suitability Score</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: opt.suitability_score > 80 ? '#34d399' : '#f59e0b' }}>
                      {opt.suitability_score}/100
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Est. Monthly Cost</div>
                    <div style={{ fontSize: '1rem', fontWeight: '700', color: '#f8fafc', marginTop: '4px' }}>
                      {opt.estimated_monthly_cost}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#34d399', marginBottom: '6px' }}>PROS & ADVANTAGES</div>
                  {opt.pros?.map((p, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                      <span style={{ color: '#34d399' }}>✓</span> {p}
                    </div>
                  ))}
                </div>

                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fca5a5', marginBottom: '6px' }}>CONS & TRADEOFFS</div>
                  {opt.cons?.map((c, i) => (
                    <div key={i} style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                      <span style={{ color: '#fca5a5' }}>✗</span> {c}
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INFRASTRUCTURE COST CALCULATOR */}
      {activeTab === 'cost' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>Cloud Infrastructure Cost Estimation</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Itemized monthly & annual infrastructure cost projection based on workload requirements.</p>
            </div>

            {/* Interactive User Traffic Scale Slider */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', minWidth: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>
                <span>Simulated Scale Multiplier:</span>
                <span style={{ color: '#38bdf8' }}>{scaleMultiplier}x Scale ({Math.round(100 * scaleMultiplier)}k DAU)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.5"
                value={scaleMultiplier}
                onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
            
            {/* Cost Breakdown Pie Chart */}
            <div style={{ background: '#090d16', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', height: '320px' }}>
              <h4 style={{ textAlign: 'center', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Resource Cost Distribution</h4>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={scaledCostData} dataKey="scaled_cost" nameKey="resource" cx="50%" cy="50%" outerRadius={90} label>
                    {scaledCostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)} USD`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Monthly Total Summary Card */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '32px', borderRadius: '16px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Total Estimated Infrastructure Expense
              </div>
              <div style={{ fontSize: '3rem', fontWeight: '800', color: '#34d399', margin: '8px 0' }}>
                ${totalScaledMonthly.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/ month</span>
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
                Annual Expense: <b>${(totalScaledMonthly * 12).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</b>
              </div>
            </div>

          </div>

          {/* Itemized Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                <th style={{ padding: '12px' }}>Resource Category</th>
                <th style={{ padding: '12px' }}>Service Type / Tier</th>
                <th style={{ padding: '12px' }}>Monthly Cost</th>
                <th style={{ padding: '12px' }}>Notes & Auto-scaling Scope</th>
              </tr>
            </thead>
            <tbody>
              {scaledCostData.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px', fontWeight: '600' }}>{c.resource}</td>
                  <td style={{ padding: '12px', color: '#38bdf8' }}>{c.service_type}</td>
                  <td style={{ padding: '12px', fontWeight: '700', color: '#34d399' }}>${c.scaled_cost.toFixed(2)}</td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{c.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      )}

      {/* TAB 5: AGILE SPRINT PLAN */}
      {activeTab === 'sprint' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>Agile Sprint Roadmap & Implementation Plan</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Structured 6-sprint execution plan mapping architecture setup, API development, frontend integration, and production go-live.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
            {evaluation.sprint_plan?.map((sprint) => (
              <div key={sprint.sprint_number} style={{
                background: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-indigo">Sprint {sprint.sprint_number} ({sprint.duration_weeks} Weeks)</span>
                  <span className="badge badge-emerald">{sprint.milestone}</span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '12px', color: '#f8fafc' }}>
                  {sprint.sprint_title}
                </h3>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>Key Deliverables:</div>
                {sprint.key_deliverables?.map((del, i) => (
                  <div key={i} style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                    <ChevronRight size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{del}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: RISK MATRIX */}
      {activeTab === 'risk' && (
        <div className="glass-panel animate-fade-in" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '8px' }}>Architectural Risk Matrix & Mitigations</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '24px' }}>
            Proactive technical, operational, financial, and security risk assessment paired with explicit mitigation strategies.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {evaluation.risk_analysis?.map((r, i) => (
              <div key={i} className="glass-panel" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge badge-indigo">{r.category} Risk</span>
                  <span className={r.severity === 'High' ? 'badge badge-rose' : (r.severity === 'Medium' ? 'badge badge-amber' : 'badge badge-emerald')}>
                    {r.severity} Severity
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
                  {r.risk_title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                  {r.description}
                </p>

                <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#a5b4fc', marginBottom: '4px' }}>
                    🛡️ MITIGATION STRATEGY
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {r.mitigation_strategy}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI ARCHITECT CHAT DRAWER */}
      {chatOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          background: '#0b0f17',
          borderLeft: '1px solid var(--border-color)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.6)'
        }} className="animate-fade-in">
          
          {/* Chat Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(17,24,39,0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={20} color="#818cf8" />
              <span style={{ fontWeight: '700', fontSize: '1rem' }}>AI Architect Assistant</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }}>✕ Close</button>
          </div>

          {/* Chat History Messages */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : 'rgba(255,255,255,0.06)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--border-color)',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  color: '#ffffff'
                }}
              >
                {msg.text}
              </div>
            ))}
            {chatLoading && (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                AI Architect is reasoning...
              </div>
            )}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleSendChat} style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1 }}
              placeholder="Ask e.g. How to handle 100k TPS?"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
            />
            <button type="submit" disabled={chatLoading} className="btn-primary" style={{ padding: '8px 14px' }}>
              <Send size={16} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
