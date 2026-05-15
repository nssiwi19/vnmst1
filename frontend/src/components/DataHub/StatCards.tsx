import React from 'react';
import { Database as DatabaseIcon, BarChart3, CheckCircle2, PieChart } from 'lucide-react';

interface StatCardsProps {
  stats: { total: number; sources: number };
  summary: any;
  regionCount: number;
  loading: boolean;
}

export function StatCards({ stats, summary, regionCount, loading }: StatCardsProps) {
  const metrics = [
    { label: 'Tổng doanh nghiệp', val: stats.total?.toLocaleString(), icon: <DatabaseIcon />, color: '#3b82f6', trend: 'Cập nhật' },
    { label: 'Ngành chủ lực', val: summary.top_industry || 'N/A', icon: <BarChart3 />, color: '#8b5cf6', trend: `${summary.industry_share || 0}% market` },
    { label: 'Độ sạch dữ liệu', val: summary.health ? `${summary.health}%` : '0%', icon: <CheckCircle2 />, color: '#10b981', trend: 'Kiểm định AI' },
    { label: 'Tỉnh thành', val: regionCount, icon: <PieChart />, color: '#f59e0b', trend: 'Hoạt động' }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.2rem', marginBottom: '1.5rem' }}>
      {metrics.map((m, i) => (
        <div 
          key={i} 
          className="glass card-glow" 
          style={{ 
            padding: '1.2rem', 
            borderRadius: '1.2rem', 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            position: 'relative', 
            overflow: 'hidden' 
          }}
        >
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.05, transform: 'scale(3)' }}>{m.icon}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.8rem' }}>
            <div style={{ padding: '8px', borderRadius: '10px', background: `${m.color}20`, color: m.color }}>{m.icon}</div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>
            {loading ? '...' : m.val}
          </div>
          <div style={{ fontSize: '0.7rem', color: m.color, fontWeight: 700 }}>{m.trend}</div>
        </div>
      ))}
    </div>
  );
}
