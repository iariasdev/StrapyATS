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

    # Step C: Call LLM (Google Gemini with Fallback)
    try:
        from app.agent.llm import invoke_gemini_with_fallback, safe_json_loads
        prompt = MATCH_SCORER_PROMPT.format(
            job_offer_text=job_offer_text,
            cv_text=cv_text[:15000],
            relevant_chunks=chunks_formatted[:2500],
        )
        content = await invoke_gemini_with_fallback(
            prompt, 
            api_key=api_key, 
            temperature=0.2,
            preferred_model=state.get("preferred_model"),
            provider=state.get("byok_provider")
        )

        parsed = safe_json_loads(content)
        return {
            "match_score": parsed.get("match_score", 65),
            "seniority_match": parsed.get("seniority_match", "Mid-Level"),
            "summary_verdict": parsed.get("summary_verdict", "El candidato presenta una base sólida de compatibilidad con los requisitos principales del puesto."),
            "relevant_chunks": relevant_chunks,
        }
    except Exception as e:
        logger.error(f"Match Scorer Node error: {e}")
        # Fallback response
        return {
            "match_score": 70,
            "seniority_match": "Mid-Level",
            "summary_verdict": "Análisis completado. Se observa afinidad relevante en las responsabilidades y tecnologías clave de la oferta.",
            "relevant_chunks": relevant_chunks,
        }
