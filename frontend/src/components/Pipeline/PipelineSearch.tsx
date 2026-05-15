import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SAMPLE_COMPANIES } from '../../lib/samples';
import { CrmPurpose } from '../../types';

interface PipelineSearchProps {
  mstInput: string;
  setMstInput: (val: string) => void;
  purpose: CrmPurpose;
  setPurpose: (val: CrmPurpose) => void;
  runPipeline: () => void;
  isProcessing: boolean;
}

export function PipelineSearch({
  mstInput,
  setMstInput,
  purpose,
  setPurpose,
  runPipeline,
  isProcessing
}: PipelineSearchProps) {
  return (
    <section className="search-section card">
      <div className="search-grid">
        <div className="input-group">
          <label>Mã số thuế doanh nghiệp</label>
          <div className="input-wrapper">
            <Search className="input-icon" size={18} />
            <input value={mstInput} onChange={(e) => setMstInput(e.target.value)} placeholder="Nhập MST..." />
          </div>
        </div>
        <div className="input-group">
          <label>Mục đích phân tích</label>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value as any)}>
            <option value="kyc">Thẩm định đối tác (KYC)</option>
            <option value="sales">Tiếp cận bán hàng (Sales)</option>
            <option value="risk">Đánh giá rủi ro (Risk)</option>
            <option value="market_research">Nghiên cứu thị trường (AI)</option>
          </select>
        </div>
        <button className="btn-start" onClick={runPipeline} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="animate-spin" /> : "Phân tích ngay"}
        </button>
      </div>
      <div className="quick-select" style={{ marginTop: '1rem', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mẫu:</span>
        {SAMPLE_COMPANIES.map(c => (
          <button key={c.mst} onClick={() => setMstInput(c.mst)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer' }}>
            {c.name}
          </button>
        ))}
      </div>
    </section>
  );
}
