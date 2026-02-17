from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models import models

router = APIRouter()

@router.get("/summary")
def get_analytics_summary(db: Session = Depends(get_db)):
    """Fetches high-level stats for the React frontend dashboard."""
    
    # 1. Total prospects
    total_prospects = db.query(models.Prospect).count()
    
    status_counts = db.query(
        models.EmailLog.status, 
        func.count(models.EmailLog.id)
    ).group_by(models.EmailLog.status).all()
    
   
    stats = {status: count for status, count in status_counts}
    
    return {
        "status": "success",
        "data": {
            "total_prospects": total_prospects,
            "pipeline_stats": {
                "drafts": stats.get("draft", 0),
                "sent": stats.get("sent", 0),
                "opened": stats.get("opened", 0),
                "replied": stats.get("replied", 0)
            }
        }
    }