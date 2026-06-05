from app.core.config import VIRLO_API_KEY, campaign_id
import requests


def create_referrer(email, name):
    headers = {"x-api-key": VIRLO_API_KEY}
    payload = {
        "email": email,
        "name": name
    }
    try:
        response = requests.post(f"https://virlo-production.up.railway.app/campaigns/{campaign_id}/signup", 
                                 json=payload, 
                                 headers=headers
                                )
        return {'success': True, "data": response.json()}
    except Exception as e:
        print(f"Something broke:  {str(e)}")
        return {'success': False,
                "error": "Something went wrong. Please try again"}
        
