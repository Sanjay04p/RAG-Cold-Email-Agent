from google import genai
from app.core.config import settings

# Initialize the Gemini client using the API key from your config
client = genai.Client(api_key=settings.GEMINI_API_KEY)

class LLMService:
    def generate_opening_line(self, prospect_name: str, company_name: str, scraped_context: str) -> str:
        """
        Uses Gemini to generate a hyper-personalized cold email opening line 
        based on the scraped website context.
        """
        
        prompt = f"""
        You are an expert B2B Sales Development Representative. 
        Write a single, highly personalized opening line for a cold email to {prospect_name} at {company_name}.
        
        Use the following recent information scraped from their company website:
        {scraped_context}
        
        CRITICAL RULES:
        1. Keep it under 2 sentences (Maximum 40 words).
        2. Do NOT use generic praise (e.g., "I love your work").
        3. Mention one specific fact, product, or news item from the context provided.
        4. Write it so it feels like the 3rd or 4th casual email you've sent today—peer-to-peer energy, not a vendor begging for attention.
        5. DO NOT include a greeting (like "Hi Name,") or a sign-off. Just the line itself.
        """
        
        try:
            # Using Gemini 2.5 Flash as it is optimized for speed and cost
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt
            )
            # The SDK uses response.text to easily access the generated string
            return response.text.strip()
            
        except Exception as e:
            print(f"Gemini Generation Error: {e}")
            return "I noticed your team is doing some interesting work lately." # Fallback line

llm = LLMService()