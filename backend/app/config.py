import os 
from dotenv import load_dotenv 

load_dotenv() 

SUPABASE_URL = os.getenv("SUPABASE_API_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")
REVENUECAT_WEBHOOK_AUTH = os.getenv("REVENUECAT_WEBHOOK_AUTH")