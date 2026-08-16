import logging
from typing import Optional, List
from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore
from app.core.config import settings

logger = logging.getLogger("strapy_ats.llm")

# Primary and Fallback model hierarchy
FALLBACK_MODELS = [
    settings.GEMINI_MODEL,
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
]

def get_gemini_llm(api_key: str, temperature: float = 0.3, model_override: Optional[str] = None) -> ChatGoogleGenerativeAI:
    """
    Returns an initialized ChatGoogleGenerativeAI instance.
    Defaults to settings.GEMINI_MODEL with fallback options.
    """
    model_name = model_override or settings.GEMINI_MODEL or "gemini-1.5-flash"
    return ChatGoogleGenerativeAI(
        model=model_name,
        google_api_key=api_key,
        temperature=temperature,
    )

async def invoke_gemini_with_fallback(
    prompt: str,
    api_key: str,
    temperature: float = 0.3,
    preferred_model: Optional[str] = None
) -> str:
    """
    Invokes Gemini with automatic graceful fallback across models.
    """
    models_to_try: List[str] = []
    if preferred_model:
        models_to_try.append(preferred_model)
    for m in FALLBACK_MODELS:
        if m and m not in models_to_try:
            models_to_try.append(m)

    last_error = None
    for model_name in models_to_try:
        try:
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=api_key,
                temperature=temperature,
            )
            response = await llm.ainvoke(prompt)
            content = str(response.content).strip()
            if content:
                return content
        except Exception as e:
            logger.warning(f"Model {model_name} failed: {e}. Trying next fallback...")
            last_error = e

    if last_error:
        raise last_error
    raise RuntimeError("No Gemini models succeeded.")
