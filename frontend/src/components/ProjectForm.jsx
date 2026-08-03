import React, { useState } from 'react';
import { Sparkles, Server, Users, DollarSign, Calendar, Shield, Cloud, Layers, Rocket, CheckCircle2 } from 'lucide-react';

export default function ProjectForm({ onSubmit, loading }) {
  const [formData, setFormData] = useState({
    project_name: 'NexusPay Enterprise',
    domain: 'FinTech & Payments',
    description: 'A global multi-currency payment orchestration gateway supporting real-time fraud detection, micro-transactions, and high-frequency settlement ledger for merchant accounts.',
    expected_users: '100,000 - 1,000,000 DAU (Peak 5,000 req/sec)',
    team_size: '5 Senior Developers (2 Backend, 2 Frontend, 1 DevOps)',
    budget: 'Enterprise Scale ($5,000 - $15,000 / month)',
    deadline: '6 Months to GA Launch',
    required_features: 'Real-time Payment Processing, Fraud AI Detection Engine, OAuth2 RBAC Dashboard, Audit Logging, Multi-Tenant Ledger API, Webhook Event Notifications',
    compliance_needs: 'PCI-DSS Level 1 Compliant, SOC2 Type II, GDPR Data Encryption',
    preferred_cloud: 'AWS Cloud (US-East & EU Multi-Region)'
  });

  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDemoPreset = (presetType) => {
    if (presetType === 'fintech') {
      setFormData({
        project_name: 'NexusPay Gateway',
        domain: 'FinTech & Payments',
        description: 'High-frequency transaction ledger and payment processing gateway requiring zero-downtime, ACID compliance, and low latency event streams.',
        expected_users: '500,000 DAU (Peak 10,000 TPS)',
        team_size: '6 Developers & 2 Security Engineers',
        budget: '$10,000 - $25,000 / month',
        deadline: '6 Months',
        required_features: 'Payment Ledger, Fraud Analytics, PCI-DSS Security, Real-Time Webhooks, Merchant Analytics Portal',
        compliance_needs: 'PCI-DSS Level 1, ISO 27001, GDPR',
        preferred_cloud: 'AWS Multi-AZ (Fargate + Aurora)'
      });
    } else if (presetType === 'ecommerce') {
      setFormData({
        project_name: 'OmniMarket Cloud',
        domain: 'E-Commerce & Retail',
        description: 'Multi-vendor e-commerce marketplace featuring dynamic flash sales, real-time inventory synchronization, vector search, and personalized product recommendations.',
        expected_users: '250,000 DAU',
        team_size: '4 Full-Stack Engineers',
        budget: '$3,000 - $8,000 / month',
        deadline: '4 Months',
        required_features: 'Product Catalog Search, Redis Cart Session, Shopping Cart & Checkout, Seller Portal, Recommendation Engine',
        compliance_needs: 'Standard Security, GDPR, SSL Encryption',
        preferred_cloud: 'GCP / AWS Hybrid'
      });
    } else if (presetType === 'ai') {
      setFormData({
        project_name: 'ArchitectAI Platform',
        domain: 'AI & Machine Learning SaaS',
        description: 'Generative AI content generator utilizing LLM prompt pipelines, vector databases for RAG retrieval, and async worker queues for heavy document inference.',
        expected_users: '50,000 Active Users',
        team_size: '3 AI/Full-Stack Developers',
        budget: '$2,000 - $5,000 / month',
        deadline: '3 Months',
        required_features: 'Vector Search, Prompt Pipeline, Celery Async Worker Queue, Subscription Billing, API Rate Limiter',
        compliance_needs: 'SOC2 Data Isolation',
        preferred_cloud: 'AWS (ECS + pgvector) + Nvidia GPU Cloud'
      });
    }
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '0 20px' }} className="animate-fade-in">
      
      {/* Header Banner */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="badge badge-indigo" style={{ marginBottom: '12px' }}>
          <Sparkles size={14} /> AI Solution Architect Engine
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', marginBottom: '12px' }}>
          Describe Your Software Project Requirements
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: '680px', margin: '0 auto' }}>
          Provide your system requirements below. Our AI Architect will generate a tailored enterprise architecture blueprint, tech stack justifications, sprint plan, cost model, and risk matrix.
        </p>

        {/* Demo Preset Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Quick Presets:</span>
          <button type="button" onClick={() => handleDemoPreset('fintech')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            ⚡ FinTech Payment Ledger
          </button>
          <button type="button" onClick={() => handleDemoPreset('ecommerce')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            🛒 E-Commerce Marketplace
          </button>
          <button type="button" onClick={() => handleDemoPreset('ai')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
            🤖 Generative AI SaaS
          </button>
        </div>
      </div>

      {/* Multi-Step Wizard Indicator */}
      <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {[
          { num: 1, label: '1. Project Info' },
          { num: 2, label: '2. Scale & Metrics' },
          { num: 3, label: '3. Team & Budget' },
          { num: 4, label: '4. Cloud & Features' }
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: step === s.num ? '#818cf8' : (step > s.num ? '#34d399' : 'var(--text-muted)'),
              fontWeight: step === s.num ? '700' : '500',
              fontSize: '0.9rem'
            }}
          >
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: step === s.num ? 'rgba(99, 102, 241, 0.25)' : (step > s.num ? 'rgba(52, 211, 153, 0.2)' : 'rgba(255,255,255,0.05)'),
              border: `1px solid ${step === s.num ? '#6366f1' : (step > s.num ? '#10b981' : 'var(--border-color)')}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem'
            }}>
              {step > s.num ? <CheckCircle2 size={16} /> : s.num}
            </div>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Main Requirement Form */}
      <form onSubmit={handleSubmitForm} className="glass-panel" style={{ padding: '32px' }}>
        
        {/* STEP 1: PROJECT IDENTITY */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers color="#818cf8" size={22} /> Step 1: Project Identity & Domain
            </h2>

            <div className="form-group">
              <label className="form-label">Project Name *</label>
              <input
                type="text"
                name="project_name"
                className="form-input"
                placeholder="e.g. NexusPay Enterprise"
                value={formData.project_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry Domain *</label>
              <select name="domain" className="form-select" value={formData.domain} onChange={handleChange}>
                <option value="FinTech & Payments">FinTech & Financial Ledger</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail Marketplace</option>
                <option value="Healthcare & Telemedicine">Healthcare & HIPAA Medical</option>
                <option value="AI & Machine Learning SaaS">AI / LLM Machine Learning SaaS</option>
                <option value="Enterprise B2B SaaS">Enterprise B2B SaaS Platform</option>
                <option value="IoT & Real-Time Logistics">IoT & Real-Time Fleet Logistics</option>
                <option value="Social Media & Streaming">Social Media & Real-time Messaging</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Detailed Project Description & Business Goals *</label>
              <textarea
                name="description"
                rows={4}
                className="form-textarea"
                placeholder="Describe what the system does, key data flows, and primary business requirements..."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" onClick={() => setStep(2)} className="btn-primary">
                Next: Scale & Metrics →
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SCALE & METRICS */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users color="#38bdf8" size={22} /> Step 2: Expected Scale & Traffic Load
            </h2>

            <div className="form-group">
              <label className="form-label">Expected Active Users (DAU/MAU) & Peak Traffic</label>
              <input
                type="text"
                name="expected_users"
                className="form-input"
                placeholder="e.g. 100,000 DAU, 2,000 peak requests/sec"
                value={formData.expected_users}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Key Functional Features List</label>
              <textarea
                name="required_features"
                rows={4}
                className="form-textarea"
                placeholder="List major features e.g. User Auth, Real-time Dashboard, Billing, Webhooks, Search..."
                value={formData.required_features}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={() => setStep(3)} className="btn-primary">
                Next: Team & Budget →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: TEAM & BUDGET */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign color="#34d399" size={22} /> Step 3: Team Constraints & Target Budget
            </h2>

            <div className="form-group">
              <label className="form-label">Engineering Team Size & Skill Profile</label>
              <input
                type="text"
                name="team_size"
                className="form-input"
                placeholder="e.g. 4 Developers (2 Python, 2 React)"
                value={formData.team_size}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Target Infrastructure Monthly Budget</label>
              <input
                type="text"
                name="budget"
                className="form-input"
                placeholder="e.g. $2,000 - $5,000 / month"
                value={formData.budget}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project Target Deadline</label>
              <input
                type="text"
                name="deadline"
                className="form-input"
                placeholder="e.g. 4 Months to MVP launch"
                value={formData.deadline}
                onChange={handleChange}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
              <button type="button" onClick={() => setStep(2)} className="btn-secondary">
                ← Back
              </button>
              <button type="button" onClick={() => setStep(4)} className="btn-primary">
                Next: Cloud & Compliance →
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CLOUD & COMPLIANCE */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield color="#f59e0b" size={22} /> Step 4: Security Standards & Cloud Preferences
            </h2>

            <div className="form-group">
              <label className="form-label">Security Standards & Compliance Regulations</label>
              <input
                type="text"
                name="compliance_needs"
                className="form-input"
                placeholder="e.g. GDPR, HIPAA, PCI-DSS, SOC2"
                value={formData.compliance_needs}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Preferred Cloud Infrastructure Provider</label>
              <select name="preferred_cloud" className="form-select" value={formData.preferred_cloud} onChange={handleChange}>
                <option value="AWS Cloud (US & EU Multi-AZ)">AWS (Amazon Web Services)</option>
                <option value="Google Cloud Platform (GCP)">Google Cloud Platform (GCP)</option>
                <option value="Microsoft Azure Cloud">Microsoft Azure</option>
                <option value="Multi-Cloud Hybrid Strategy">Multi-Cloud Hybrid (AWS + GCP)</option>
                <option value="Serverless Cloudflare & Vercel Edge">Serverless Edge (Vercel / Cloudflare)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px' }}>
              <button type="button" onClick={() => setStep(3)} className="btn-secondary">
                ← Back
              </button>
              
              <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
                {loading ? (
                  <>
                    <span className="animate-spin">⚙️</span> Evaluating Enterprise Architecture...
                  </>
                ) : (
                  <>
                    <Rocket size={18} /> Generate Architecture Blueprint
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}
