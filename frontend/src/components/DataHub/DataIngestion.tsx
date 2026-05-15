import React from 'react';
import { Upload, FileSpreadsheet, Database, CheckCircle2, AlertCircle, Loader2, Download } from 'lucide-react';

interface DataIngestionProps {
  file: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => void;
  uploading: boolean;
  status: { type: 'success' | 'error', msg: string } | null;
}

export function DataIngestion({
  file,
  handleFileChange,
  handleUpload,
  uploading,
  status
}: DataIngestionProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: '1.5rem' }}>
      <div className="card" style={{ padding: '2rem', borderRadius: '2rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Upload size={20} style={{ color: '#3b82f6' }} /> Nạp dữ liệu mới
        </h3>

        <div
          style={{
            border: '2px dashed rgba(255,255,255,0.1)',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          <input type="file" id="file-upload" hidden accept=".csv" onChange={handleFileChange} />
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#3b82f6' }}>
            <FileSpreadsheet size={32} style={{ margin: '0 auto' }} />
          </div>
          {file ? (
            <p style={{ fontWeight: 600, color: '#fff' }}>{file.name}</p>
          ) : (
            <>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Kéo thả file CSV vào đây</p>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Dung lượng tối đa: 50MB</p>
            </>
          )}
        </div>

        {status && (
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '12px',
            background: status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: status.type === 'success' ? '#10b981' : '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {status.msg}
          </div>
        )}

        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          style={{
            width: '100%',
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            border: 'none',
            color: 'white',
            fontWeight: 700,
            cursor: file && !uploading ? 'pointer' : 'not-allowed',
            opacity: file && !uploading ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          {uploading ? <Loader2 className="animate-spin" size={20} /> : <Database size={20} />}
          {uploading ? 'Đang nạp dữ liệu...' : 'Bắt đầu nạp vào Database'}
        </button>
      </div>

      <div className="card" style={{ padding: '2rem', borderRadius: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Hướng dẫn định dạng</h3>
        <ul style={{ listStyle: 'none', fontSize: '0.9rem', color: '#94a3b8' }}>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'start', gap: '10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }}></div>
            <span>File phải có định dạng <strong>.csv</strong> với mã hóa UTF-8.</span>
          </li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'start', gap: '10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }}></div>
            <span>Các cột bắt buộc: <strong>ma_so_thue</strong>, <strong>ten_cong_ty</strong>.</span>
          </li>
          <li style={{ marginBottom: '1rem', display: 'flex', alignItems: 'start', gap: '10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6', marginTop: '6px' }}></div>
            <span>Hệ thống sẽ tự động loại bỏ các bản ghi trùng lặp MST.</span>
          </li>
        </ul>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>Tải file mẫu:</p>
          <button style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={14} /> sample_ingestion.csv
          </button>
        </div>
      </div>
    </div>
  );
}
