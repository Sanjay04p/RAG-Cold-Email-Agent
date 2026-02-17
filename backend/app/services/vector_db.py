from google import genai
from google.genai import types
from pinecone import Pinecone, ServerlessSpec
from app.core.config import settings

# Initialize Gemini Client
ai_client = genai.Client(api_key=settings.GEMINI_API_KEY)

# Initialize Pinecone Client
pc = Pinecone(api_key=settings.PINECONE_API_KEY)
INDEX_NAME = "cold-email-rag"

class VectorDBService:
    def __init__(self):
        # Create the index in Pinecone if it doesn't exist yet
        existing_indexes = [index.name for index in pc.list_indexes()]
        if INDEX_NAME not in existing_indexes:
            print(f"Creating Pinecone Index: {INDEX_NAME}...")
            pc.create_index(
                name=INDEX_NAME,
                dimension=768, # We force Gemini to output 768 dimensions to optimize speed/cost
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
        # Connect to the index
        self.index = pc.Index(INDEX_NAME)

    def get_embedding(self, text: str) -> list[float]:
        """Converts text into a vector array using Gemini."""
        result = ai_client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=768)
        )
        return result.embeddings[0].values

    def store_company_data(self, prospect_id: int, company_name: str, scraped_text: str):
        """Generates an embedding and saves it to Pinecone with metadata."""
        
        # 1. Convert the text to a vector
        print(f"Generating embeddings for {company_name}...")
        vector = self.get_embedding(scraped_text)
        
        # 2. Store it in Pinecone
        print("Saving to Pinecone...")
        self.index.upsert(
            vectors=[
                {
                    "id": f"prospect_{prospect_id}",
                    "values": vector,
                    # We store the actual text as metadata so we can retrieve it later
                    "metadata": {"company": company_name, "text": scraped_text} 
                }
            ]
        )

    # ADD company_name to the parameters
    def search_company_data(self, query: str, company_name: str, top_k: int = 1) -> str:
        """
        Searches Pinecone for the most relevant chunk of text, 
        filtered ONLY for the specific company we are emailing.
        """
        print(f"Searching Pinecone for: '{query}' at {company_name}")
        
        query_vector = self.get_embedding(query)
        
        results = self.index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True,
            # THE FIX: This forces Pinecone to only look at this specific company's data
            filter={
                "company": {"$eq": company_name} 
            }
        )
        
        if results.matches:
            return results.matches[0].metadata.get("text", "")
            
        return ""

vector_db = VectorDBService()