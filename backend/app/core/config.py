import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Cold Email AI"
    API_V1_STR: str = "/api/v1"

    GEMINI_API_KEY: str = "GEMINI_API_KEY_PLACEHOLDER" 
    PINECONE_API_KEY: str = "PINECONE_API_KEY_PLACEHOLDER"
    DATABASE_URL: str = "sqlite:///./cold_email.db"
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "placeholder_user"
    SMTP_PASSWORD: str = "placeholder_pass"
    SECRET_KEY: str = "super_secret_temporary_key_for_portfolio"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    class Config:
        env_file = ".env"

settings = Settings()