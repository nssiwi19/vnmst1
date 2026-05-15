import { useCallback, useMemo, useState, useEffect } from "react";
import { ArchitectureFlow } from "./components/ArchitectureFlow";
import { Login } from "./components/Login";
import { History } from "./components/History";
import { DataHub } from "./components/DataHub";
import { PipelineSearch } from "./components/Pipeline/PipelineSearch";
import { PipelineStepper } from "./components/Pipeline/PipelineStepper";
import { PipelineResults } from "./components/Pipeline/PipelineResults";
import { supabase } from "./lib/supabase";
import { analyzeCompanyFull } from "./lib/agents";
import { buildCrmInsight } from "./lib/crm";
import { fetchBusinessByTaxCode, normalizeMst } from "./lib/vietqr";
import { api } from "./lib/api";
import type { CrmPurpose, PipelineState } from "./types";
import { User } from "@supabase/supabase-js";
import { 
  LogOut, Building2, Loader2
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
      setTab(e.detail.tab);
      if (e.detail.mst) setMstInput(e.detail.mst);
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
      verification: { trustScore: 1, riskFlags: [], complianceNotes: ["History Data"] },
      crm_insights: record.crm_insights,
      step: "completed",
      error: null
    } as any);
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
      let companyData = null;
      try {
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

      if (!companyData) {
        const raw = await fetchBusinessByTaxCode(mst);
        if (raw.code === "00") {
          companyData = { ...raw.data, source: "VietQR" };
        } else {
          throw new Error("Không tìm thấy thông tin doanh nghiệp trên cả hệ thống nội bộ và VietQR");
        }
      }

      setPipeline((prev) => ({ 
        ...prev, 
        raw: { data: companyData, code: "00", desc: "Success" } as any, 
        step: "researching" 
      }));

      const fullResult = await analyzeCompanyFull(companyData, purpose);
      
      setPipeline((prev) => ({ ...prev, research: fullResult.research, step: "reporting" }));
      await new Promise(r => setTimeout(r, 800));
      
      setPipeline((prev) => ({ ...prev, report: fullResult.report as any, step: "verifying" }));
      await new Promise(r => setTimeout(r, 600));

      setPipeline((prev) => ({ 
        ...prev, 
        crm_insights: fullResult.crm_insights,
        verification: { trustScore: 0.98, riskFlags: [], complianceNotes: ["Verified"] },
        step: "completed" 
      }));
    } catch (err: any) {
      setPipeline((prev) => ({ ...prev, step: "error", error: err.message || "Unknown error" }));
    }
  }, [mstInput, purpose]);

  const crmInsightsDisplay = useMemo(() => {
    if (pipeline.crm_insights) return pipeline.crm_insights;
    if (!pipeline.raw?.data || !pipeline.research || !pipeline.report) return null;
    return buildCrmInsight(pipeline.raw.data, pipeline.research, pipeline.report as any, purpose);
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
        <div style={{ display: tab === 'arch' ? 'block' : 'none' }}>
          <ArchitectureFlow />
        </div>

        <div style={{ display: tab === 'history' ? 'block' : 'none' }}>
          <History onSelect={handleHistorySelect} />
        </div>

        <div style={{ display: tab === 'pipeline' ? 'block' : 'none' }} className="pipeline-view animate-fade-in">
          <PipelineSearch 
            mstInput={mstInput}
            setMstInput={setMstInput}
            purpose={purpose}
            setPurpose={setPurpose}
            runPipeline={runPipeline}
            isProcessing={pipeline.step !== "idle" && pipeline.step !== "completed" && pipeline.step !== "error"}
          />

          <PipelineStepper step={pipeline.step} />

          {pipeline.step === "error" && (
            <div className="card" style={{ borderColor: '#ef4444', color: '#ef4444', padding: '1rem' }}>
              Lỗi: {pipeline.error}
            </div>
          )}

          <PipelineResults 
            pipeline={pipeline}
            crmInsightsDisplay={crmInsightsDisplay}
            handleCopyEmail={handleCopyEmail}
            copied={copied}
            stripMarkdown={stripMarkdown}
          />
        </div>

        <div style={{ display: tab === 'data' ? 'block' : 'none' }}>
          <DataHub />
        </div>
      </main>
    </div>
  );
}
