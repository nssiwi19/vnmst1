import React from 'react';
import { BarChart3 } from 'lucide-react';

interface IntelligenceInsightsProps {
  summary: any;
  growthData: any[];
}

export function IntelligenceInsights({ summary, growthData }: IntelligenceInsightsProps) {
  const insights = [
    { label: 'Ngành Bùng nổ', desc: `${summary.top_industry || 'N/A'} dẫn đầu thị trường`, status: 'Hot', color: '#ef4444' },
    { label: 'Thị phần', desc: `Chiếm ${summary.industry_share || 0}% tổng DN`, status: 'High', color: '#8b5cf6' },
    { label: 'Tăng trưởng', desc: `Trung bình ${growthData[growthData.length - 1]?.change || 0}%/năm`, status: '+', color: '#10b981' },
    { label: 'Độ tin cậy', desc: 'Supabase realtime sync', status: '✓', color: '#3b82f6' }
  ];

  return (
    <div className="glass card-glow" style={{ padding: '2rem', borderRadius: '1.8rem', background: 'linear-gradient(135deg, rgba(30,64,175,0.05), rgba(88,28,135,0.05))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', color: '#60a5fa' }}>
        <BarChart3 size={22} /> Elite-DA Intelligence
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flex: 1, justifyContent: 'center' }}>
        {insights.map((ins, idx) => (
          <div key={idx} style={{ padding: '0.8rem', borderRadius: '0.8rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '36px', background: ins.color, borderRadius: '2px' }} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{ins.label}</span>
                <span style={{ fontSize: '0.6rem', padding: '1px 5px', borderRadius: '4px', background: `${ins.color}20`, color: ins.color, fontWeight: 800 }}>{ins.status}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0 }}>{ins.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <button style={{ marginTop: '1rem', width: '100%', padding: '0.7rem', borderRadius: '0.8rem', background: '#3b82f6', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }} className="btn-glow">Tạo báo cáo chi tiết</button>
    </div>
  );
}
