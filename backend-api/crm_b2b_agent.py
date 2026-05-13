"""
crm_b2b_agent.py — Pipeline xử lý email B2B tự động.
"""

import os
from typing import Union
from crewai import Agent, Crew, Process, Task, LLM
from crewai.tools import tool
from dotenv import load_dotenv

from agent_utils import (
    retry_with_backoff,
    validate_crm_output,
    setup_agent_logger,
)
from database import supabase

# 1. Cấu hình
load_dotenv()
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise EnvironmentError("Thiếu GROQ_API_KEY.")

# Khởi tạo các LLM với mục đích khác nhau
# 8B cho tốc độ và tiết kiệm Rate Limit
fast_llm = LLM(
    model="groq/llama-3.1-8b-instant",
    api_key=GROQ_API_KEY,
    temperature=0.0
)

# 70B cho chất lượng viết lách
premium_llm = LLM(
    model="groq/llama-3.3-70b-versatile",
    api_key=GROQ_API_KEY,
    temperature=0.1
)

logger = setup_agent_logger("crm_b2b")

# 2. Tools - Đổi tên thành CamelCase để ổn định trên Groq
@tool("searchCrmDatabase")
def searchCrmDatabase(query: str) -> str:
    """Truy vấn CSDL doanh nghiệp nội bộ để lấy thông tin chi tiết (bao gồm cả ngành nghề)."""
    if not supabase: return "Lỗi kết nối Supabase."
    q = (query or "").strip()
    # Làm sạch query: Trích xuất MST hoặc tên thực tế
    q = q.replace("(", "").replace(")", "").strip()
    if "MST:" in q:
        # Lấy phần số sau "MST:"
        mst_part = q.split("MST:")[1].strip().split()[0].split(",")[0]
        q = mst_part if mst_part else q
    
    try:
        if q.isdigit():
            # Join với bảng nganh_nghe để lấy tên ngành
            res = supabase.table("company").select("*, nganh_nghe(ten_nganh)").eq("ma_so_thue", q).limit(1).execute()
        else:
            res = supabase.table("company").select("*, nganh_nghe(ten_nganh)").ilike("ten_cong_ty", f"%{q}%").limit(3).execute()
            
        if not res.data: return f"Không tìm thấy doanh nghiệp: {q}"
        return str(res.data)
    except Exception as e:
        return f"Lỗi DB: {str(e)}"

# 3. Pipeline Function
@retry_with_backoff(max_retries=3, base_delay=2.0, logger=logger)
def run_b2b_crm(input_data: Union[str, dict]) -> dict:
    """Chạy CRM B2B pipeline nâng cao với phân tích mô hình kinh doanh."""
    text_content = f"Dữ liệu: {input_data}" if isinstance(input_data, dict) else str(input_data)

    classifier = Agent(
        role="Intent Classifier",
        goal="Xác định ý định khách hàng và MST/Tên DN.",
        backstory="Bạn là chuyên gia phân tích intent. Bạn trích xuất MST hoặc Tên DN cực kỳ chính xác.",
        verbose=True,
        llm=fast_llm,
        max_iter=3
    )

    analyst = Agent(
        role="CRM Data Analyst",
        goal="Tra cứu thông tin DN bằng công cụ searchCrmDatabase.",
        backstory="Bạn sử dụng công cụ searchCrmDatabase để lấy profile và ngành nghề từ database.",
        verbose=True,
        llm=fast_llm,
        tools=[searchCrmDatabase],
        max_iter=3
    )

    bi_analyst = Agent(
        role="Business Intelligence Analyst",
        goal="Phân tích sâu về mô hình kinh doanh, sản phẩm và dịch vụ của DN.",
        backstory="Bạn là chuyên gia về thị trường Việt Nam. Từ Tên DN và Ngành nghề, bạn xác định rõ họ kinh doanh cái gì.",
        verbose=True,
        llm=fast_llm,
        max_iter=3
    )

    writer = Agent(
        role="B2B Response Writer",
        goal="Soạn email phản hồi và báo cáo tóm tắt chuyên nghiệp.",
        backstory="Bạn soạn email B2B lịch sự và báo cáo tóm tắt kinh doanh rõ ràng.",
        verbose=True,
        llm=premium_llm,
        max_iter=3
    )

    task1 = Task(
        description=f"Phân tích intent và MST/Tên DN từ nội dung: {text_content}",
        expected_output="JSON chứa intent và entity.",
        agent=classifier
    )

    task2 = Task(
        description="Dùng kết quả Task 1, gọi searchCrmDatabase để lấy profile chi tiết.",
        expected_output="Dữ liệu doanh nghiệp và tên ngành nghề.",
        agent=analyst,
        context=[task1]
    )

    task3 = Task(
        description="Dựa trên profile DN, hãy phân tích: 1. Lĩnh vực hoạt động chính. 2. Các sản phẩm/dịch vụ cốt lõi. 3. Đối tượng khách hàng mục tiêu.",
        expected_output="Mô tả chi tiết về hoạt động kinh doanh (3-5 câu).",
        agent=bi_analyst,
        context=[task2]
    )

    task4 = Task(
        description="Tổng hợp dữ liệu và soạn email phản hồi (không in đậm **). Email phải thể hiện được sự hiểu biết về lĩnh vực kinh doanh của họ.",
        expected_output="Email và Báo cáo tóm tắt.",
        agent=writer,
        context=[task2, task3]
    )

    crew = Crew(
        agents=[classifier, analyst, bi_analyst, writer],
        tasks=[task1, task2, task3, task4],
        process=Process.sequential,
        verbose=True,
        memory=False
    )

    result = crew.kickoff()
    validation = validate_crm_output(str(result))
    sanitized = validation["sanitized"]
    
    # Cố gắng trích xuất thông tin ngành từ nội dung (hoặc để mặc định nếu không thấy)
    inferred_sector = "Đang xác định"
    if "Lĩnh vực:" in sanitized:
        parts = sanitized.split("Lĩnh vực:")
        if len(parts) > 1: inferred_sector = parts[1].split("\n")[0].strip()

    return {
        "research": {
            "legalForm": "Doanh nghiệp",
            "inferredSector": inferred_sector,
            "profileBullets": [
                "Phân tích chuyên sâu mô hình kinh doanh",
                "Xác định sản phẩm & dịch vụ cốt lõi",
                "Đánh giá đối tượng khách hàng mục tiêu"
            ]
        },
        "report": {"summary": sanitized},
        "crm_insights": {
            "riskLevel": "Thấp",
            "suggestedSubject": "Cơ hội hợp tác kinh doanh chiến lược",
            "suggestedEmail": sanitized,
            "keywords": ["Business Intelligence", "B2B CRM", "Market Insights"]
        }
    }
