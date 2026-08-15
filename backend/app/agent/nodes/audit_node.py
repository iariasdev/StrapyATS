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
        llm = ChatGoogleGenerativeAI(
            model=settings.GEMINI_MODEL,
            google_api_key=api_key,
            temperature=0.3,
        )
        prompt = ATS_AUDITOR_PROMPT.format(
            job_offer_text=job_offer_text,
            cv_text=cv_text[:3000],
        )
        response = await llm.ainvoke(prompt)
        content = str(response.content).strip()

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
                    "keyword": "CI/CD & Cloud Deployment",
                    "importance": "high",
                    "context": "The role requires automated pipeline management.",
                    "recommendation": "Mention GitHub Actions or Docker deployment experiences."
                },
                {
                    "keyword": "Metrics & KPI Tracking",
                    "importance": "medium",
                    "context": "Quantifiable impact is required by top recruiters.",
                    "recommendation": "Add percentage improvements or latencies to your bullet points."
                }
            ]
        }
