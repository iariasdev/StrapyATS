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
                    "question": "¿Cómo gestionas el consumo de memoria y la eficiencia de índices vectoriales en despliegues serverless o contenedores?",
                    "focus_area": "Arquitectura de Sistemas & Rendimiento",
                    "suggested_answer_tip": "Menciona el uso de almacenamiento persistente en disco (ej. ChromaDB PersistentClient) frente a instancias en memoria para evitar desbordamientos de RAM."
                },
                {
                    "question": "¿Cómo auditas y trazas la latencia y costos de tokens en pipelines de IA multi-agente?",
                    "focus_area": "Observabilidad de LLMs & FinOps",
                    "suggested_answer_tip": "Explica la integración de herramientas de observabilidad como Langfuse para auditar la ejecución nodo a nodo y la latencia P95."
                },
                {
                    "question": "¿Qué estrategias aplicas para escalar una aplicación de IA a costo $0 aprovechando capas gratuitas (Free Tiers)?",
                    "focus_area": "FinOps & Arquitectura Cloud",
                    "suggested_answer_tip": "Destaca el renderizado de PDFs en el cliente (evitando Puppeteer en el servidor) y el escalado a cero en Google Cloud Run o similar."
                },
                {
                    "question": "Describe cómo conectarías de forma dinámica una oferta extraída con el perfil de un postulante.",
                    "focus_area": "RAG & Extracción de Documentos",
                    "suggested_answer_tip": "Aborda el uso de extensiones de navegador para lectura limpia del DOM y búsqueda por similitud semántica con embeddings vectoriales."
                },
                {
                    "question": "¿Cómo evitas bloqueos por rate limiting al consumir APIs de LLMs en producción?",
                    "focus_area": "Resiliencia de APIs & Control de Tráfico",
                    "suggested_answer_tip": "Explica técnicas de limitación de tasa por IP, colas de procesamiento asíncronas y soporte de Bring Your Own Key (BYOK)."
                }
            ]
        }
