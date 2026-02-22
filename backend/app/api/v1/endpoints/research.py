from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app import crud
from app.services.scraper import scraper
from app.services.llm_service import llm 
from app.services.vector_db import vector_db
from app.services.email_sender import email_sender
from app.models import models
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.models import User
class EmailSendRequest(BaseModel):
    subject: str
    edited_body: str

router = APIRouter()

@router.post("/{prospect_id}/generate")
def generate_email_line(prospect_id: int, db: Session = Depends(get_db)):
    # 1. Get Prospect
    prospect = crud.get_prospect(db, prospect_id)
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")

    if not prospect.company_website:
        raise HTTPException(status_code=400, detail="No company website to scrape")

    url = prospect.company_website
    if not url.startswith("http"):
        url = "https://" + url

    # 2. Scrape Context
    print(f"Scraping {url}...")
    scraped_data = scraper.scrape_website(url)
    
    if not scraped_data:
        raise HTTPException(status_code=500, detail="Failed to scrape website.")

    # 3. RAG INGESTION: Store the data in Pinecone
    vector_db.store_company_data(
        prospect_id=prospect.id, 
        company_name=prospect.company_name, 
        scraped_text=scraped_data
    )

    # 4. RAG RETRIEVAL: Ask Pinecone for the best email hook
    search_query = "What is a recent company news, product launch, or key achievement?"
    
    
    retrieved_context = vector_db.search_company_data(
        query=search_query,
        company_name=prospect.company_name 
    )

    print("Generating personalized line with AI...")
    personalized_line = llm.generate_opening_line(
        prospect_name=prospect.first_name,
        company_name=prospect.company_name,
        scraped_context=retrieved_context or scraped_data 
    )

    # 5. Save to Database
    saved_email = crud.create_email_log(
        db=db, 
        prospect_id=prospect.id, 
        personalized_opening=personalized_line
    )

    return {
        "status": "success",
        "email_log_id": saved_email.id,
        "prospect": prospect.email,
        "rag_context_used": retrieved_context[:200] + "...",
        "generated_line": saved_email.personalized_opening
    }

@router.post("/send/{email_log_id}")
def send_approved_email(
    email_log_id: int, 
    request: dict, # Or your EmailSendRequest schema
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Check credentials FIRST
    if not current_user.smtp_email or not current_user.smtp_password:
        raise HTTPException(status_code=400, detail="Please configure your Gmail SMTP settings before sending emails.")

    email_log = db.query(models.EmailLog).filter(models.EmailLog.id == email_log_id).first()
    if not email_log:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    prospect = email_log.prospect
    edited_body = request.get("edited_body", "")
    subject = request.get("subject", "Quick question")
    html_body = f"<html><body><p>{edited_body.replace(chr(10), '<br>')}</p></body></html>"

    # 2. Attempt to send the email
    success = email_sender.send_email(
        to_email=prospect.email,
        subject=subject,
        body=html_body,
        sender_email=current_user.smtp_email,
        sender_password=current_user.smtp_password
    )
    
    # 3. ONLY update DB if the email successfully left the server
    if success:
        email_log.status = "sent"
        email_log.full_body = edited_body
        db.commit()
        return {"status": "success", "message": "Email sent!"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send via SMTP. Check your app password.")


@router.get("/{prospect_id}/drafts")
def get_prospect_drafts(prospect_id: int, db: Session = Depends(get_db)):
    """Fetches the most recent AI generated email for a prospect."""
    
    # Search the database for the newest email log linked to this prospect
    email_log = db.query(models.EmailLog).filter(
        models.EmailLog.prospect_id == prospect_id
    ).order_by(models.EmailLog.id.desc()).first()

    if not email_log:
        return {"has_draft": False}

    return {
        "has_draft": True,
        "email_log_id": email_log.id,
        "status": email_log.status,
        "personalized_opening": email_log.personalized_opening,
        "full_body": email_log.full_body
    }

  
@router.post("/send/{email_log_id}")
def send_approved_email(
    email_log_id: int, 
    request: dict, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    email_log = db.query(models.EmailLog).filter(models.EmailLog.id == email_log_id).first()
    if not email_log:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    edited_body = request.get("edited_body", "")

    # ONLY update the database. Do not use email_sender!
    email_log.status = "sent"
    email_log.full_body = edited_body
    db.commit()
    
    return {"status": "success", "message": "Email logged to history!"}

# 1. New Request Model for Manual Emails
class ManualEmailRequest(BaseModel):
    subject: str
    body: str

# 2. New Route: Fetch complete email history for the chat window
@router.get("/{prospect_id}/history")
def get_prospect_history(prospect_id: int, db: Session = Depends(get_db)):
    """Fetches all past emails (drafts and sent) for a prospect."""
    logs = db.query(models.EmailLog).filter(
        models.EmailLog.prospect_id == prospect_id
    ).order_by(models.EmailLog.id.asc()).all()
    
    return [
        {
            "id": log.id,
            "status": log.status,
            "body": log.full_body or log.personalized_opening
        } for log in logs
    ]



@router.post("/{prospect_id}/send-manual")
def send_manual_email(
    prospect_id: int, 
    request: ManualEmailRequest, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")

    # ONLY save to database. Do not use email_sender!
    new_log = models.EmailLog(
        prospect_id=prospect.id,
        personalized_opening="Manual Follow-up",
        full_body=request.body,
        status="sent"
    )
    db.add(new_log)
    db.commit()
    
    return {"status": "success", "message": "Manual email logged!"}