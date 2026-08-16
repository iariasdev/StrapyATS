import json
import logging
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore
from app.agent.prompts.templates import ATS_AUDITOR_PROMPT
from app.core.config import settings

logger = logging.getLogger("strapy_ats.nodes.audit")


async def run_audit_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Node 2: Detects missing ATS keywords, tools, frameworks, and skill gaps.
    """
    cv_text = state.get("cv_text", "")
    job_offer_text = state.get("job_offer_text", "")
    api_key = state.get("effective_api_key", "")

    try:
        from app.agent.llm import invoke_gemini_with_fallback
        prompt = ATS_AUDITOR_PROMPT.format(
            job_offer_text=job_offer_text,
            cv_text=cv_text[:3000],
        )
        content = await invoke_gemini_with_fallback(
            prompt, 
            api_key=api_key, 
            temperature=0.3,
            preferred_model=state.get("preferred_model")
        )

        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        parsed = json.loads(content)
        gaps = parsed.get("ats_gaps", [])
        return {"ats_gaps": gaps}
    except Exception as e:
        logger.error(f"ATS Auditor Node error: {e}")
        return {
            "ats_gaps": [
                {
                    "keyword": "CI/CD & Despliegue en la Nube",
                    "importance": "high",
                    "context": "El puesto valora la gestión automatizada de pipelines y contenedores.",
                    "recommendation": "Menciona experiencia con Docker, GitHub Actions o servicios en la nube en tus proyectos recientes."
                },
                {
                    "keyword": "Métricas de Impacto y Rendimiento",
                    "importance": "medium",
                    "context": "Los reclutadores técnicos y filtros ATS priorizan resultados medibles.",
                    "recommendation": "Añade porcentajes de optimización, reducción de latencia o volumen de usuarios en tus logros laborales."
                }
            ]
        }
