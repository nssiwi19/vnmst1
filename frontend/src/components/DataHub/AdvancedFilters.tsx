import React from 'react';
import { Filter } from 'lucide-react';

interface AdvancedFiltersProps {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  selectedIndustry: string;
  setSelectedIndustry: (industry: string) => void;
  industryData: any[];
  total: number;
  loading: boolean;
}

export function AdvancedFilters({
  selectedYear,
  setSelectedYear,
  selectedIndustry,
  setSelectedIndustry,
  industryData,
  total,
  loading
}: AdvancedFiltersProps) {
  return (
    <div className="glass" style={{
      padding: '1.2rem 2rem',
      borderRadius: '1.5rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '2rem',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Filter size={18} style={{ color: '#3b82f6' }} />
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#94a3b8' }}>BỘ LỌC TOÀN CỤC:</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: '#16161a',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">Tất cả các năm</option>
          {Array.from({ length: 3 }, (_, i) => 2024 + i).reverse().map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          style={{
            padding: '10px 20px',
            borderRadius: '12px',
            background: '#16161a',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 600,
            outline: 'none',
            cursor: 'pointer',
            flex: 1,
            maxWidth: '400px'
          }}
        >
          <option value="">Tất cả ngành nghề (Top 50)</option>
          {industryData.map((ind, idx) => (
            <option key={idx} value={ind.name.split('-')[0].trim()}>{ind.name}</option>
          ))}
        </select>
      </div>

      <div style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
        {loading ? 'Đang cập nhật dữ liệu...' : `Tìm thấy ${total?.toLocaleString()} kết quả`}
      </div>
    </div>
  );
}
