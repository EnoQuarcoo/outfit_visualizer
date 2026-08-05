from fastapi import APIRouter, Header, HTTPException, Request
from app.config import REVENUECAT_WEBHOOK_AUTH
from app.services.database import grant_paid_plan, revert_to_free_plan

router = APIRouter()

GRANT_EVENTS = {"INITIAL_PURCHASE", "RENEWAL"}
REVERT_EVENTS = {"EXPIRATION"}
# CANCELLATION is deliberately ignored — it only means auto-renew was turned
# off, the user keeps access until EXPIRATION actually fires at period end.


@router.post("/webhooks/revenuecat")
async def revenuecat_webhook(request: Request, authorization: str = Header(None)):
    if authorization != REVENUECAT_WEBHOOK_AUTH:
        raise HTTPException(status_code=401, detail="Invalid authorization")

    payload = await request.json()
    event = payload.get("event", {})
    event_type = event.get("type")
    user_id = event.get("app_user_id")

    if event_type in GRANT_EVENTS:
        grant_paid_plan(user_id)
    elif event_type in REVERT_EVENTS:
        revert_to_free_plan(user_id)

    return {"status": "ok"}
