import os
import uuid
import logging
from typing import List, Dict, Any, Optional, TypedDict
from langgraph.graph import StateGraph, END
from app.core.config import settings
from app.agent.nodes.match_node import run_match_node
from app.agent.nodes.audit_node import run_audit_node
from app.agent.nodes.rewrite_node import run_rewrite_node
from app.agent.nodes.interview_node import run_interview_node

logger = logging.getLogger("strapy_ats.agent_graph")


class AgentState(TypedDict):
    session_id: str
    cv_text: str
    job_offer_text: str
    byok_api_key: Optional[str]
    byok_provider: Optional[str]
    effective_api_key: str
    preferred_model: Optional[str]
    match_score: int
    seniority_match: str
    summary_verdict: str
    relevant_chunks: List[str]
    ats_gaps: List[Dict[str, Any]]
    rewritten_cv: Dict[str, Any]
    cover_letter: str
    interview_questions: List[Dict[str, Any]]
    langfuse_trace_url: Optional[str]
    error: Optional[str]


def build_strapy_ats_graph():
    """
    Constructs the LangGraph deterministic multi-node workflow:
    Match Scorer -> ATS Auditor -> CV Rewriter & Cover Letter -> Interview Simulator
    """
    workflow = StateGraph(AgentState)  # type: ignore[arg-type]

    # Register Nodes
    workflow.add_node("match_scorer", run_match_node)
    workflow.add_node("ats_auditor", run_audit_node)
    workflow.add_node("cv_rewriter", run_rewrite_node)
    workflow.add_node("interview_simulator", run_interview_node)

    # Set Edges
    workflow.set_entry_point("match_scorer")
    workflow.add_edge("match_scorer", "ats_auditor")
    workflow.add_edge("ats_auditor", "cv_rewriter")
    workflow.add_edge("cv_rewriter", "interview_simulator")
    workflow.add_edge("interview_simulator", END)

    return workflow.compile()


strapy_agent = build_strapy_ats_graph()


async def run_strapy_ats_pipeline(
    cv_text: str,
    job_offer_text: str,
    byok_api_key: Optional[str] = None,
    preferred_model: Optional[str] = None,
    byok_provider: Optional[str] = None
) -> Dict[str, Any]:
    """
    Executes the full LangGraph pipeline with Langfuse tracing enabled if configured.
    """
    session_id = f"session_{uuid.uuid4().hex[:8]}"
    effective_key = (byok_api_key or "").strip() or settings.GOOGLE_API_KEY.strip()

    if not effective_key:
        raise ValueError(
            "API Key missing. Please provide your API Key in the BYOK configuration or set GOOGLE_API_KEY in backend/.env."
        )

    initial_state: AgentState = {
        "session_id": session_id,
        "cv_text": cv_text,
        "job_offer_text": job_offer_text,
        "byok_api_key": byok_api_key,
        "byok_provider": byok_provider or "auto",
        "effective_api_key": effective_key,
        "preferred_model": preferred_model,
        "match_score": 0,
        "seniority_match": "Evaluating...",
        "summary_verdict": "",
        "relevant_chunks": [],
        "ats_gaps": [],
        "rewritten_cv": {},
        "cover_letter": "",
        "interview_questions": [],
        "langfuse_trace_url": None,
        "error": None,
    }

    callbacks: List[Any] = []
    trace_url: Optional[str] = None

    # Check Langfuse credentials
    if settings.LANGFUSE_PUBLIC_KEY and settings.LANGFUSE_SECRET_KEY:
        try:
            os.environ["LANGFUSE_PUBLIC_KEY"] = settings.LANGFUSE_PUBLIC_KEY
            os.environ["LANGFUSE_SECRET_KEY"] = settings.LANGFUSE_SECRET_KEY
            os.environ["LANGFUSE_HOST"] = settings.LANGFUSE_HOST

            try:
                from langfuse.callback import CallbackHandler
            except ImportError:
                from langfuse.langchain import CallbackHandler  # type: ignore

            langfuse_handler = CallbackHandler()
            callbacks.append(langfuse_handler)
            trace_url = f"{settings.LANGFUSE_HOST}/trace/{session_id}"
            logger.info(f"Langfuse Cloud tracing active: {trace_url}")
        except Exception as e:
            logger.warning(f"Failed to initialize Langfuse callback: {e}")

    # Invoke graph
    config: Dict[str, Any] = {"configurable": {"thread_id": session_id}}
    if callbacks:
        config["callbacks"] = callbacks

    final_state = await strapy_agent.ainvoke(initial_state, config=config)  # type: ignore
    if trace_url:
        final_state["langfuse_trace_url"] = trace_url

    return dict(final_state)
