# AutoPitch AI: RAG-Powered B2B Sales Agent 🚀

AutoPitch AI is an end-to-end, automated outbound sales engine. It takes a prospect's company URL, invisibly scrapes their recent website data bypassing anti-bot measures, vectorizes the context, and uses a Retrieval-Augmented Generation (RAG) pipeline to draft hyper-personalized, high-converting cold emails.

## 🧠 System Architecture



The system is split into a modular backend and frontend, designed for scalability:

1. **The Scraper (Data Ingestion):** Utilizes `playwright-stealth` to launch an invisible headless Chromium browser, bypassing Cloudflare/DataDome bot protections to extract raw HTML from modern dynamic websites (React/Next.js).
2. **The Memory (Vector Database):** Text chunks are passed through Google's `gemini-embedding-001` model to generate 768-dimensional vectors, which are stored and indexed in **Pinecone**.
3. **The Brain (LLM Generation):** When generating an email, the system queries Pinecone for the most relevant company news or product updates, injecting them as context into **Gemini 2.5 Flash** to write a highly targeted, non-generic opening hook.
4. **The Interface (React & FastAPI):** A lightning-fast React frontend communicates with a Python/FastAPI backend, storing generated drafts and pipeline analytics in a localized SQLite/PostgreSQL database using SQLAlchemy.

## 🛠️ Tech Stack

**AI & Machine Learning:**
* **LLM:** Google Gemini 2.5 Flash (`google-genai` SDK)
* **Embeddings:** Gemini Embedding-001
* **Vector DB:** Pinecone (Serverless)
* **Data Extraction:** Playwright (Stealth Mode) + BeautifulSoup4

**Backend:**
* **Framework:** FastAPI (Python 3.11)
* **ORM/Database:** SQLAlchemy + SQLite (Designed to scale to PostgreSQL)
* **Environment:** Venv

**Frontend:**
* **Framework:** React + Vite
* **Styling:** Modern CSS (Custom SaaS UI)
* **HTTP Client:** Axios

## ⚙️ Local Setup & Installation

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/AutoPitch-AI.git](https://github.com/yourusername/AutoPitch-AI.git)
cd AutoPitch-AI
