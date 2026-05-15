"""
crm_b2b_agent.py — Pipeline xử lý email B2B tự động.
"""

import os
import re
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

# 70B cho chất lượng viết lách (Tạm thời chuyển sang 8B để tránh lỗi Rate Limit TPD)
premium_llm = LLM(
    model="groq/llama-3.1-8b-instant",
    api_key=GROQ_API_KEY,
    temperature=0.1
)

logger = setup_agent_logger("crm_b2b")

# 2. Tools
@tool("search_database")
def search_database(query: str) -> str:
    """Tra cứu thông tin chi tiết của một doanh nghiệp từ Database nội bộ bằng MST hoặc Tên."""
    if not supabase: return "Lỗi kết nối Database."
    q = (query or "").strip()
    
    # Extract MST using regex (10 digits or 10 digits + 3 digits)
    import re
    mst_match = re.search(r'\b\d{10}(?:-\d{3})?\b', q)
    if mst_match:
        q = mst_match.group(0)
    else:
        # Làm sạch query nếu không có MST rõ ràng
        q = q.replace("(", "").replace(")", "").replace('"', '').replace("'", "").strip()
        if "MST:" in q:
            mst_part = q.split("MST:")[1].strip().split()[0].split(",")[0]
            q = mst_part if mst_part else q
    
    try:
        # Nếu q là chuỗi số (MST) hoặc có dạng MST 13 số
        if q.replace('-', '').isdigit() and len(q.replace('-', '')) >= 10:
            res = supabase.table("company").select("*, nganh_nghe(ten_nganh)").eq("ma_so_thue", q).limit(1).execute()
        else:
            res = supabase.table("company").select("*, nganh_nghe(ten_nganh)").ilike("ten_cong_ty", f"%{q}%").limit(3).execute()
            
        if not res.data: return f"Không tìm thấy doanh nghiệp với từ khóa: {q}"
        return str(res.data)
    except Exception as e:
        return f"Lỗi DB: {str(e)}"

@tool("search_internet")
def search_internet(query: str) -> str:
    """Tìm kiếm tin tức, profile và thông tin mới nhất của doanh nghiệp trên Web."""
    try:
        from duckduckgo_search import DDGS
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=2))
            if not results: return "Không tìm thấy kết quả trên Internet."
            return "\n\n".join([f"Title: {r.get('title')}\nSnippet: {r.get('body')[:150]}" for r in results])
    except Exception as e:
        return f"Lỗi tìm kiếm Web: {str(e)}"

