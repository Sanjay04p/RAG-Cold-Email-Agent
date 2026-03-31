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
        You are an elite B2B Sales Development Representative. 
        Your objective is to write a single, highly personalized opening line for a cold email to {prospect_name} at {company_name}.
        
        Here is the intelligence gathered:
        <context>
        {scraped_context}
        </context>
        
        CRITICAL RULES:
        1. STRICT LENGTH: Maximum 2 sentences (Under 40 words).
        2. CONDITIONAL HOOK: If LinkedIn/personal data is available in the <context>, prioritize it (e.g., past role, location, transition). If only company data exists, pivot to recent company news or focus areas.
        3. ZERO FLUFF: Absolutely NO generic praise (e.g., "Impressive profile", "Love your work", "Hope you are doing well").
        4. SPECIFICITY: Mention exactly ONE specific fact from the <context>. Frame it as a casual observation, not a formal summary.
        5. TONE: Peer-to-peer energy. Confident and conversational. Do not sound like a vendor pitching.
        6. EXACT FORMAT: DO NOT include a greeting ("Hi {prospect_name},"). DO NOT include a sign-off. DO NOT wrap the output in quotation marks. Output ONLY the raw opening line.
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