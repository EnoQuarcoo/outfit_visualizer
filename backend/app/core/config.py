import os
from dotenv import load_dotenv

load_dotenv()

MAILERLITE_API_KEY = os.getenv("MAILERLITE_API_KEY")
VIRLO_API_KEY = os.getenv("VIRLO_API_KEY")
campaign_id = os.getenv("campaign_id")