# 3. Pipeline Function
@retry_with_backoff(max_retries=10, base_delay=8.0, logger=logger)
def run_b2b_crm(input_data: Union[str, dict]) -> dict:
    """Chạy CRM B2B pipeline nâng cao với phân tích mô hình kinh doanh."""
    text_content = f"Dữ liệu: {input_data}" if isinstance(input_data, dict) else str(input_data)

    classifier = Agent(
        role="Intent Classifier",
        goal="Xác định ý định khách hàng và MST/Tên DN.",
        backstory="Bạn là chuyên gia phân tích intent. Bạn trích xuất MST hoặc Tên DN cực kỳ chính xác.",
        verbose=True,
        llm=fast_llm,
        max_iter=2
    )

    analyst = Agent(
        role="Database Researcher",
        goal="Trích xuất thông tin doanh nghiệp chính xác từ Database.",
        backstory="Bạn là chuyên gia truy vấn dữ liệu. Bạn CHỈ được phép sử dụng công cụ 'search_database'. KHÔNG ĐƯỢC dùng bất kỳ công cụ nào khác.",
        verbose=True,
        llm=fast_llm,
        tools=[search_database],
        max_iter=2
    )

    bi_analyst = Agent(
        role="Business Intelligence Analyst",
        goal="Phân tích sâu về DN từ Internet.",
        backstory="Bạn là chuyên gia phân tích thị trường. Bạn CHỈ được phép sử dụng công cụ 'search_internet'. KHÔNG ĐƯỢC gọi 'brave_search' hay bất kỳ công cụ nào khác.",
        verbose=True,
        llm=premium_llm,
        tools=[search_internet],
        max_iter=2
    )

    writer = Agent(
        role="B2B Response Writer",
        goal="Soạn email phản hồi và báo cáo tóm tắt chuyên nghiệp.",
        backstory="Bạn soạn email B2B lịch sự và báo cáo tóm tắt kinh doanh rõ ràng.",
        verbose=True,
        llm=premium_llm,
        max_iter=2
    )

    task1 = Task(
        description=f"Phân tích intent và MST/Tên DN từ nội dung: {text_content}",
        expected_output="JSON chứa intent và entity.",
        agent=classifier
    )

    task2 = Task(
        description="""Dùng kết quả Task 1 (MST hoặc Tên DN), gọi tool search_database. 
        PHẢI trích xuất đầy đủ các trường thông tin sau từ kết quả trả về:
        - Mã số thuế
        - Tên doanh nghiệp đầy đủ
        - Địa chỉ đầy đủ
        - Ngày thành lập
        - Số điện thoại và Email (nếu có)
        - Ngành nghề kinh doanh chính
        Thông tin này là cực kỳ quan trọng để làm báo cáo profile doanh nghiệp.""",
        expected_output="Toàn bộ thông tin pháp lý và liên hệ của doanh nghiệp tìm thấy trong database.",
        agent=analyst,
        context=[task1]
    )

    task3 = Task(
        description="Dựa trên profile DN từ Task 2, hãy dùng search_internet ĐÚNG MỘT LẦN DUY NHẤT để tìm tổng hợp: Lĩnh vực, Sản phẩm, Đối tượng khách hàng.",
        expected_output="Mô tả chi tiết về hoạt động kinh doanh (3-5 câu).",
        agent=bi_analyst,
        context=[task2]
    )

    task4 = Task(
        description="""Tổng hợp dữ liệu từ Task 2 và Task 3 để soạn báo cáo B2B.""",
        expected_output="""Báo cáo tổng hợp B2B chi tiết theo cấu trúc (KHÔNG dùng in đậm **):
        1. [BUSINESS_PROFILE]: Liệt kê MST, Tên đầy đủ, Địa chỉ, Ngày thành lập, và Ngành nghề kinh doanh từ dữ liệu gốc.
        2. [EMAIL_SUBJECT]: Tiêu đề email cá nhân hóa.
        3. [EMAIL_BODY]: Nội dung email chuyên nghiệp, lồng ghép giải pháp dựa trên ngành nghề.
        4. [CALL_SCRIPT]: Kịch bản gọi điện (3-5 câu).
        5. [DECISION_MAKERS]: 2-3 vị trí key và góc độ tiếp cận.
        6. [COMPETITORS]: Danh sách đối thủ tiềm năng.
        7. [GROWTH_OUTLOOK]: Đánh giá triển vọng dựa trên ngành nghề.""",
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
    
    # Parser thông minh để trích xuất các mục
    def extract_section(tag, text):
        pattern = f"\\[{tag}\\]:(.*?)(?=\\[|$)"
        match = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
        return match.group(1).strip() if match else ""

    subject = extract_section("EMAIL_SUBJECT", sanitized)
    email_body = extract_section("EMAIL_BODY", sanitized)
    call_script = extract_section("CALL_SCRIPT", sanitized)
    competitors_raw = extract_section("COMPETITORS", sanitized)
    outlook = extract_section("GROWTH_OUTLOOK", sanitized)
    dm_raw = extract_section("DECISION_MAKERS", sanitized)

    # Xử lý Decision Makers thành List object
    decision_makers = []
    for line in dm_raw.split("\n"):
        if "-" in line:
            parts = line.split("-")
            decision_makers.append({"role": parts[0].strip(" •-"), "approach": parts[1].strip()})
    
    # Giả định trích xuất dữ liệu từ task output (trong thực tế cần parse kỹ hơn từ task2)
    # Lấy thông tin thô từ Task 2 hoặc kết quả tổng
    company_data = {} 
    try:
        raw_db = str(task2.output.raw)
        data_list = json.loads(raw_db.replace("'", '"')) if "[" in raw_db else {}
        company_data = data_list[0] if isinstance(data_list, list) and len(data_list) > 0 else {}
    except:
        company_data = {}

    inferred_sector = company_data.get("nganh_nghe", {}).get("ten_nganh", "Đang cập nhật")
    risk_level = "Thấp"

    return {
        "research": {
            "legalForm": "Doanh nghiệp",
            "inferredSector": inferred_sector,
            "profileBullets": [
                f"Mã số thuế: {company_data.get('ma_so_thue')}",
                f"Tên: {company_data.get('ten_cong_ty')}",
                f"Địa chỉ: {company_data.get('dia_chi')}",
                f"Ngày thành lập: {company_data.get('ngay_thanh_lap', 'N/A')}",
                f"Số điện thoại: {company_data.get('so_dien_thoai', 'N/A')}",
                f"Ngành nghề: {inferred_sector}"
            ]
        },
        "report": {"summary": str(result)},
        "crm_insights": {
            "riskLevel": risk_level,
            "strategicPotential": "Cao" if "High" in str(result) else "Trung bình",
            "suggestedAction": "Tiếp cận qua Email/Điện thoại" if risk_level == "Thấp" else "Kiểm tra kỹ thông tin pháp lý",
            "suggestedSubject": subject or "Cơ hội hợp tác kinh doanh chiến lược",
            "suggestedEmail": email_body or sanitized,
            "callScript": call_script,
            "competitors": [c.strip() for c in competitors_raw.split(",")] if competitors_raw else [],
            "growthOutlook": outlook,
            "decisionMakers": decision_makers,
            "keywords": [inferred_sector, "B2B", "Vietnam"]
        }
    }
