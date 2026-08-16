from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class ATSGap(BaseModel):
    keyword: str = Field(..., description="Missing or weak keyword required by the ATS/Job offer")
    importance: str = Field(..., description="Importance level: 'critical' | 'high' | 'medium'")
    context: str = Field(..., description="Why this keyword matters for this specific role")
    recommendation: str = Field(..., description="Actionable advice on how to insert this into the CV")


class InterviewQuestion(BaseModel):
    question: str = Field(..., description="Challenging technical or behavioral question based on detected gap")
    focus_area: str = Field(..., description="Area being evaluated (e.g., 'System Architecture', 'AWS Scale')")
    suggested_answer_tip: str = Field(..., description="Key points candidate should cover in their response")


class RewrittenCV(BaseModel):
    candidate_name: Optional[str] = Field(None, description="Candidate's full name extracted from original CV")
    candidate_title: Optional[str] = Field(None, description="Candidate's target or current job title")
    candidate_email: Optional[str] = Field(None, description="Candidate's email extracted from CV")
    candidate_phone: Optional[str] = Field(None, description="Candidate's phone number extracted from CV")
    candidate_location: Optional[str] = Field(None, description="Candidate's location extracted from CV")
    candidate_linkedin: Optional[str] = Field(None, description="Candidate's LinkedIn URL extracted from CV")
    candidate_github: Optional[str] = Field(None, description="Candidate's GitHub URL extracted from CV")
    candidate_portfolio: Optional[str] = Field(None, description="Candidate's portfolio/website extracted from CV")
    summary: str = Field(..., description="ATS-tailored professional summary")
    skills_categories: Optional[Dict[str, List[str]]] = Field(default_factory=dict, description="Categorized skills")
    skills_added: List[str] = Field(default_factory=list, description="List of keywords/skills newly integrated into the CV")
    experiences: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Preserved work experiences and projects")
    experience_bullets: List[str] = Field(default_factory=list, description="High-impact bullet points rewritten with action verbs and metrics")
    education: Optional[List[Dict[str, Any]]] = Field(default_factory=list, description="Candidate education history")
    certificaciones: Optional[List[str]] = Field(default_factory=list, description="Certifications and achievements")
    languages_spoken: Optional[List[str]] = Field(default_factory=list, description="Languages spoken by candidate")
    formatting_tips: List[str] = Field(default_factory=list, description="ATS layout and formatting recommendations")


class AnalyzeRequest(BaseModel):
    job_offer_text: str = Field(..., min_length=20, max_length=25000, description="Full text or scraped content of the target job offer")
    cv_text: Optional[str] = Field(None, max_length=25000, description="Optional raw text of candidate CV (if not uploading PDF)")
    byok_api_key: Optional[str] = Field(None, description="User's own API Key (BYOK)")
    byok_provider: Optional[str] = Field("auto", description="Provider: 'gemini' | 'openai' | 'anthropic' | 'deepseek' | 'groq' | 'auto'")
    model_name: Optional[str] = Field(None, description="Preferred model name")


class AnalyzeResponse(BaseModel):
    match_score: int = Field(..., ge=0, le=100, description="ATS Match Percentage score (0 to 100)")
    seniority_match: str = Field(..., description="Evaluated seniority fit (e.g. 'Junior', 'Mid-Level', 'Senior', 'Lead')")
    summary_verdict: str = Field(..., description="Executive breakdown of candidate fit vs job offer requirements")
    ats_gaps: List[ATSGap] = Field(default_factory=list, description="List of detected keyword & skill gaps")
    rewritten_cv: RewrittenCV = Field(..., description="ATS-optimized CV content ready for rendering")
    cover_letter: str = Field(..., description="Custom high-conversion cover letter tailored for the target company")
    interview_questions: List[InterviewQuestion] = Field(default_factory=list, description="5 hard interview questions based on candidate gaps")
    langfuse_trace_url: Optional[str] = Field(None, description="Observability trace URL on Langfuse Cloud")
    rate_limit_remaining: Optional[int] = Field(None, description="Remaining free requests for this IP today")


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    chroma_db_status: str
