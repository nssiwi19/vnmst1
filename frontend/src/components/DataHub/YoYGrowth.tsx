import React from 'react';
import { BarChart3 } from 'lucide-react';

interface YoYGrowthProps {
  growthData: any[];
}

export function YoYGrowth({ growthData }: YoYGrowthProps) {
  return (
    <div className="glass card-glow" style={{ padding: '2rem', borderRadius: '1.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BarChart3 size={20} style={{ color: '#10b981' }} /> Tốc độ Tăng trưởng YoY (%)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, justifyContent: 'center' }}>
        {growthData.slice(1).map((d: any, i: number) => {
          const prev = growthData[i]?.value || 1;
          const rate = prev > 0 ? ((d.value - prev) / prev * 100) : 0;
          const maxRate = Math.max(...growthData.slice(1).map((g: any, j: number) => { const p = growthData[j]?.value || 1; return p > 0 ? Math.abs((g.value - p) / p * 100) : 0; })) || 1;
          const barW = Math.min(Math.abs(rate) / maxRate * 100, 100);
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '38px', fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textAlign: 'right' }}>{d.name}</span>
              <div style={{ flex: 1, height: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${barW}%`, height: '100%', background: rate >= 0 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #ef4444, #f87171)', borderRadius: '8px', transition: 'width 1s ease' }} />
              </div>
              <span style={{ width: '60px', fontSize: '0.72rem', fontWeight: 800, color: rate >= 0 ? '#10b981' : '#ef4444', textAlign: 'right' }}>{rate >= 0 ? '+' : ''}{rate.toFixed(1)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
