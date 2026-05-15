import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface DataQualityAuditProps {
  qualityData: any[];
  total: number;
}

export function DataQualityAudit({ qualityData, total }: DataQualityAuditProps) {
  return (
    <div className="glass card-glow" style={{ padding: '2rem', borderRadius: '1.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <CheckCircle2 size={20} style={{ color: '#10b981' }} /> Kiểm toán Chất lượng Dữ liệu ({total?.toLocaleString()} bản ghi)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem' }}>
        {qualityData.map((d: any, i: number) => {
          const color = d.value >= 90 ? '#10b981' : d.value >= 70 ? '#f59e0b' : '#ef4444';
          const circ = 2 * Math.PI * 36;
          const off = circ - (d.value / 100) * circ;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <svg width="90" height="90" viewBox="0 0 90 90">
                <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                <circle cx="45" cy="45" r="36" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={circ} strokeDashoffset={off} transform="rotate(-90 45 45)" style={{ transition: 'stroke-dashoffset 1.5s ease' }} />
                <text x="45" y="42" textAnchor="middle" fill="#fff" style={{ fontSize: '15px', fontWeight: 800 }}>{d.value}%</text>
                <text x="45" y="56" textAnchor="middle" fill="#94a3b8" style={{ fontSize: '8px', fontWeight: 600 }}>{d.count?.toLocaleString()}</text>
              </svg>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textAlign: 'center' }}>{d.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
