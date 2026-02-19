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
def send_approved_draft(email_log_id: int, db: Session = Depends(get_db)):
    email_log = db.query(models.EmailLog).filter(models.EmailLog.id == email_log_id).first()
    if not email_log:
        raise HTTPException(status_code=404, detail="Email draft not found")
        
    prospect = email_log.prospect
    
    full_body = f"{email_log.personalized_opening}\n\nI'd love to chat about how we can help {prospect.company_name} scale.\n\nBest,\nSanjay"
    subject = f"Quick question regarding {prospect.company_name}"
    
    success = email_sender.send_email(
        to_email=prospect.email,
        subject=subject,
        body=full_body
    )
    
    if success:
        email_log.status = "sent"
        email_log.full_body = full_body
        db.commit()
        return {"status": "success", "message": "Email sent and logged!"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email.")


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
def send_approved_email(email_log_id: int, request: EmailSendRequest, db: Session = Depends(get_db)):
    # 1. Find the draft in the database
    email_log = db.query(models.EmailLog).filter(models.EmailLog.id == email_log_id).first()
    if not email_log:
        raise HTTPException(status_code=404, detail="Draft not found")
        
    prospect = email_log.prospect
    
    # 2. Add an invisible tracking pixel to the bottom of the email (More on this below!)
    tracking_url = f"http://127.0.0.1:8000/api/v1/research/track/{email_log.id}.png"
    html_body = f"""
    <html>
      <body>
        <p>{request.edited_body.replace(chr(10), '<br>')}</p>
        <img src="{tracking_url}" width="1" height="1" style="display:none;"/>
      </body>
    </html>
    """

    # 3. Send the email using your SMTP service
    # (Make sure to update email_sender.py to accept HTML instead of plain text if you use this)
    success = email_sender.send_email(
        to_email=prospect.email,
        subject=request.subject,
        body=html_body # Send the HTML version for tracking
    )
    
    # 4. Update the database
    if success:
        email_log.status = "sent"
        email_log.full_body = request.edited_body
        db.commit()
        return {"status": "success", "message": "Email sent!"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send via SMTP.")

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

# 3. New Route: Send a manual email (without AI generation)
@router.post("/{prospect_id}/send-manual")
def send_manual_email(prospect_id: int, request: ManualEmailRequest, db: Session = Depends(get_db)):
    prospect = db.query(models.Prospect).filter(models.Prospect.id == prospect_id).first()
    if not prospect:
        raise HTTPException(status_code=404, detail="Prospect not found")
    
    # Save the manual message to the database
    new_log = models.EmailLog(
        prospect_id=prospect.id,
        personalized_opening="Manual Follow-up",
        full_body=request.body,
        status="sent"
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)

    # Convert line breaks to HTML for the email body
    html_body = f"<html><body><p>{request.body.replace(chr(10), '<br>')}</p></body></html>"
    
    # Send via SMTP
    success = email_sender.send_email(
        to_email=prospect.email, 
        subject=f"Following up regarding {prospect.company_name}", 
        body=html_body
    )
    
    if not success:
        new_log.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail="Failed to send SMTP email.")
        
    return {"status": "success", "message": "Manual email sent!"}