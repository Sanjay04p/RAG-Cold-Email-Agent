from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app import crud
from app.services.scraper import scraper
from app.services.llm_service import llm 
from app.services.vector_db import vector_db
from app.services.email_sender import email_sender
from app.models import models

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