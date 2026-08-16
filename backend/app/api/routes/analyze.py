import logging
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request, Body
from app.models.schemas import AnalyzeResponse, AnalyzeRequest, ATSGap, InterviewQuestion, RewrittenCV
from app.services.pdf_service import extract_text_from_pdf
from app.services.scraper_service import scrape_job_from_url
from app.services.rate_limiter import rate_limiter
from app.agent.graph import run_strapy_ats_pipeline

logger = logging.getLogger("strapy_ats.api.analyze")
router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_cv(
    request: Request,
    cv_file: Optional[UploadFile] = File(None, description="CV in PDF format"),
    cv_text: Optional[str] = Form(None, description="Raw text of candidate CV (if not uploading PDF file)"),
    job_offer_text: str = Form(..., description="Job offer text or extracted content"),
    byok_api_key: Optional[str] = Form(None, description="Optional: user's own Google AI Studio API Key (BYOK)"),
    model_name: Optional[str] = Form(None, description="Optional: user's preferred Gemini model"),
):
    """
    Main endpoint: receives a CV (PDF or raw text) and target job offer text,
    executes the LangGraph multi-agent pipeline and returns complete ATS analysis.
    """
    # 1. Extract Client IP and verify Rate Limit
    client_ip = request.client.host if request.client else "127.0.0.1"
    # Header check for proxies/Cloud Run (X-Forwarded-For)
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()

    is_allowed, remaining_quota = rate_limiter.check_and_increment(client_ip, byok_key=byok_api_key)
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail=(
                "Daily free analysis limit reached for your IP (2 requests/day). "
                "Please enter your own free Google AI Studio API Key in the BYOK field to continue immediately."
            )
        )

    # 2. Extract CV Text
    final_cv_text = ""
    if cv_file:
        file_bytes = await cv_file.read()
        final_cv_text = extract_text_from_pdf(file_bytes)
    elif cv_text and cv_text.strip():
        final_cv_text = cv_text.strip()
    else:
        raise HTTPException(
            status_code=400,
            detail="Please provide a CV file (PDF) or raw CV text in your request."
        )

    if len(job_offer_text.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job offer text is too short. Please provide the full job description."
        )

    # 3. Execute LangGraph Multi-Node Pipeline
    try:
        pipeline_result = await run_strapy_ats_pipeline(
            cv_text=final_cv_text,
            job_offer_text=job_offer_text,
            byok_api_key=byok_api_key,
            preferred_model=model_name
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error executing StrapyATS pipeline: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred while analyzing the CV: {str(e)}"
        )

    # 4. Format ATS Gaps & Interview Questions into Pydantic models
    raw_gaps = pipeline_result.get("ats_gaps", [])
    formatted_gaps = []
    for g in raw_gaps:
        if isinstance(g, dict):
            formatted_gaps.append(
                ATSGap(
                    keyword=g.get("keyword", "Skill Gap"),
                    importance=g.get("importance", "high"),
                    context=g.get("context", "Required by role"),
                    recommendation=g.get("recommendation", "Incorporate into experience section")
                )
            )

    raw_questions = pipeline_result.get("interview_questions", [])
    formatted_questions = []
    for q in raw_questions:
        if isinstance(q, dict):
            formatted_questions.append(
                InterviewQuestion(
                    question=q.get("question", "How do you solve complex architectural challenges?"),
                    focus_area=q.get("focus_area", "Engineering"),
                    suggested_answer_tip=q.get("suggested_answer_tip", "Use STAR method.")
                )
            )

    raw_rewritten = pipeline_result.get("rewritten_cv", {})
    rewritten_model = RewrittenCV(
        summary=raw_rewritten.get("summary", "Results-driven engineer..."),
        experience_bullets=raw_rewritten.get("experience_bullets", []),
        skills_added=raw_rewritten.get("skills_added", []),
        formatting_tips=raw_rewritten.get("formatting_tips", [])
    )

    return AnalyzeResponse(
        match_score=pipeline_result.get("match_score", 70),
        seniority_match=pipeline_result.get("seniority_match", "Mid-Level"),
        summary_verdict=pipeline_result.get("summary_verdict", "Analysis complete."),
        ats_gaps=formatted_gaps,
        rewritten_cv=rewritten_model,
        cover_letter=pipeline_result.get("cover_letter", ""),
        interview_questions=formatted_questions,
        langfuse_trace_url=pipeline_result.get("langfuse_trace_url"),
        rate_limit_remaining=remaining_quota
    )


