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



## Live Demo
https://github.com/user-attachments/assets/fb6b1c87-6d69-40cc-a4fb-de3d9c96417a



## ⚙️ Local Setup & Installation

### Clone the Repository
```bash
git clone [https://github.com/yourusername/AutoPitch-AI.git](https://github.com/yourusername/AutoPitch-AI.git)
cd AutoPitch-AI
