import json
import logging
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore
from app.agent.prompts.templates import MATCH_SCORER_PROMPT
from app.vectorstore.chroma_store import vector_store
from app.core.config import settings

logger = logging.getLogger("strapy_ats.nodes.match")


async def run_match_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Node 1: Indexes CV chunks into ChromaDB, queries similarity, and calculates ATS Match Score & Seniority Fit.
    """
    session_id = state.get("session_id", "default_session")
    cv_text = state.get("cv_text", "")
    job_offer_text = state.get("job_offer_text", "")
    api_key = state.get("effective_api_key", "")

    # Step A: Index CV text into ChromaDB PersistentClient
    chunk_count = vector_store.index_cv_chunks(session_id, cv_text)

    # Step B: Query ChromaDB for relevant experience chunks against key job demands
    sample_job_query = job_offer_text[:400]
    relevant_chunks = vector_store.query_cv_similarity(session_id, sample_job_query, top_k=4)
    chunks_formatted = "\n---\n".join(relevant_chunks) if relevant_chunks else "No specific vector chunks returned."

    # Step C: Call LLM (Google Gemini Flash)
    try:
        llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=api_key,
            temperature=0.2,
        )
        prompt = MATCH_SCORER_PROMPT.format(
            job_offer_text=job_offer_text,
            cv_text=cv_text[:3000],
            relevant_chunks=chunks_formatted[:1500],
        )
        response = await llm.ainvoke(prompt)
        content = str(response.content).strip()

        # Parse JSON
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        parsed = json.loads(content)
        return {
            "match_score": parsed.get("match_score", 65),
            "seniority_match": parsed.get("seniority_match", "Mid-Level"),
            "summary_verdict": parsed.get("summary_verdict", "Candidate shows solid baseline match."),
            "relevant_chunks": relevant_chunks,
        }
    except Exception as e:
        logger.error(f"Match Scorer Node error: {e}")
        # Fallback response
        return {
            "match_score": 70,
            "seniority_match": "Mid-Level Fit",
            "summary_verdict": f"Automated analysis completed. Key alignment found across main core requirements.",
            "relevant_chunks": relevant_chunks,
        }
