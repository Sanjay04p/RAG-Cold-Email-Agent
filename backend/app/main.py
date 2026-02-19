from fastapi import FastAPI
from app.core.config import settings
from app.core.database import engine
from app.models import models  
from app.api.v1.endpoints import prospects, research, analytics, auth
# Create the database tables
from fastapi.middleware.cors import CORSMiddleware
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], # React's default ports
    allow_credentials=True,
    allow_methods=["*"], # Allow GET, POST, PUT, DELETE
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Cold Email AI is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

app.include_router(prospects.router, prefix="/api/v1/prospects", tags=["prospects"])
app.include_router(research.router, prefix="/api/v1/research", tags=["research"]) 
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])