import React from 'react';
import { Database as DatabaseIcon, Search, Download, Database, Loader2, BarChart3, AlertCircle } from 'lucide-react';

interface CompanyDirectoryProps {
  companies: any[];
  loadingTable: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  page: number;
  setPage: (page: number | ((p: number) => number)) => void;
  total: number;
  seeding: boolean;
  handleSeed: () => void;
  handleExport: () => void;
  handleDelete: (mst: string) => void;
}

export function CompanyDirectory({
  companies,
  loadingTable,
  searchTerm,
  setSearchTerm,
  page,
  setPage,
  total,
  seeding,
  handleSeed,
  handleExport,
  handleDelete
}: CompanyDirectoryProps) {
  return (
    <div className="card" style={{ padding: '2rem', marginTop: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <DatabaseIcon size={20} style={{ color: '#3b82f6' }} /> Danh bạ Doanh nghiệp nội bộ
        </h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {seeding ? <Loader2 size={14} className="animate-spin" /> : <Database size={14} />}
            Nạp mẫu
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
          >
            <Download size={14} /> Xuất CSV
          </button>
          <div className="search-box" style={{ position: 'relative', width: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Tìm MST hoặc tên..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 8px 8px 36px', borderRadius: '10px', color: '#fff', fontSize: '0.85rem' }}
            />
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#94a3b8' }}>
              <th style={{ padding: '12px', fontWeight: 600 }}>MST</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Tên Doanh nghiệp</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Tỉnh / Thành</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Số điện thoại</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Email</th>
              <th style={{ padding: '12px', fontWeight: 600 }}>Địa chỉ</th>
              <th style={{ padding: '12px', fontWeight: 600, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loadingTable ? (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}><Loader2 className="animate-spin" /></td></tr>
            ) : companies.length > 0 ? (
              companies.map((c, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="table-row-hover">
                  <td style={{ padding: '12px' }}><span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700 }}>{c.ma_so_thue}</span></td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#fff' }}>{c.ten_cong_ty}</td>
                  <td style={{ padding: '12px' }}><span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{c.ten_tinh || '-'}</span></td>
                  <td style={{ padding: '12px', color: '#fff', fontSize: '0.85rem' }}>{c.so_dien_thoai || '-'}</td>
                  <td style={{ padding: '12px', color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'underline' }}>{c.email || '-'}</td>
                  <td style={{ padding: '12px', fontSize: '0.8rem', color: '#94a3b8' }}>{c.dia_chi_day_du || c.so_nha || '-'}</td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        title="Phân tích"
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('switch-tab', { detail: { tab: 'pipeline', mst: c.ma_so_thue } }));
                        }}
                        style={{ padding: '6px', borderRadius: '6px', background: 'rgba(59, 130, 246, 0.1)', border: 'none', color: '#3b82f6', cursor: 'pointer' }}
                      >
                        <BarChart3 size={16} />
                      </button>
                      <button
                        title="Xóa"
                        onClick={() => handleDelete(c.ma_so_thue)}
                        style={{ padding: '6px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <AlertCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Không tìm thấy dữ liệu doanh nghiệp nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 10 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '1.5rem' }}>
          <button
            disabled={page === 1}
            onClick={() => setPage((p: number) => p - 1)}
            style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
          >Trước</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.9rem' }}>
            Trang 
            <input 
              key={page}
              type="number" 
              defaultValue={page}
              min={1}
              max={Math.ceil(total / 10)}
              title="Nhập số trang và nhấn Enter"
              onBlur={(e) => {
                const p = parseInt(e.target.value);
                if (!isNaN(p) && p >= 1 && p <= Math.ceil(total / 10) && p !== page) setPage(p);
                else e.target.value = page.toString();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const p = parseInt(e.currentTarget.value);
                  if (!isNaN(p) && p >= 1 && p <= Math.ceil(total / 10) && p !== page) setPage(p);
                  else e.currentTarget.value = page.toString();
                }
              }}
              style={{ width: '70px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', padding: '4px 8px', textAlign: 'center', outline: 'none' }}
            />
            / {Math.ceil(total / 10)}
          </div>
          <button
            disabled={page >= Math.ceil(total / 10)}
            onClick={() => setPage((p: number) => p + 1)}
            style={{ padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: page >= Math.ceil(total / 10) ? 'not-allowed' : 'pointer' }}
          >Sau</button>
        </div>
      )}
    </div>
  );
}
