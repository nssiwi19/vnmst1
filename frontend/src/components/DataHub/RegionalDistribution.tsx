import React from 'react';
import { Database as DatabaseIcon } from 'lucide-react';

interface RegionalDistributionProps {
  regionData: any[];
}

export function RegionalDistribution({ regionData }: RegionalDistributionProps) {
  return (
    <div className="glass card-glow" style={{ padding: '2rem', borderRadius: '1.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <DatabaseIcon size={20} style={{ color: '#10b981' }} /> Đối soát Quy mô Khu vực
      </h3>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', flex: 1, minHeight: '220px', padding: '20px 0', gap: '80px', position: 'relative' }}>
        <div style={{ position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', zIndex: 0 }}>
          {[0, 1, 2, 3].map(i => <div key={i} style={{ borderTop: '1px solid rgba(255,255,255,0.03)', width: '100%' }} />)}
        </div>
        {regionData.map((d, i) => {
          const totalReg = regionData.reduce((a, b) => a + b.value, 0) || 1;
          const maxVal = Math.max(...regionData.map(v => v.value)) || 1;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '120px', gap: '14px', zIndex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', padding: '5px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{d.value.toLocaleString()}</div>
              <div style={{ width: '44px', height: `${(d.value / maxVal) * 140}px`, background: i === 0 ? 'linear-gradient(180deg, #10b981, #059669)' : 'linear-gradient(180deg, #3b82f6, #2563eb)', borderRadius: '22px', boxShadow: `0 8px 32px ${i === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)'}`, transition: 'height 1s cubic-bezier(0.34,1.56,0.64,1)', position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)', borderRadius: '22px' }} />
              </div>
              <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{d.name}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>{((d.value / totalReg) * 100).toFixed(1)}% market</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