@router.post("/analyze-json", response_model=AnalyzeResponse)
async def analyze_cv_json(
    request: Request,
    payload: AnalyzeRequest
):
    """
    JSON alternate endpoint for client applications or Chrome Extension.
    """
    client_ip = request.client.host if request.client else "127.0.0.1"
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        client_ip = forwarded_for.split(",")[0].strip()

    is_allowed, remaining_quota = rate_limiter.check_and_increment(client_ip, byok_key=payload.byok_api_key)
    if not is_allowed:
        raise HTTPException(
            status_code=429,
            detail="Daily free limit reached for your IP (2 requests/day). Provide BYOK API Key to continue."
        )

    if not payload.cv_text or len(payload.cv_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please provide cv_text in payload.")

    try:
        pipeline_result = await run_strapy_ats_pipeline(
            cv_text=payload.cv_text,
            job_offer_text=payload.job_offer_text,
            byok_api_key=payload.byok_api_key,
            preferred_model=payload.model_name
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error in JSON pipeline: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    raw_gaps = pipeline_result.get("ats_gaps", [])
    formatted_gaps = [
        ATSGap(
            keyword=g.get("keyword", "Skill Gap"),
            importance=g.get("importance", "high"),
            context=g.get("context", "Role requirement"),
            recommendation=g.get("recommendation", "Add to CV")
        ) for g in raw_gaps if isinstance(g, dict)
    ]

    raw_questions = pipeline_result.get("interview_questions", [])
    formatted_questions = [
        InterviewQuestion(
            question=q.get("question", "Interview Question"),
            focus_area=q.get("focus_area", "General"),
            suggested_answer_tip=q.get("suggested_answer_tip", "Tip")
        ) for q in raw_questions if isinstance(q, dict)
    ]

    raw_rewritten = pipeline_result.get("rewritten_cv", {})
    rewritten_model = RewrittenCV(
        summary=raw_rewritten.get("summary", ""),
        experience_bullets=raw_rewritten.get("experience_bullets", []),
        skills_added=raw_rewritten.get("skills_added", []),
        formatting_tips=raw_rewritten.get("formatting_tips", [])
    )

    return AnalyzeResponse(
        match_score=pipeline_result.get("match_score", 70),
        seniority_match=pipeline_result.get("seniority_match", "Mid-Level"),
        summary_verdict=pipeline_result.get("summary_verdict", "Analysis complete."),
        ats_gaps=formatted_gaps,
        rewritten_cv=rewritten_model,
        cover_letter=pipeline_result.get("cover_letter", ""),
        interview_questions=formatted_questions,
        langfuse_trace_url=pipeline_result.get("langfuse_trace_url"),
        rate_limit_remaining=remaining_quota
    )


@router.post("/extract-pdf-text")
async def extract_pdf_endpoint(file: UploadFile = File(...)):
    """
    Extracts text from an uploaded CV PDF file directly.
    """
    file_bytes = await file.read()
    text = extract_text_from_pdf(file_bytes)
    return {"text": text, "filename": file.filename}


@router.post("/extract-job-url")
async def extract_job_url_endpoint(payload: dict = Body(...)):
    """
    Extracts job offer information and full description from a given URL (e.g. LinkedIn or career portal).
    """
    url = payload.get("url")
    if not url or not url.strip():
        raise HTTPException(status_code=400, detail="Por favor ingresa una URL válida.")
    
    return await scrape_job_from_url(url.strip())


