import logging
import httpx
from typing import Optional, List, Any, Dict
from langchain_google_genai import ChatGoogleGenerativeAI  # type: ignore
from app.core.config import settings

logger = logging.getLogger("strapy_ats.llm")

# Primary and Fallback model hierarchy for Google Gemini
GEMINI_FALLBACK_MODELS = [
    settings.GEMINI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-2.5-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-flash-latest",
]


def extract_text_from_content(raw_content: Any) -> str:
    """
    Safely extracts string content from structured responses
    which may be returned as list of dicts with signatures/extras.
    """
    if isinstance(raw_content, str):
        return raw_content.strip()
    if isinstance(raw_content, list):
        text_parts = []
        for item in raw_content:
            if isinstance(item, str):
                text_parts.append(item)
            elif isinstance(item, dict):
                text_parts.append(item.get("text", ""))
        return "".join(text_parts).strip()
    return str(raw_content).strip()


def safe_json_loads(text: str) -> Any:
    """
    Robustly parses JSON from LLM output, handling markdown fences,
    surrounding text, trailing commas, and unescaped newlines.
    """
    import json
    import re
    if not text:
        return {}
    cleaned = text.strip()
    if "```json" in cleaned:
        cleaned = cleaned.split("```json")[1].split("```")[0].strip()
    elif "```" in cleaned:
        cleaned = cleaned.split("```")[1].split("```")[0].strip()

    try:
        return json.loads(cleaned)
    except Exception:
        match = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", cleaned)
        if match:
            raw_target = match.group(1)
            try:
                return json.loads(raw_target)
            except Exception:
                # Fix trailing commas
                fixed = re.sub(r",\s*([\]\}])", r"\1", raw_target)
                try:
                    return json.loads(fixed)
                except Exception:
                    pass
        raise


def detect_provider(api_key: str, specified_provider: Optional[str] = None) -> str:
    """
    Detects the AI provider based on explicit choice or key signature.
    """
    if specified_provider and specified_provider.lower() not in ("auto", "none", ""):
        return specified_provider.lower()
    
    key = (api_key or "").strip()
    if key.startswith("AIza"):
        return "gemini"
    elif key.startswith("sk-ant-"):
        return "anthropic"
    elif key.startswith("gsk_"):
        return "groq"
    elif key.startswith("sk-") and len(key) >= 40:
        return "openai"
    elif "deepseek" in key.lower():
        return "deepseek"
    
    return "gemini"


async def _invoke_gemini(prompt: str, api_key: str, temperature: float, preferred_model: Optional[str] = None) -> str:
    models_to_try: List[str] = []
    if preferred_model and preferred_model.startswith("gemini"):
        models_to_try.append(preferred_model)
    for m in GEMINI_FALLBACK_MODELS:
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
            content = extract_text_from_content(response.content)
            if content:
                return content
        except Exception as e:
            logger.warning(f"Gemini model {model_name} failed: {e}. Trying next fallback...")
            last_error = e

    if last_error:
        raise last_error
    raise RuntimeError("No Gemini models succeeded.")


async def _invoke_openai_compatible(
    prompt: str,
    api_key: str,
    endpoint_url: str,
    models: List[str],
    temperature: float,
    extra_headers: Optional[Dict[str, str]] = None
) -> str:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if extra_headers:
        headers.update(extra_headers)

    last_error = None
    async with httpx.AsyncClient(timeout=60.0) as client:
        for model in models:
            try:
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "Eres un asistente experto en análisis y optimización de currículums ATS. Siempre responde estrictamente en el formato JSON o estructurado solicitado."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": temperature,
                }
                resp = await client.post(endpoint_url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    return data["choices"][0]["message"]["content"].strip()
                else:
                    error_msg = f"HTTP {resp.status_code}: {resp.text}"
                    logger.warning(f"Model {model} at {endpoint_url} returned: {error_msg}")
                    last_error = RuntimeError(error_msg)
            except Exception as e:
                logger.warning(f"Model {model} failed: {e}")
                last_error = e

    if last_error:
        raise last_error
    raise RuntimeError(f"Failed to invoke models at {endpoint_url}")


async def _invoke_anthropic(
    prompt: str,
    api_key: str,
    temperature: float,
    preferred_model: Optional[str] = None
) -> str:
    headers = {
        "x-api-key": api_key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
    }
    models = ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-sonnet-20240229"]
    if preferred_model and "claude" in preferred_model.lower():
        models.insert(0, preferred_model)

    last_error = None
    async with httpx.AsyncClient(timeout=60.0) as client:
        for model in models:
            try:
                payload = {
                    "model": model,
                    "max_tokens": 4096,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": temperature,
                }
                resp = await client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    content_blocks = data.get("content", [])
                    text = "".join([b.get("text", "") for b in content_blocks if b.get("type") == "text"])
                    return text.strip()
                else:
                    error_msg = f"HTTP {resp.status_code}: {resp.text}"
                    logger.warning(f"Claude {model} returned: {error_msg}")
                    last_error = RuntimeError(error_msg)
            except Exception as e:
                logger.warning(f"Claude {model} failed: {e}")
                last_error = e

    if last_error:
        raise last_error
    raise RuntimeError("Anthropic Claude invocation failed.")


async def invoke_llm_with_fallback(
    prompt: str,
    api_key: str,
    temperature: float = 0.3,
    preferred_model: Optional[str] = None,
    provider: Optional[str] = None
) -> str:
    """
    Universal multi-provider LLM executor supporting Gemini, OpenAI, Claude, DeepSeek, and Groq.
    """
    detected_prov = detect_provider(api_key, provider)
    logger.info(f"Invoking LLM with detected provider: {detected_prov}")

    if detected_prov == "openai":
        models = [preferred_model] if preferred_model and "gpt" in preferred_model else ["gpt-4o-mini", "gpt-4o", "gpt-3.5-turbo"]
        return await _invoke_openai_compatible(
            prompt=prompt,
            api_key=api_key,
            endpoint_url="https://api.openai.com/v1/chat/completions",
            models=models,
            temperature=temperature
        )
    elif detected_prov == "anthropic":
        return await _invoke_anthropic(
            prompt=prompt,
            api_key=api_key,
            temperature=temperature,
            preferred_model=preferred_model
        )
    elif detected_prov == "deepseek":
        models = ["deepseek-chat"]
        return await _invoke_openai_compatible(
            prompt=prompt,
            api_key=api_key,
            endpoint_url="https://api.deepseek.com/chat/completions",
            models=models,
            temperature=temperature
        )
    elif detected_prov == "groq":
        models = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "mixtral-8x7b-32768"]
        return await _invoke_openai_compatible(
            prompt=prompt,
            api_key=api_key,
            endpoint_url="https://api.groq.com/openai/v1/chat/completions",
            models=models,
            temperature=temperature
        )
    else:
        # Default: Google Gemini
        return await _invoke_gemini(
            prompt=prompt,
            api_key=api_key,
            temperature=temperature,
            preferred_model=preferred_model
        )


# Backward compatibility alias
invoke_gemini_with_fallback = invoke_llm_with_fallback

