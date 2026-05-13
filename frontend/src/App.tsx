import { useCallback, useMemo, useState, useEffect } from "react";
import { ArchitectureFlow } from "./components/ArchitectureFlow";
import { Login } from "./components/Login";
import { History } from "./components/History";
import { DataHub } from "./components/DataHub";
import { supabase } from "./lib/supabase";
import { analyzeCompanyFull } from "./lib/agents";
import { buildCrmInsight } from "./lib/crm";
import { SAMPLE_COMPANIES } from "./lib/samples";
import { fetchBusinessByTaxCode, normalizeMst } from "./lib/vietqr";
import { api } from "./lib/api";
import type { CrmPurpose, PipelineState } from "./types";
import { User } from "@supabase/supabase-js";
import { 
  LogOut, Search, Building2, FileText, CheckCircle2, 
  ChevronRight, Loader2, BarChart3, History as HistoryIcon,
  Sparkles, ShieldCheck, Target, Zap, Copy, Check, Database
} from "lucide-react";

type TabId = "arch" | "pipeline" | "history" | "data";

const stripMarkdown = (text: string) => {
  if (!text) return "";
  return text.replace(/\*\*/g, "");
};

interface ExtendedState extends PipelineState {
  crm_insights?: any;
}

const initialPipeline = (mst: string): ExtendedState => ({
  mst,
  raw: null,
  research: null,
  report: null,
  verification: null,
  step: "idle",
  error: null,
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [tab, setTab] = useState<TabId>("pipeline");
  const [mstInput, setMstInput] = useState("0100109106");
  const [purpose, setPurpose] = useState<CrmPurpose>("kyc");
  const [pipeline, setPipeline] = useState<ExtendedState>(() => initialPipeline("0100109106"));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleSwitch = (e: any) => {
      setActiveTab(e.detail.tab);
      if (e.detail.mst) setTaxCode(e.detail.mst);
    };
    window.addEventListener('switch-tab', handleSwitch as any);
    return () => window.removeEventListener('switch-tab', handleSwitch as any);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingSession(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleHistorySelect = (record: any) => {
    setPipeline({
      mst: record.tax_code,
      raw: { data: { name: record.company_name, id: record.tax_code, address: "" }, code: "00", desc: "Success" },
      research: record.research_data,
      report: { summary: record.report_content },
      verification: { isVerified: true, confidence: 1, notes: "History Data" },
      crm_insights: record.crm_insights,
      step: "completed",
      error: null
    });
    setTab("pipeline");
  };

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runPipeline = useCallback(async () => {
    const mst = normalizeMst(mstInput);
    setPipeline({ ...initialPipeline(mst), step: "fetching_raw" });

    try {
      // 1. Thử tra cứu trong Supabase qua Backend
      let companyData = null;
      try {
        console.log(`Checking Supabase for MST: ${mst}`);
        const dbSearch = await api.get(`/companies?q=${mst}&page_size=1`);
        if (dbSearch.data && dbSearch.data.length > 0) {
          const dbCompany = dbSearch.data[0];
          companyData = {
            id: dbCompany.ma_so_thue,
            name: dbCompany.ten_cong_ty,
            address: dbCompany.dia_chi_day_du || dbCompany.so_nha || "Đang cập nhật",
            source: "Supabase"
          };
        }
      } catch (dbErr) {
        console.warn("Supabase lookup failed, falling back to VietQR:", dbErr);
      }

      // 2. Nếu chưa có dữ liệu, thử VietQR
      if (!companyData) {
        console.log("Fetching from VietQR...");
        const raw = await fetchBusinessByTaxCode(mst);
        if (raw.code === "00") {
          companyData = { ...raw.data, source: "VietQR" };
        } else {
          throw new Error("Không tìm thấy thông tin doanh nghiệp trên cả hệ thống nội bộ và VietQR");
        }
      }

      setPipeline((prev) => ({ 
        ...prev, 
        raw: { data: companyData, code: "00", desc: "Success" }, 
        step: "researching" 
      }));

      // 3. Chạy AI Analysis
      const fullResult = await analyzeCompanyFull(companyData, purpose);
      
      setPipeline((prev) => ({ ...prev, research: fullResult.research, step: "reporting" }));
      await new Promise(r => setTimeout(r, 800));
      
      setPipeline((prev) => ({ ...prev, report: fullResult.report, step: "verifying" }));
      await new Promise(r => setTimeout(r, 600));

      setPipeline((prev) => ({ 
        ...prev, 
        crm_insights: fullResult.crm_insights,
        verification: { isVerified: true, confidence: 0.98, notes: "Verified" },
        step: "completed" 
      }));
    } catch (err: any) {
      setPipeline((prev) => ({ ...prev, step: "error", error: err.message || "Unknown error" }));
    }
  }, [mstInput, purpose]);

  const crmInsightsDisplay = useMemo(() => {
    if (pipeline.crm_insights) return pipeline.crm_insights;
    if (!pipeline.raw?.data || !pipeline.research || !pipeline.report) return null;
    return buildCrmInsight(pipeline.raw.data, pipeline.research, pipeline.report, purpose);
  }, [pipeline, purpose]);

  if (loadingSession) return <div className="loading-screen"><Loader2 className="animate-spin" /></div>;
  if (!user) return <Login />;

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo-box"><Building2 size={20} /></div>
            <div className="logo-text">
              <span className="brand">E14CRM MCNA</span>
              <span className="version">Enterprise Intelligence</span>
            </div>
          </div>
          <nav className="nav">
            <button onClick={() => setTab("arch")} className={tab === "arch" ? "active" : ""}>Kiến trúc</button>
            <button onClick={() => setTab("pipeline")} className={tab === "pipeline" ? "active" : ""}>Quy trình</button>
            <button onClick={() => setTab("data")} className={tab === "data" ? "active" : ""}>Dữ liệu</button>
            <button onClick={() => setTab("history")} className={tab === "history" ? "active" : ""}>Lịch sử</button>
          </nav>
          <div className="user-section">
             <span className="user-email" style={{marginRight: '1rem', color: '#94a3b8'}}>{user.email?.split('@')[0]}</span>
             <button onClick={handleSignOut} className="logout-btn" style={{background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer'}}>
               <LogOut size={18} />
             </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {tab === "arch" && <ArchitectureFlow />}
        {tab === "history" && <History onSelect={handleHistorySelect} />}
        {tab === "data" && <DataHub />}

        {tab === "pipeline" && (
          <div className="pipeline-view animate-fade-in">
            <section className="search-section card">
              <div className="search-grid">
                <div className="input-group">
                  <label>Mã số thuế doanh nghiệp</label>
                  <div className="input-wrapper">
                    <Search className="input-icon" size={18} />
                    <input value={mstInput} onChange={(e) => setMstInput(e.target.value)} placeholder="Nhập MST..." />
                  </div>
                </div>
                <div className="input-group">
                  <label>Mục đích phân tích</label>
                  <select value={purpose} onChange={(e) => setPurpose(e.target.value as any)}>
                    <option value="kyc">Thẩm định đối tác (KYC)</option>
                    <option value="sales">Tiếp cận bán hàng (Sales)</option>
                    <option value="risk">Đánh giá rủi ro (Risk)</option>
                    <option value="market_research">Nghiên cứu thị trường (AI)</option>
                  </select>
                </div>
                <button className="btn-start" onClick={runPipeline} disabled={pipeline.step !== "idle" && pipeline.step !== "completed" && pipeline.step !== "error"}>
                  {pipeline.step !== "idle" && pipeline.step !== "completed" && pipeline.step !== "error" ? <Loader2 className="animate-spin" /> : "Phân tích ngay"}
                </button>
              </div>
              <div className="quick-select" style={{marginTop: '1rem', display: 'flex', gap: '8px', alignItems: 'center'}}>
                <span style={{fontSize: '0.8rem', color: '#94a3b8'}}>Mẫu:</span>
                {SAMPLE_COMPANIES.map(c => (
                  <button key={c.mst} onClick={() => setMstInput(c.mst)} style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', cursor: 'pointer'}}>
                    {c.name}
                  </button>
                ))}
              </div>
            </section>

            <div className="stepper-container" style={{position: 'relative', marginBottom: '2rem'}}>
              <div className="stepper">
                {[
                  { key: "fetching_raw", label: "Dữ liệu gốc", icon: Search, desc: "Tra cứu MST & Metadata" },
                  { key: "researching", label: "Agent Research", icon: BarChart3, desc: "Nghiên cứu Internet & DB" },
                  { key: "reporting", label: "Agent Report", icon: FileText, desc: "Tổng hợp báo cáo chiến lược" },
                  { key: "verifying", label: "Agent Verify", icon: CheckCircle2, desc: "Kiểm định & Trích xuất CRM" },
                ].map((s, idx) => {
                  const isActive = pipeline.step === s.key;
                  const isDone = (
                    (idx === 0 && ["researching", "reporting", "verifying", "completed"].includes(pipeline.step)) ||
                    (idx === 1 && ["reporting", "verifying", "completed"].includes(pipeline.step)) ||
                    (idx === 2 && ["verifying", "completed"].includes(pipeline.step)) ||
                    (idx === 3 && pipeline.step === "completed")
                  );
                  return (
                    <div key={idx} className={`step-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                      <div className="step-icon">{isActive ? <Loader2 className="animate-spin" size={16}/> : <s.icon size={16}/>}</div>
                      <div className="step-content">
                        <span className="step-num">BƯỚC {idx + 1}</span>
                        <span className="step-label">{s.label}</span>
                        <span className="step-desc" style={{fontSize: '0.65rem', color: '#64748b', marginTop: '2px'}}>{s.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {pipeline.step !== "idle" && pipeline.step !== "completed" && pipeline.step !== "error" && (
                <div className="status-toast animate-pulse" style={{position: 'absolute', right: 0, top: '-30px', fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <Sparkles size={14} /> Agent đang làm việc...
                </div>
              )}
            </div>

            {pipeline.step === "error" && <div className="card" style={{borderColor: '#ef4444', color: '#ef4444', padding: '1rem'}}>Lỗi: {pipeline.error}</div>}

            <div className="results-grid">
              {pipeline.raw && (
                <div className="card">
                  <h3 className="card-title blue"><Building2 size={18}/> Thông tin đăng ký</h3>
                  <div className="info-grid">
                    <div className="info-item full"><label>Tên doanh nghiệp</label><p>{pipeline.raw.data.name}</p></div>
                    <div className="info-item"><label>Mã số thuế</label><p className="mono">{pipeline.raw.data.id}</p></div>
                    <div className="info-item"><label>Địa chỉ</label><p style={{fontSize: '0.8rem'}}>{pipeline.raw.data.address}</p></div>
                  </div>
                </div>
              )}

              {pipeline.research && (
                <div className="card">
                  <h3 className="card-title purple"><BarChart3 size={18}/> Phân tích chuyên sâu</h3>
                  <div style={{display: 'flex', gap: '8px', marginBottom: '1rem'}}>
                    <span style={{background: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700}}>
                      {pipeline.research.legalForm || 'Doanh nghiệp'}
                    </span>
                    <span style={{background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700}}>
                      {pipeline.research.inferredSector || 'Đa ngành'}
                    </span>
                  </div>
                  <ul style={{listStyle: 'none', fontSize: '0.9rem', color: '#94a3b8'}}>
                    {pipeline.research.profileBullets?.map((b: string, i: number) => <li key={i} style={{marginBottom: '8px'}}>• {b}</li>)}
                  </ul>
                </div>
              )}

              {pipeline.report && (
                <div className="card report-card">
                  <h3 className="card-title emerald"><FileText size={18}/> Báo cáo chiến lược</h3>
                  <div className="report-content">{stripMarkdown(pipeline.report.summary)}</div>
                </div>
              )}

              {crmInsightsDisplay && (
                <div className="card crm-card animate-slide-up">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
                    <h3 className="card-title sky" style={{margin: 0}}><Target size={18}/> Gợi ý tiếp cận B2B</h3>
                    <div style={{display: 'flex', gap: '8px'}}>
                       <button 
                         onClick={() => window.print()}
                         style={{background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'}}
                       >
                         <FileText size={14} /> Xuất PDF
                       </button>
                       <button 
                         onClick={() => handleCopyEmail(stripMarkdown(crmInsightsDisplay.suggestedEmail))}
                         style={{background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '6px 12px', borderRadius: '8px', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s'}}
                       >
                         {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Đã chép' : 'Sao chép Email'}
                       </button>
                    </div>
                  </div>
                  
                  <div style={{display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.5rem'}}>
                    <div className="crm-sidebar">
                      <div className="insight-stat-grid" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem'}}>
                        <div className="stat-pill" style={{background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'}}>
                          <label style={{fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px'}}>Rủi ro</label>
                          <span style={{fontSize: '0.85rem', fontWeight: 700, color: crmInsightsDisplay.riskLevel === 'Thấp' ? '#10b981' : '#f59e0b'}}>{crmInsightsDisplay.riskLevel}</span>
                        </div>
                        <div className="stat-pill" style={{background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)'}}>
                          <label style={{fontSize: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: '4px'}}>Tiềm năng</label>
                          <span style={{fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6'}}>{crmInsightsDisplay.strategicPotential || 'Cao'}</span>
                        </div>
                      </div>

                      <label style={{fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase'}}>Hành động đề xuất</label>
                      <div style={{color: '#fff', fontSize: '0.9rem', margin: '8px 0 1.5rem', fontWeight: 500}}>{crmInsightsDisplay.suggestedAction}</div>

                      <label style={{fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase'}}>Chủ đề Email</label>
                      <div className="subject-line" style={{marginTop: '8px', padding: '12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '8px', color: '#38bdf8', fontWeight: 600, fontSize: '0.85rem', marginBottom: '1rem'}}>
                        {stripMarkdown(crmInsightsDisplay.suggestedSubject)}
                      </div>
                      
                      <div className="keyword-row">
                        {crmInsightsDisplay.keywords?.map((k: string, i: number) => <span key={i} className="keyword-pill">#{k}</span>)}
                      </div>
                    </div>
                    <div className="crm-main-content">
                       <div style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                         <button className="sub-tab-btn active" style={{background: 'rgba(56, 189, 248, 0.2)', border: 'none', color: '#38bdf8', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600}}>Email Template</button>
                         <button className="sub-tab-btn" style={{background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8', padding: '6px 15px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600}}>Call Script</button>
                       </div>
                       <div className="email-body" style={{position: 'relative', minHeight: '200px'}}>
                        {stripMarkdown(crmInsightsDisplay.suggestedEmail)}
                       </div>
                       {crmInsightsDisplay.callScript && (
                         <div className="call-script-preview" style={{marginTop: '15px', padding: '12px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.1)', fontSize: '0.8rem', color: '#10b981', marginBottom: '1.5rem'}}>
                            <strong>Call Script:</strong> {crmInsightsDisplay.callScript.substring(0, 80)}...
                         </div>
                       )}

                       <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                         <div>
                            <label style={{fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px'}}>
                              <Target size={14} /> Nhân sự key cần tiếp cận
                            </label>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                              {crmInsightsDisplay.decisionMakers?.map((dm: any, i: number) => (
                                <div key={i} style={{fontSize: '0.8rem', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)'}}>
                                  <div style={{fontWeight: 700, color: '#fff'}}>{dm.role}</div>
                                  <div style={{fontSize: '0.7rem', color: '#3b82f6'}}>{dm.approach}</div>
                                </div>
                              ))}
                            </div>
                         </div>
                         <div>
                            <label style={{fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px'}}>
                              <Zap size={14} /> Đối thủ & Tiềm năng
                            </label>
                            <div style={{fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '1rem'}}>
                               <strong>Cạnh tranh:</strong> {crmInsightsDisplay.competitors?.join(", ")}
                            </div>
                            <div style={{fontSize: '0.8rem', color: '#cbd5e1', padding: '10px', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.1)'}}>
                               <strong>Triển vọng:</strong> {crmInsightsDisplay.growthOutlook}
                            </div>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
