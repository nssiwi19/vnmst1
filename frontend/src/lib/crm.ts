// frontend/src/lib/crm.ts

export const buildCrmInsight = (companyData: any, research: any, report: any, purpose: string) => {
  try {
    if (!research || !report) return null;

    if (research.crm_insights) {
       return research.crm_insights;
    }

    const isSales = purpose === 'sales';
    const isMarket = purpose === 'market_research';
    
    // Logic trích xuất thông tin sơ bộ từ report để làm nó sống động hơn
    const summary = report.summary || "";
    const riskLevel = summary.toLowerCase().includes("rủi ro") ? "Trung bình" : "Thấp";
    
    return {
      riskLevel: riskLevel,
      strategicPotential: isMarket ? "Cao" : "Tiềm năng",
      suggestedAction: isSales ? "Gửi email đề xuất giải pháp" : "Đặt lịch hẹn tư vấn chuyên sâu",
      suggestedSubject: isSales 
        ? `Cơ hội hợp tác chiến lược cùng ${companyData.name}` 
        : `Báo cáo thẩm định & Phân tích thị trường: ${companyData.name}`,
      suggestedEmail: `Kính gửi Ban lãnh đạo ${companyData.name},\n\nQua quá trình nghiên cứu dữ liệu thị trường và hoạt động của quý công ty, chúng tôi nhận thấy có những điểm giao thoa chiến lược có thể mang lại giá trị đột phá...\n\nTrân trọng,\nĐội ngũ E14CRM MCNA`,
      keywords: ["B2B Integration", "Strategic Growth", "Market Intel"],
      callScript: `Chào anh/chị, tôi gọi từ E14CRM. Chúng tôi vừa hoàn tất bản phân tích sâu về mô hình của ${companyData.name} và thấy có 3 điểm tối ưu có thể giúp tăng trưởng doanh thu...`,
      decisionMakers: [
        { role: "Giám đốc Vận hành (COO)", approach: "Tối ưu quy trình" },
        { role: "Trưởng phòng Thu mua", approach: "Hiệu quả chi phí" },
        { role: "Giám đốc Công nghệ (CTO)", approach: "Chuyển đổi số" }
      ],
      competitors: ["FPT Software", "Viettel Solutions", "CMC TS"],
      growthOutlook: "Dự báo tăng trưởng 15-20% trong năm tới nhờ mở rộng thị trường phía Nam."
    };
  } catch (error) {
    console.error("Error in buildCrmInsight:", error);
    return {
      riskLevel: "Không xác định",
      suggestedSubject: "Lỗi xử lý gợi ý",
      suggestedEmail: "Không thể tạo nội dung email lúc này.",
      keywords: ["Error"]
    };
  }
};
