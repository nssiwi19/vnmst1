import React from 'react';
import { PieChart } from 'lucide-react';

interface IndustryTopTenProps {
  industryData: any[];
}

export function IndustryTopTen({ industryData }: IndustryTopTenProps) {
  return (
    <div className="glass card-glow" style={{ padding: '2rem', borderRadius: '1.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <PieChart size={20} style={{ color: '#a855f7' }} /> Trọng số Ngành (Top 10)
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', flex: 1, justifyContent: 'center' }}>
        {industryData.slice(0, 10).map((d, i) => (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
              <span style={{ color: '#cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }} title={d.name}>{d.name.split('-').pop()?.trim()}</span>
              <span style={{ fontWeight: 800, color: '#fff' }}>{d.value.toLocaleString()}</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.03)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${(d.value / (industryData[0]?.value || 1)) * 100}%`, height: '100%', background: `linear-gradient(to right, ${['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'][i % 5]}, ${['#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'][i % 5]})`, borderRadius: '3px', transition: 'width 1s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
