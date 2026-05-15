
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

try:
    print("--- Testing Company Table ---")
    res = supabase.table("company").select("*").limit(1).execute()
    if res.data:
        print("Success! Sample data:")
        print(res.data[0])
    else:
        print("Table 'company' is EMPTY.")
        
    print("\n--- Testing Relationship ---")
    res_rel = supabase.table("company").select("*, nganh_nghe(ten_nganh)").limit(1).execute()
    print("Relationship check success!")
except Exception as e:
    print(f"Error during check: {e}")
