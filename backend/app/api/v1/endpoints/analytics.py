from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models import models

# NEW: Import the Bouncer
from app.core.security import get_current_user
from app.models.models import User

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- Added the Bouncer!
):
    """Fetches pipeline stats strictly for the logged-in user."""
    
    # 1. Count ONLY the prospects owned by this user
    total_prospects = db.query(models.Prospect).filter(
        models.Prospect.owner_id == current_user.id
    ).count()

    # 2. Count ONLY the emails linked to this user's prospects
    # We use .join() to connect the Email table to the Prospect table so we can check the owner_id
    sent_emails = db.query(models.EmailLog).join(models.Prospect).filter(
        models.Prospect.owner_id == current_user.id,
        models.EmailLog.status == "sent"
    ).count()

    draft_emails = db.query(models.EmailLog).join(models.Prospect).filter(
        models.Prospect.owner_id == current_user.id,
        models.EmailLog.status == "draft"
    ).count()

    return {
        "status": "success",
        "data": {
            "total_prospects": total_prospects,
            "pipeline_stats": {
                "sent": sent_emails,
                "drafts": draft_emails
            }
        }
    }