import React from 'react';

interface GrowthAnalysisProps {
  growthData: any[];
  selectedYear: string;
}

export function GrowthAnalysis({ growthData, selectedYear }: GrowthAnalysisProps) {
  return (
    <div className="glass card-glow" style={{ padding: '2rem', borderRadius: '1.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.3rem' }}>Phân tích Tăng trưởng Chiến lược</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Chu kỳ thành lập {selectedYear || '2024-2026'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
          Quy mô thành lập
        </div>
      </div>
      <div style={{ flex: 1, minHeight: '240px' }}>
        {growthData.length > 0 ? (
          <svg width="100%" height="100%" viewBox="0 0 800 260" preserveAspectRatio="none" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <filter id="glow"><feGaussianBlur stdDeviation="5" result="b" /><feComposite in="SourceGraphic" in2="b" operator="over" /></filter>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map((v, i) => <line key={i} x1="0" y1={v * 200} x2="800" y2={v * 200} stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="4 4" />)}
            {(() => {
              const max = Math.max(...growthData.map(v => v.value)) || 1;
              const pts = growthData.map((d, i) => ({ x: (i / (growthData.length - 1)) * 800, y: 200 - (d.value / max * 180) }));
              let p = `M ${pts[0].x} ${pts[0].y}`;
              for (let i = 0; i < pts.length - 1; i++) { const c = pts[i], n = pts[i + 1]; p += ` C ${c.x + (n.x - c.x) * 0.4} ${c.y}, ${c.x + (n.x - c.x) * 0.6} ${n.y}, ${n.x} ${n.y}`; }
              return (<><path d={`${p} L 800 260 L 0 260 Z`} fill="url(#areaGrad)" /><path d={p} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" filter="url(#glow)" /></>);
            })()}
            {growthData.map((d, i) => {
              const max = Math.max(...growthData.map(v => v.value)) || 1;
              const x = (i / (growthData.length - 1)) * 800, y = 200 - (d.value / max * 180);
              return (<g key={i}><circle cx={x} cy={y} r="4" fill="#fff" filter="url(#glow)" /><text x={x} y="245" textAnchor="middle" fill="#94a3b8" style={{ fontSize: '11px', fontWeight: 700 }}>{d.name}</text></g>);
            })}
          </svg>
        ) : <div style={{ textAlign: 'center', paddingTop: '100px', color: '#64748b' }}>Đang chuẩn bị dữ liệu...</div>}
      </div>
    </div>
  );
}
