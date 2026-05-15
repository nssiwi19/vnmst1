import React from 'react';
import { Search, BarChart3, FileText, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

interface PipelineStepperProps {
  step: string;
}

export function PipelineStepper({ step }: PipelineStepperProps) {
  const steps = [
    { key: "fetching_raw", label: "Dữ liệu gốc", icon: Search, desc: "Tra cứu MST & Metadata" },
    { key: "researching", label: "Agent Research", icon: BarChart3, desc: "Nghiên cứu Internet & DB" },
    { key: "reporting", label: "Agent Report", icon: FileText, desc: "Tổng hợp báo cáo chiến lược" },
    { key: "verifying", label: "Agent Verify", icon: CheckCircle2, desc: "Kiểm định & Trích xuất CRM" },
  ];

  const isProcessing = step !== "idle" && step !== "completed" && step !== "error";

  return (
    <div className="stepper-container" style={{ position: 'relative', marginBottom: '2rem' }}>
      <div className="stepper">
        {steps.map((s, idx) => {
          const isActive = step === s.key;
          const isDone = (
            (idx === 0 && ["researching", "reporting", "verifying", "completed"].includes(step)) ||
            (idx === 1 && ["reporting", "verifying", "completed"].includes(step)) ||
            (idx === 2 && ["verifying", "completed"].includes(step)) ||
            (idx === 3 && step === "completed")
          );
          return (
            <div key={idx} className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
              <div className="step-icon">{isActive ? <Loader2 className="animate-spin" size={16} /> : <s.icon size={16} />}</div>
              <div className="step-content">
                <span className="step-num">BƯỚC {idx + 1}</span>
                <span className="step-label">{s.label}</span>
                <span className="step-desc" style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>{s.desc}</span>
              </div>
            </div>
          );
        })}
      </div>
      {isProcessing && (
        <div className="status-toast animate-pulse" style={{ position: 'absolute', right: 0, top: '-30px', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> Agent đang làm việc...
        </div>
      )}
    </div>
  );
}
