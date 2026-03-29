# 🚀 ColdReach AI: LLM-Driven Cold Email Engine

An intelligent, full-stack B2B sales development platform that automates prospect research and generates hyper-personalized cold emails at scale. 

Built with **FastAPI**, **React**, and **Google Gemini**, ColdReach AI slashes the time SDRs spend researching leads by analyzing company data and drafting context-aware outreach that actually converts.

## ✨ Key Features
* **AI-Powered Personalization:** Integrates with the Gemini API to analyze prospect backgrounds and generate highly specific, non-generic opening lines.
* **Smart Web Intents (Firewall Bypass):** Utilizes secure Gmail deep-linking to execute email delivery directly from the user's authenticated browser, bypassing strict cloud provider SMTP port blocks.
* **Responsive Dashboard UI:** A mobile-optimized React interface for seamless management of prospects, email drafts, and outreach history.
* **Persistent Cloud Storage:** Fully integrated with a production PostgreSQL database for real-time state management and history tracking.

## 🛠️ Tech Stack & Architecture
* **Frontend:** React.js, Vite, Axios, Custom CSS (Fully Responsive)
* **Backend:** FastAPI, Python 3.12, SQLAlchemy, Pydantic
* **Database:** PostgreSQL (Hosted on Neon)
* **AI / NLP:** Google Gemini Generative AI, Pinecone (Vector Search)
* **Deployment & CI/CD:** Vercel (Frontend), Render (Backend)

## 💡 Engineering Challenges & Solutions
**The Challenge:** Deploying a backend application on a free-tier cloud environment (Render) that strictly blocks outbound SMTP traffic (Ports 465/587) to prevent spam, making standard `smtplib` email delivery impossible.

**The Solution:** Instead of relying on expensive third-party APIs or premium server tiers, I re-architected the delivery flow to use **URL Web Intents**. The FastAPI backend generates the personalized payload and sends it to the React frontend, which constructs an encoded Gmail compose URL. This offloads the actual sending action to the user's local, authenticated browser, guaranteeing 100% deliverability with zero infrastructure cost.

## 🏗️ System Architecture

This pipeline automates hyper-personalized outreach by combining live web scraping with Retrieval-Augmented Generation (RAG).

<img width="1895" height="562" alt="image" src="https://github.com/user-attachments/assets/a9291bf0-2680-4d8c-9780-ffc6e8a1047d" />

* **Lead Context Engine:** Uses `BeautifulSoup` and `Playwright` to scrape prospect websites or profiles in real-time to extract pain points and company context.
* **Product Knowledge DB:** Stores the user's own product details, case studies, and value propositions in a `Pinecone` vector database.
* **Prompt Orchestration:** `LangChain` dynamically merges the scraped prospect data with retrieved product knowledge.
* **AI Generation:** Feeds the augmented context into the LLM to generate highly targeted, non-generic cold emails at scale.

## Live Demo
https://github.com/user-attachments/assets/fb6b1c87-6d69-40cc-a4fb-de3d9c96417a





## ⚙️ Local Setup & Installation

### Clone the Repository
```bash
git clone https://github.com/Sanjay04p/RAG-Cold-Email-Agent.git
cd RAG-Cold-Email-Agent
