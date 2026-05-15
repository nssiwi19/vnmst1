import React from 'react';
import { BarChart3 } from 'lucide-react';

interface MonthlyHeatmapProps {
  monthlyData: any[];
  selectedYear: string;
}

export function MonthlyHeatmap({ monthlyData, selectedYear }: MonthlyHeatmapProps) {
  const max = monthlyData.reduce((a: any, b: any) => a.value > b.value ? a : b, { value: 0, name: '' });
  const nonZero = monthlyData.filter((d: any) => d.value > 0);
  const min = nonZero.length > 0 ? nonZero.reduce((a: any, b: any) => a.value < b.value ? a : b) : { value: 0, name: 'N/A' };
  const total = monthlyData.reduce((a: number, b: any) => a + b.value, 0);

  return (
    <div className="glass card-glow" style={{ padding: '2rem', borderRadius: '1.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <BarChart3 size={20} style={{ color: '#f59e0b' }} /> Phân bố Đăng ký theo Tháng {selectedYear ? `(${selectedYear})` : '(Tất cả)'}
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '8px', alignItems: 'flex-end', height: '200px' }}>
        {monthlyData.map((d: any, i: number) => {
          const maxVal = Math.max(...monthlyData.map((v: any) => v.value)) || 1;
          const pct = (d.value / maxVal) * 100;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#fff' }}>{d.value.toLocaleString()}</span>
              <div style={{
                width: '100%', height: `${Math.max(pct, 4)}%`,
                background: `linear-gradient(180deg, rgba(245,158,11,${0.3 + (d.value / maxVal) * 0.7}), rgba(234,88,12,${0.2 + (d.value / maxVal) * 0.6}))`,
                borderRadius: '8px 8px 4px 4px', transition: 'height 0.8s ease',
                boxShadow: d.value === maxVal ? '0 0 20px rgba(245,158,11,0.4)' : 'none',
                border: d.value === maxVal ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.05)'
              }} />
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700 }}>{d.name}</span>
            </div>
          );
        })}
      </div>
      {monthlyData.length > 0 && (
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cao nhất: <strong style={{ color: '#f59e0b' }}>{max.name} ({max.value.toLocaleString()})</strong></span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Thấp nhất: <strong style={{ color: '#64748b' }}>{min.name} ({min.value?.toLocaleString()})</strong></span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>TB: <strong style={{ color: '#fff' }}>{Math.round(total / 12).toLocaleString()}/tháng</strong></span>
        </div>
      )}
    </div>
  );
}
