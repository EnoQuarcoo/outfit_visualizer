import os 
from dotenv import load_dotenv 

load_dotenv()

MAILERLITE_API_KEY = os.getenv("MAILERLITE_API_KEY")