import json
import logging
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore
from app.agent.prompts.templates import CV_REWRITER_PROMPT, COVER_LETTER_PROMPT
from app.core.config import settings

logger = logging.getLogger("strapy_ats.nodes.rewrite")


async def run_rewrite_node(state: Dict[str, Any]) -> Dict[str, Any]:
    """
    Node 3: Rewrites candidate CV sections with high impact action verbs and generates custom cover letter.
    """
    cv_text = state.get("cv_text", "")
    job_offer_text = state.get("job_offer_text", "")
    ats_gaps = state.get("ats_gaps", [])
    api_key = state.get("effective_api_key", "")

    gaps_text = "\n".join([f"- {g.get('keyword')}: {g.get('context')}" for g in ats_gaps if isinstance(g, dict)])

    from app.agent.llm import invoke_gemini_with_fallback

    # 1. Rewrite CV Sections
    rewritten_cv_data = {}
    try:
        from app.agent.llm import safe_json_loads
        rewrite_prompt = CV_REWRITER_PROMPT.format(
            job_offer_text=job_offer_text,
            cv_text=cv_text[:15000],
            ats_gaps_text=gaps_text,
        )
        content = await invoke_gemini_with_fallback(
            rewrite_prompt, 
            api_key=api_key, 
            temperature=0.4,
            preferred_model=state.get("preferred_model"),
            provider=state.get("byok_provider")
        )

        rewritten_cv_data = safe_json_loads(content)

        # Respaldo Regex: Si el LLM no extrajo teléfono, email, linkedin o github
        import re
        if not rewritten_cv_data.get("candidate_phone"):
            phones = re.findall(r"(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{1,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}", cv_text)
            valid_phones = [p.strip() for p in phones if sum(c.isdigit() for c in p) >= 8]
            if valid_phones:
                cleaned_p = re.sub(r"[^\d+]", " ", valid_phones[0]).strip()
                cleaned_p = re.sub(r"\s+", " ", cleaned_p)
                rewritten_cv_data["candidate_phone"] = cleaned_p

        if not rewritten_cv_data.get("candidate_email"):
            emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", cv_text)
            if emails:
                rewritten_cv_data["candidate_email"] = emails[0]

        if not rewritten_cv_data.get("candidate_linkedin"):
            linkedin_matches = re.findall(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+", cv_text, re.IGNORECASE)
            if linkedin_matches:
                rewritten_cv_data["candidate_linkedin"] = linkedin_matches[0]

        if not rewritten_cv_data.get("candidate_github"):
            github_matches = re.findall(r"(?:https?://)?(?:www\.)?github\.com/[\w-]+", cv_text, re.IGNORECASE)
            if github_matches:
                rewritten_cv_data["candidate_github"] = github_matches[0]

        if not rewritten_cv_data.get("candidate_name"):
            lines = [l.strip() for l in cv_text.split("\n") if l.strip()]
            for line in lines:
                if re.match(r"^---\s*Page", line, re.IGNORECASE) or re.match(r"^PAGE\s*\d+", line, re.IGNORECASE):
                    continue
                if len(line) < 40 and not any(c in line for c in ["@", "http", "www", ":", "/", "•"]):
                    rewritten_cv_data["candidate_name"] = line
                    break
    except Exception as e:
        logger.error(f"CV Rewriter Node error: {e}")
        import re
        # Try to extract candidate email/phone from CV text if available
        emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", cv_text)
        phones = re.findall(r"(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{1,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}", cv_text)
        valid_phones = [p.strip() for p in phones if sum(c.isdigit() for c in p) >= 8]
        cleaned_phone = ""
        if valid_phones:
            cleaned_phone = re.sub(r"[^\d+]", " ", valid_phones[0]).strip()
            cleaned_phone = re.sub(r"\s+", " ", cleaned_phone)

        lines = [l.strip() for l in cv_text.split("\n") if l.strip()]
        detected_name = ""
        for line in lines:
            if re.match(r"^---\s*Page", line, re.IGNORECASE) or re.match(r"^PAGE\s*\d+", line, re.IGNORECASE):
                continue
            if len(line) < 40 and not any(c in line for c in ["@", "http", "www", ":", "/", "•"]):
                detected_name = line
                break

        rewritten_cv_data = {
            "candidate_name": detected_name or "Candidato",
            "candidate_title": state.get("seniority_match", "Profesional Especializado"),
            "candidate_email": emails[0] if emails else "",
            "candidate_phone": cleaned_phone,
            "candidate_location": "",
            "candidate_linkedin": "",
            "summary": "Profesional con sólida trayectoria y competencias demostradas para cumplir con los objetivos estratégicos y técnicos del puesto requerido.",
            "experience_bullets": [
                "Lideró iniciativas clave alineadas a las necesidades del puesto, optimizando procesos operativos y métricas de rendimiento.",
                "Implementó soluciones técnicas y organizacionales asegurando altos estándares de calidad y cumplimiento de objetivos.",
                "Colaboró de forma transversal con equipos multidisciplinarios para acelerar entregas e integrar mejores prácticas."
            ],
            "skills_added": [g.get("keyword", "Habilidad Requerida") for g in ats_gaps[:4] if isinstance(g, dict)],
            "formatting_tips": [
                "Utiliza una estructura de una sola columna sin tablas complejas ni gráficos.",
                "Usa encabezados de sección estándar (Experiencia, Educación, Habilidades).",
                "Evita gráficos, iconos o imágenes que bloqueen los analizadores ATS."
            ]
        }

    # 2. Generate Cover Letter
    cover_letter_text = ""
    try:
        cover_prompt = COVER_LETTER_PROMPT.format(
            job_offer_text=job_offer_text,
            cv_text=cv_text[:3000],
        )
        cover_letter_text = await invoke_gemini_with_fallback(
            cover_prompt, 
            api_key=api_key, 
            temperature=0.5,
            preferred_model=state.get("preferred_model"),
            provider=state.get("byok_provider")
        )
    except Exception as e:
        logger.error(f"Cover Letter generation error: {e}")
        cover_letter_text = (
            "Estimado/a Líder de Selección,\n\n"
            "Me dirijo a ustedes con gran entusiasmo para presentar mi postulación a esta posición. "
            "Considerando mi trayectoria en ingeniería de software y experiencia en desarrollo de soluciones tecnológicas robustas y escalables, "
            "estoy seguro/a de poder aportar valor inmediato a los objetivos estratégicos de su equipo.\n\n"
            "Agradezco de antemano su tiempo y consideración para revisar mi perfil.\n\nAtentamente,\nEl Candidato"
        )

    return {
        "rewritten_cv": rewritten_cv_data,
        "cover_letter": cover_letter_text,
    }
