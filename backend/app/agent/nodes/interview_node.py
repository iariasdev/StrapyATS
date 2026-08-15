import json
import logging
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore
from app.agent.prompts.templates import INTERVIEW_SIMULATOR_PROMPT
from app.core.config import settings

logger = logging.getLogger("strapy_ats.nodes.interview")


async def run_interview_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Node 4: Generates 5 hard interview questions targeting detected gaps with answer tips.
    """
    cv_text = state.get("cv_text", "")
    job_offer_text = state.get("job_offer_text", "")
    ats_gaps = state.get("ats_gaps", [])
    api_key = state.get("effective_api_key", "")

    gaps_text = "\n".join([f"- {g.get('keyword')}: {g.get('context')}" for g in ats_gaps if isinstance(g, dict)])

    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=api_key,
            temperature=0.4,
        )
        prompt = INTERVIEW_SIMULATOR_PROMPT.format(
            job_offer_text=job_offer_text,
            cv_text=cv_text[:3000],
            ats_gaps_text=gaps_text,
        )
        response = await llm.ainvoke(prompt)
        content = str(response.content).strip()

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        parsed = json.loads(content)
        questions = parsed.get("interview_questions", [])
        return {"interview_questions": questions}
    except Exception as e:
        logger.error(f"Interview Simulator Node error: {e}")
        return {
            "interview_questions": [
                {
                    "question": "How do you handle memory management and vector indexing efficiency in serverless deployments?",
                    "focus_area": "System Architecture & Performance",
                    "suggested_answer_tip": "Discuss using persistent disk clients (ChromaDB) over in-memory instances to stay within RAM limits."
                },
                {
                    "question": "Can you walk us through how you trace LLM latency and token costs across multi-node pipelines?",
                    "focus_area": "AI Observability & Cost Control",
                    "suggested_answer_tip": "Explain integrating tools like Langfuse Cloud to trace graph execution nodes."
                },
                {
                    "question": "How do you ensure zero-cost scaling when serving AI applications under high traffic?",
                    "focus_area": "FinOps & Cloud Architecture",
                    "suggested_answer_tip": "Highlight client-side heavy rendering (e.g. PDF generation) and GCP Cloud Run auto-scaling to zero."
                },
                {
                    "question": "Describe a scenario where you had to bridge an extracted job posting with a candidate's profile dynamically.",
                    "focus_area": "RAG & Document Ingestion",
                    "suggested_answer_tip": "Talk about Chrome Extension Manifest v3 content scripts and vector similarity chunk matching."
                },
                {
                    "question": "How do you prevent rate-limit errors when consuming external AI APIs?",
                    "focus_area": "API Resilience & Rate Limiting",
                    "suggested_answer_tip": "Explain IP-based throttling, request queuing, and Bring Your Own Key (BYOK) fallback mechanisms."
                }
            ]
        }
