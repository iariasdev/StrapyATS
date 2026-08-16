import io
import logging
import pdfplumber  # type: ignore
from fastapi import HTTPException

logger = logging.getLogger("strapy_ats.pdf_service")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts plain text from a PDF file buffer using pdfplumber.
    Falls back gracefully if issues arise during parsing.
    """
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    extracted_text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text()
                if page_text:
                    extracted_text += ("\n\n" if extracted_text else "") + page_text.strip()
    except Exception as e:
        logger.error(f"Error parsing PDF with pdfplumber: {e}")
        raise HTTPException(
            status_code=422,
            detail=f"Could not read PDF content. Please ensure the file is a valid, unencrypted PDF. Error: {str(e)}"
        )

    cleaned_text = extracted_text.strip()
    if len(cleaned_text) < 30:
        raise HTTPException(
            status_code=422,
            detail="The uploaded PDF contained little or no extractable text. It may be a scanned image or empty PDF."
        )

    return cleaned_text
