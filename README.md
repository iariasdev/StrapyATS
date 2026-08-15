# StrapyATS 🎯
> **Optimize your CV for any job offer in seconds — powered by AI.**
> Powered by CierraLab

## 🧠 What it does
1. ATS Match Score (0-100%)
2. ATS Keyword Gap Audit
3. Rewritten CV (PDF) — downloaded from the browser, zero server cost
4. Custom Cover Letter
5. Interview Simulator (5 hard questions based on your gaps)

## 🏗️ Architecture
```
StrapyATS/
├── backend/          # FastAPI Python 3.11+ (GCP Cloud Run + Docker)
│   └── app/
│       ├── api/routes/     # REST endpoints
│       ├── core/           # Config, settings, .env
│       ├── models/         # Pydantic schemas
│       ├── services/       # PDF parsing, web scraping
│       ├── agent/          # LangGraph multi-node agent
│       │   ├── nodes/      # match, audit, rewrite, interview
│       │   └── prompts/    # LLM prompt templates
│       ├── vectorstore/    # ChromaDB PersistentClient
│       └── utils/
├── frontend/         # Next.js 14 App Router + TypeScript + Tailwind (Vercel)
│   └── src/
│       ├── app/
│       ├── components/ui/
│       └── lib/
├── chrome-extension/ # Manifest v3 — 1-click LinkedIn/GetOnBoard scraper
│   └── src/
│       ├── content_script.js
│       ├── popup.html
│       └── background.js
└── docs/
```

## 🚀 Tech Stack
| Layer | Technology |
| :--- | :--- |
| Backend | FastAPI Python 3.11, Pydantic v2 |
| AI Orchestration | LangGraph (multi-node deterministic agent) |
| Vector Store (RAG) | ChromaDB PersistentClient (disk, ~50MB RAM) |
| LLM | Google Gemini Flash (1M tokens/day free) |
| Observability | Langfuse Cloud (50k traces/month free) |
| Frontend | Next.js 14 + TypeScript + Tailwind CSS |
| PDF | Client-side react-to-pdf / @media print |
| Extension | Chrome Manifest v3 content_script DOM extractor |
| Deploy Backend | GCP Cloud Run + Docker (2M req/month free) |
| Deploy Frontend | Vercel Hobby (free) |

## 🔐 API Keys — Never expose them
```bash
cp backend/.env.example backend/.env
```

## 🏃 Run Locally
```bash
# Backend
cd backend && python -m venv venv && venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev
```

## 💰 Cost: $0/month
Built by @realstrapy — Powered by CierraLab.
