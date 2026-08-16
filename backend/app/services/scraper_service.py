import re
import logging
import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException

logger = logging.getLogger("strapy_ats.scraper_service")

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
}


def extract_linkedin_job_id(url: str) -> str | None:
    """
    Extracts the numeric job ID from various LinkedIn URL formats:
    - https://www.linkedin.com/jobs/view/4448318522/...
    - https://www.linkedin.com/jobs/search-results/?currentJobId=4448318522&...
    - https://www.linkedin.com/jobs/collections/recommended/?currentJobId=4448318522
    """
    # 1. Check currentJobId query param
    param_match = re.search(r"currentJobId=(\d+)", url)
    if param_match:
        return param_match.group(1)

    # 2. Check /jobs/view/<id>
    view_match = re.search(r"/jobs/view/(\d+)", url)
    if view_match:
        return view_match.group(1)

    # 3. Check generic numeric ID in linkedin jobs URL
    gen_match = re.search(r"linkedin\.com/jobs/.*?/(\d+)", url)
    if gen_match:
        return gen_match.group(1)

    return None


async def scrape_linkedin_job(job_id: str, original_url: str) -> dict:
    """
    Scrapes job details using LinkedIn's public guest API endpoint.
    """
    guest_url = f"https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/{job_id}"
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            resp = await client.get(guest_url, headers=HEADERS)
            
            if resp.status_code != 200:
                logger.warning(f"LinkedIn guest endpoint returned {resp.status_code} for job {job_id}")
                raise HTTPException(
                    status_code=422,
                    detail="LinkedIn requiere inicio de sesión para ver esta oferta específica. Te recomendamos usar nuestra Extensión de Chrome de 1-clic o pegar el texto directamente."
                )

            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Title
            title_tag = soup.find("h2", class_="top-card-layout__title") or soup.find("h1")
            title = title_tag.get_text(strip=True) if title_tag else "Oferta de Empleo"

            # Company
            company_tag = soup.find("a", class_="topcard__org-name-link") or soup.find("span", class_="topcard__flavor")
            company = company_tag.get_text(strip=True) if company_tag else "Empresa Confidencial"

            # Location
            loc_tag = soup.find("span", class_="topcard__flavor topcard__flavor--bullet")
            location = loc_tag.get_text(strip=True) if loc_tag else ""

            # Description
            desc_tag = soup.find("div", class_="show-more-less-html__markup") or soup.find("section", class_="show-more-less-html")
            description = desc_tag.get_text("\n", strip=True) if desc_tag else ""

            # Criteria (Seniority, Employment Type, Job Function)
            criteria_tags = soup.find_all("li", class_="description__job-criteria-item")
            criteria_text = []
            for item in criteria_tags:
                sub_header = item.find("h3")
                sub_val = item.find("span")
                if sub_header and sub_val:
                    criteria_text.append(f"- {sub_header.get_text(strip=True)}: {sub_val.get_text(strip=True)}")

            full_parts = [
                f"PUESTO: {title}",
                f"EMPRESA: {company}",
            ]
            if location:
                full_parts.append(f"UBICACIÓN: {location}")
            if criteria_text:
                full_parts.append("\nCRITERIOS DEL PUESTO:\n" + "\n".join(criteria_text))
            if description:
                full_parts.append(f"\nDESCRIPCIÓN DE LA OFERTA:\n{description}")
            else:
                full_parts.append(soup.get_text("\n", strip=True))

            full_text = "\n".join(full_parts).strip()

            return {
                "title": title,
                "company": company,
                "location": location,
                "full_text": full_text,
                "url": original_url,
                "source": "LinkedIn",
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scraping LinkedIn job {job_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo extraer la oferta de LinkedIn: {str(e)}. Prueba usando nuestra Extensión de Chrome."
        )


async def scrape_generic_job(url: str) -> dict:
    """
    Scrapes generic career / job offer web pages.
    """
    try:
        async with httpx.AsyncClient(timeout=12.0, follow_redirects=True) as client:
            resp = await client.get(url, headers=HEADERS)
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=resp.status_code,
                    detail=f"La página web respondió con código de error {resp.status_code}."
                )

            soup = BeautifulSoup(resp.text, "html.parser")

            # Remove noise elements
            for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "button", "form"]):
                tag.decompose()

            # Extract Title
            title = "Oferta de Empleo"
            h1 = soup.find("h1")
            if h1 and h1.get_text(strip=True):
                title = h1.get_text(strip=True)
            elif soup.title:
                title = soup.title.get_text(strip=True)

            # Try to identify main content area
            main_content = (
                soup.find("main") or 
                soup.find("article") or 
                soup.find("div", class_=re.compile(r"job|description|offer|detail|content|posting", re.I)) or 
                soup.body
            )

            raw_text = main_content.get_text("\n", strip=True) if main_content else soup.get_text("\n", strip=True)
            # Clean excessive newlines
            clean_text = re.sub(r"\n{3,}", "\n\n", raw_text).strip()

            if len(clean_text) < 50:
                raise HTTPException(
                    status_code=422,
                    detail="No se encontró suficiente texto legible en la URL provista. Por favor pega el texto manualmente."
                )

            return {
                "title": title,
                "company": "Empresa",
                "location": "",
                "full_text": clean_text,
                "url": url,
                "source": "Web",
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scraping generic job {url}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al leer la URL: {str(e)}"
        )


async def scrape_job_from_url(url: str) -> dict:
    """
    Dispatcher: checks if URL is LinkedIn or generic, and scrapes accordingly.
    """
    clean_url = url.strip()
    if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
        clean_url = "https://" + clean_url

    if "linkedin.com" in clean_url:
        job_id = extract_linkedin_job_id(clean_url)
        if job_id:
            return await scrape_linkedin_job(job_id, clean_url)
        else:
            raise HTTPException(
                status_code=400,
                detail="No se pudo identificar el ID del empleo en el enlace de LinkedIn. Asegúrate de copiar el enlace de la oferta."
            )
    else:
        return await scrape_generic_job(clean_url)
