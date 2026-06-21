import os 
from dotenv import load_dotenv 

load_dotenv() 

SUPABASE_URL = os.getenv("SUPABASE_API_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")