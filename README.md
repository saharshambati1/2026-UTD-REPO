# ConnectEDU / Folia API

ConnectEDU is an AI-powered platform built for tomorrow's founders. It provides a comprehensive suite of tools to help entrepreneurs move from idea to execution with the help of RAG (Retrieval-Augmented Generation) based intelligence.

## 🚀 Features

- **20-Week Roadmaps**: Generate customized, actionable plans to guide your startup's growth.
- **RAG Advisor**: Get intelligent advice and simulations powered by your own data and industry playbooks.
- **Investor & Co-founder Matching**: Get warm introductions to the right people to help your startup succeed.
- **Startup Comparisons**: Compare your startup against industry templates to identify gaps and opportunities.
- **Research Lab**: Deep dive into market data and technical research.

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Styling**: Custom CSS with a focus on an "Academic Parchment" aesthetic.
- **Authentication**: NextAuth.js
- **Database Client**: Supabase SSR

### Backend (Folia API)
- **Framework**: FastAPI
- **AI/ML**: OpenAI, LangChain
- **Database**: Supabase (PostgreSQL)
- **Cache**: Redis
- **Task Queue**: Celery (with Redis)

## 📁 Repository Structure

- `/frontend`: Next.js application.
- `/backend`: FastAPI service.
    - `/backend/routers`: API endpoints for various features.
    - `/backend/services`: Core business logic and integrations.
    - `/backend/core`: Configuration, database, and authentication setup.
    - `/backend/RAG`: Retrieval-Augmented Generation logic.

## ⚙️ Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```
3. Create a `.env` file based on the configuration in `backend/core/config.py` and provide necessary API keys (Supabase, OpenAI, Redis, etc.).
4. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with necessary environment variables (Supabase URL/Key, NextAuth secret, etc.).
4. Start the development server:
   ```bash
   npm run dev
   ```

## 👥 Team
Saharsh, Ridham, Jai, Adit (UTD 2026 Hackathon)
