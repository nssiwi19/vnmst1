import React, { useState } from 'react';
import { Building2, BarChart3, FileText, Target, Copy, Check, Zap, FileText as FileTextIcon, Phone } from 'lucide-react';

interface PipelineResultsProps {
  pipeline: any;
  crmInsightsDisplay: any;
  handleCopyEmail: (text: string) => void;
  copied: boolean;
  stripMarkdown: (text: string) => string;
}

export function PipelineResults({
  pipeline,
  crmInsightsDisplay,
  handleCopyEmail,
  copied,
  stripMarkdown
}: PipelineResultsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'email' | 'call'>('email');

  return (
    <div className="results-grid">
      {pipeline.raw && (
        <div className="card">
          <h3 className="card-title blue"><Building2 size={18} /> Thông tin đăng ký</h3>
          <div className="info-grid">
            <div className="info-item full"><label>Tên doanh nghiệp</label><p>{pipeline.raw.data.name}</p></div>
            <div className="info-item"><label>Mã số thuế</label><p className="mono">{pipeline.raw.data.id}</p></div>
            <div className="info-item"><label>Địa chỉ</label><p style={{ fontSize: '0.8rem' }}>{pipeline.raw.data.address}</p></div>
          </div>
        </div>
      )}

      {pipeline.research && (
        <div className="card">
          <h3 className="card-title purple"><BarChart3 size={18} /> Phân tích chuyên sâu</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
              {pipeline.research.legalForm || 'Doanh nghiệp'}
            </span>
            <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
              {pipeline.research.inferredSector || 'Đa ngành'}
            </span>
          </div>
          <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: '#94a3b8' }}>
            {pipeline.research.profileBullets?.map((b: string, i: number) => <li key={i} style={{ marginBottom: '8px' }}>• {b}</li>)}
          </ul>
        </div>
      )}

      {pipeline.report && (
        <div className="card report-card">
          <h3 className="card-title emerald"><FileText size={18} /> Báo cáo chiến lược</h3>
          <div className="report-content">{stripMarkdown(pipeline.report.summary)}</div>
        </div>
      )}

      {crmInsightsDisplay && (
        <div className="card crm-card animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="card-title sky" style={{ margin: 0 }}><Target size={18} /> Gợi ý tiếp cận B2B</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => window.print()}
                className="btn-secondary"
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FileTextIcon size={14} /> Xuất PDF
              </button>
              <button
                onClick={() => handleCopyEmail(stripMarkdown(activeSubTab === 'email' ? crmInsightsDisplay.suggestedEmail : crmInsightsDisplay.callScript))}
                className="btn-secondary"
                style={{ padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8' }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Đã chép' : `Sao chép ${activeSubTab === 'email' ? 'Email' : 'Script'}`}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem' }}>
            <div className="crm-sidebar">
              <div className="insight-stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
                <div className="stat-pill" style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Rủi ro</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: crmInsightsDisplay.riskLevel === 'Thấp' ? '#10b981' : '#f59e0b' }}>{crmInsightsDisplay.riskLevel}</span>
                </div>
                <div className="stat-pill" style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <label style={{ fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Tiềm năng</label>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6' }}>{crmInsightsDisplay.strategicPotential || 'Cao'}</span>
                </div>
              </div>

              <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Hành động đề xuất</label>
              <div style={{ color: '#fff', fontSize: '0.9rem', margin: '8px 0 1.5rem', fontWeight: 500 }}>{crmInsightsDisplay.suggestedAction}</div>

              <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Chủ đề Email</label>
              <div className="subject-line" style={{ marginTop: '8px', padding: '12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem' }}>
                {stripMarkdown(crmInsightsDisplay.suggestedSubject)}
              </div>

              <div className="keyword-row">
                {crmInsightsDisplay.keywords?.map((k: string, i: number) => <span key={i} className="keyword-pill">#{k}</span>)}
              </div>
            </div>
            
            <div className="crm-main-content">
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button 
                  onClick={() => setActiveSubTab('email')}
                  className={`sub-tab-btn ${activeSubTab === 'email' ? 'active' : ''}`}
                  style={{ 
                    background: activeSubTab === 'email' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)', 
                    border: activeSubTab === 'email' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    color: activeSubTab === 'email' ? '#38bdf8' : '#94a3b8', 
                    padding: '8px 20px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={14} /> Email Template
                  </div>
                </button>
                <button 
                  onClick={() => setActiveSubTab('call')}
                  className={`sub-tab-btn ${activeSubTab === 'call' ? 'active' : ''}`}
                  style={{ 
                    background: activeSubTab === 'call' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)', 
                    border: activeSubTab === 'call' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                    color: activeSubTab === 'call' ? '#10b981' : '#94a3b8', 
                    padding: '8px 20px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} /> Call Script
                  </div>
                </button>
              </div>

              <div className="email-body" style={{ position: 'relative', minHeight: '300px', animation: 'fade-in 0.3s ease' }}>
                {activeSubTab === 'email' ? (
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {stripMarkdown(crmInsightsDisplay.suggestedEmail)}
                  </div>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap', color: '#10b981' }}>
                    {crmInsightsDisplay.callScript ? stripMarkdown(crmInsightsDisplay.callScript) : "Đang tạo kịch bản gọi điện..."}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Target size={14} /> Nhân sự key cần tiếp cận
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {crmInsightsDisplay.decisionMakers?.map((dm: any, i: number) => (
                      <div key={i} style={{ fontSize: '0.8rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{dm.role}</div>
                        <div style={{ fontSize: '0.7rem', color: '#3b82f6' }}>{dm.approach}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <Zap size={14} /> Đối thủ & Tiềm năng
                  </label>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    <strong>Cạnh tranh:</strong> {crmInsightsDisplay.competitors?.join(", ") || "Đang phân tích..."}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', padding: '10px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.1)' }}>
                    <strong>Triển vọng:</strong> {crmInsightsDisplay.growthOutlook || "Đang đánh giá..."}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
