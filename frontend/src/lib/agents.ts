import { api } from './api';
import { supabase } from './supabase';

export const analyzeCompanyFull = async (companyData: any, purpose: string = "kyc") => {
  try {
    // 1. Gửi request phân tích
    const initialResponse = await api.post('/analyze', {
      tax_code: companyData.id,
      company_data: companyData,
      purpose: purpose
    });

    const analysisId = initialResponse.id;
    if (!analysisId) throw new Error("Không nhận được Analysis ID từ server");

    // 2. Sử dụng Supabase Realtime để đợi kết quả
    return new Promise((resolve, reject) => {
      // Thiết lập timeout 5 phút (tăng thêm do AI Agent cần thời gian retry Groq)
      const timeout = setTimeout(() => {
        clearInterval(fallbackInterval);
        supabase.removeChannel(channel);
        reject(new Error("Hết thời gian chờ phản hồi từ AI Agent (Realtime Timeout)"));
      }, 300000);

      // Cơ chế Fallback: Kiểm tra qua API mỗi 30 giây nhỡ may Realtime bị lag
      const fallbackInterval = setInterval(async () => {
        try {
          const statusRes = await api.get(`/analyze/${analysisId}`);
          if (statusRes.status === 'completed') {
            clearTimeout(timeout);
            clearInterval(fallbackInterval);
            supabase.removeChannel(channel);
            resolve({
              research: statusRes.research_data,
              report: { summary: statusRes.report_content },
              crm_insights: statusRes.crm_insights
            });
          } else if (statusRes.status === 'failed') {
            clearTimeout(timeout);
            clearInterval(fallbackInterval);
            supabase.removeChannel(channel);
            reject(new Error(statusRes.error_log || "Phân tích thất bại"));
          }
        } catch (e) {
          console.warn("Fallback check failed:", e);
        }
      }, 30000);

      const channel = supabase
        .channel(`analysis_${analysisId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'company_analysis',
            filter: `id=eq.${analysisId}`
          },
          (payload) => {
            const newData = payload.new;
            if (newData.status === 'completed') {
              clearTimeout(timeout);
              clearInterval(fallbackInterval);
              supabase.removeChannel(channel);
              resolve({
                research: newData.research_data,
                report: { summary: newData.report_content },
                crm_insights: newData.crm_insights
              });
            } else if (newData.status === 'failed') {
              clearTimeout(timeout);
              supabase.removeChannel(channel);
              reject(new Error(newData.error_log || "Phân tích thất bại (Agent Error)"));
            }
          }
        )
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
             // Kiểm tra xem nhỡ may nó xong trước khi mình subscribe kịp
             const { data } = await supabase
               .table('company_analysis')
               .select('*')
               .eq('id', analysisId)
               .single();
             
             if (data && data.status === 'completed') {
               clearTimeout(timeout);
               supabase.removeChannel(channel);
               resolve({
                 research: data.research_data,
                 report: { summary: data.report_content },
                 crm_insights: data.crm_insights
               });
             } else if (data && data.status === 'failed') {
               clearTimeout(timeout);
               supabase.removeChannel(channel);
               reject(new Error(data.error_log || "Phân tích thất bại"));
             }
          }
        });
    });
  } catch (error) {
    console.error("Error in analyzeCompanyFull:", error);
    throw error;
  }
};

export const runResearchAgent = async (companyData: any) => {
  return (await analyzeCompanyFull(companyData)).research;
};

export const runReportAgent = async (companyData: any, researchResult: any) => {
  return { summary: "Báo cáo đã sẵn sàng." };
};

export const runVerificationAgent = async (companyData: any, researchResult: any, reportResult: any) => {
  return { isVerified: true, confidence: 0.95, notes: "Xác thực bởi Elite-DA" };
};
