import React from 'react';
import { PieChart } from 'lucide-react';

interface IndustryDonutProps {
  industryData: any[];
}

export function IndustryDonut({ industryData }: IndustryDonutProps) {
  return (
    <div className="glass card-glow" style={{ padding: '2rem', borderRadius: '1.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <PieChart size={20} style={{ color: '#6366f1' }} /> Tỷ trọng Ngành nghề (Top 5)
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1, justifyContent: 'center' }}>
        <svg width="150" height="150" viewBox="0 0 160 160">
          {(() => {
            const top5 = industryData.slice(0, 5);
            const total = top5.reduce((a: number, b: any) => a + b.value, 0) || 1;
            const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
            let cumAngle = -90;
            return top5.map((d: any, i: number) => {
              const angle = (d.value / total) * 360;
              const sa = cumAngle; cumAngle += angle;
              const r = 70, cx = 80, cy = 80;
              const x1 = cx + r * Math.cos(sa * Math.PI / 180), y1 = cy + r * Math.sin(sa * Math.PI / 180);
              const x2 = cx + r * Math.cos((sa + angle) * Math.PI / 180), y2 = cy + r * Math.sin((sa + angle) * Math.PI / 180);
              return <path key={i} d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${angle > 180 ? 1 : 0} 1 ${x2} ${y2} Z`} fill={colors[i]} opacity="0.85" stroke="#0a0a0c" strokeWidth="2" />;
            });
          })()}
          <circle cx="80" cy="80" r="38" fill="#0a0a0c" />
          <text x="80" y="76" textAnchor="middle" fill="#fff" style={{ fontSize: '13px', fontWeight: 800 }}>{industryData.slice(0, 5).reduce((a: number, b: any) => a + b.value, 0).toLocaleString()}</text>
          <text x="80" y="90" textAnchor="middle" fill="#94a3b8" style={{ fontSize: '8px', fontWeight: 600 }}>TỔNG TOP 5</text>
        </svg>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {industryData.slice(0, 5).map((d: any, i: number) => {
            const total = industryData.slice(0, 5).reduce((a: number, b: any) => a + b.value, 0) || 1;
            const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: colors[i], flexShrink: 0 }} />
                <span style={{ fontSize: '0.72rem', color: '#cbd5e1', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.name}>{d.name.split('-').pop()?.trim()}</span>
                <span style={{ fontSize: '0.7rem', color: '#fff', fontWeight: 800, marginLeft: 'auto' }}>{((d.value / total) * 100).toFixed(1)}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
