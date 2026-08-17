import logging
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
import httpx
from app.core.config import settings
from app.core.auth import get_current_user, CurrentUser
from app.models.schemas import (
    ProfileUpdate,
    ProfileResponse,
    JobApplicationCreate,
    JobApplicationUpdate,
    JobApplicationResponse
)

logger = logging.getLogger("strapy_ats.api.user")
router = APIRouter(prefix="/user", tags=["User"])


def get_token_from_request(request: Request) -> str:
    auth_header = request.headers.get("authorization") or request.headers.get("Authorization") or ""
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return ""


def get_supabase_headers(user_token: str) -> Dict[str, str]:
    return {
        "apikey": settings.SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {user_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }


# ==============================================================================
# PROFILE ENDPOINTS
# ==============================================================================

@router.get("/profile", response_model=ProfileResponse)
async def get_user_profile(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get the authenticated user's profile.
    """
    user_token = get_token_from_request(request)
    supabase_url = settings.SUPABASE_URL.rstrip("/")

    if supabase_url and settings.SUPABASE_ANON_KEY and user_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    f"{supabase_url}/rest/v1/profiles?id=eq.{current_user.user_id}&select=*",
                    headers=get_supabase_headers(user_token)
                )
                if res.status_code == 200:
                    data = res.json()
                    if data and len(data) > 0:
                        p = data[0]
                        return ProfileResponse(
                            id=p.get("id", current_user.user_id),
                            full_name=p.get("full_name"),
                            email=p.get("email", current_user.email),
                            phone=p.get("phone"),
                            national_id=p.get("national_id"),
                            years_experience=p.get("years_experience", 0),
                            english_level=p.get("english_level", "intermedio"),
                            expected_salary_amount=p.get("expected_salary_amount", 0),
                            expected_salary_currency=p.get("expected_salary_currency", "CLP"),
                            base_cv_text=p.get("base_cv_text"),
                            plan=p.get("plan", current_user.plan),
                            daily_analyses_count=p.get("daily_analyses_count", 0),
                            created_at=p.get("created_at"),
                            updated_at=p.get("updated_at")
                        )
        except Exception as e:
            logger.error(f"Error querying Supabase profile: {e}")

    # Fallback if DB record doesn't exist yet
    return ProfileResponse(
        id=current_user.user_id,
        full_name=current_user.metadata.get("full_name") or current_user.metadata.get("name"),
        email=current_user.email,
        plan=current_user.plan
    )


@router.put("/profile", response_model=ProfileResponse)
async def update_user_profile(
    request: Request,
    payload: ProfileUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update or upsert candidate profile data.
    """
    user_token = get_token_from_request(request)
    supabase_url = settings.SUPABASE_URL.rstrip("/")

    update_dict = payload.model_dump(exclude_unset=True)
    update_dict["id"] = current_user.user_id
    update_dict["email"] = current_user.email or payload.email

    if supabase_url and settings.SUPABASE_ANON_KEY and user_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{supabase_url}/rest/v1/profiles?on_conflict=id",
                    headers={
                        **get_supabase_headers(user_token),
                        "Prefer": "resolution=merge-duplicates,return=representation"
                    },
                    json=update_dict
                )
                if res.status_code in (200, 201):
                    data = res.json()
                    if data and len(data) > 0:
                        p = data[0]
                        return ProfileResponse(
                            id=p.get("id", current_user.user_id),
                            full_name=p.get("full_name"),
                            email=p.get("email", current_user.email),
                            phone=p.get("phone"),
                            national_id=p.get("national_id"),
                            years_experience=p.get("years_experience", 0),
                            english_level=p.get("english_level", "intermedio"),
                            expected_salary_amount=p.get("expected_salary_amount", 0),
                            expected_salary_currency=p.get("expected_salary_currency", "CLP"),
                            base_cv_text=p.get("base_cv_text"),
                            plan=p.get("plan", current_user.plan),
                            daily_analyses_count=p.get("daily_analyses_count", 0),
                            created_at=p.get("created_at"),
                            updated_at=p.get("updated_at")
                        )
                else:
                    logger.warning(f"Supabase upsert profile response {res.status_code}: {res.text}")
        except Exception as e:
            logger.error(f"Error updating Supabase profile: {e}")

    return ProfileResponse(
        id=current_user.user_id,
        full_name=payload.full_name,
        email=current_user.email or payload.email,
        phone=payload.phone,
        national_id=payload.national_id,
        years_experience=payload.years_experience or 0,
        english_level=payload.english_level or "intermedio",
        expected_salary_amount=payload.expected_salary_amount or 0,
        expected_salary_currency=payload.expected_salary_currency or "CLP",
        base_cv_text=payload.base_cv_text,
        plan=current_user.plan
    )


# ==============================================================================
# APPLICATIONS & TRACKER ENDPOINTS
# ==============================================================================

@router.get("/applications", response_model=List[JobApplicationResponse])
async def list_job_applications(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Get all job applications tracked by the authenticated user.
    """
    user_token = get_token_from_request(request)
    supabase_url = settings.SUPABASE_URL.rstrip("/")

    if supabase_url and settings.SUPABASE_ANON_KEY and user_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    f"{supabase_url}/rest/v1/job_applications?user_id=eq.{current_user.user_id}&select=*,cv_versions(*)&order=created_at.desc",
                    headers=get_supabase_headers(user_token)
                )
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for item in data:
                        results.append(JobApplicationResponse(
                            id=item.get("id"),
                            user_id=item.get("user_id"),
                            company_name=item.get("company_name", ""),
                            job_title=item.get("job_title", ""),
                            job_portal=item.get("job_portal", "manual"),
                            job_url=item.get("job_url"),
                            ats_match_score=item.get("ats_match_score", 0),
                            status=item.get("status", "saved"),
                            applied_at=item.get("applied_at"),
                            notes=item.get("notes"),
                            created_at=item.get("created_at"),
                            updated_at=item.get("updated_at"),
                            cv_versions=item.get("cv_versions", [])
                        ))
                    return results
        except Exception as e:
            logger.error(f"Error fetching job applications: {e}")

    return []


@router.post("/applications", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
async def create_job_application(
    request: Request,
    payload: JobApplicationCreate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Create a new job application and optionally link adapted CV version & questions.
    """
    user_token = get_token_from_request(request)
    supabase_url = settings.SUPABASE_URL.rstrip("/")

    app_data = {
        "user_id": current_user.user_id,
        "company_name": payload.company_name,
        "job_title": payload.job_title,
        "job_portal": payload.job_portal or "manual",
        "job_url": payload.job_url,
        "ats_match_score": payload.ats_match_score or 0,
        "status": payload.status or "saved",
        "applied_at": payload.applied_at,
        "notes": payload.notes
    }

    if supabase_url and settings.SUPABASE_ANON_KEY and user_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    f"{supabase_url}/rest/v1/job_applications",
                    headers=get_supabase_headers(user_token),
                    json=app_data
                )
                if res.status_code in (200, 201):
                    created_apps = res.json()
                    if created_apps and len(created_apps) > 0:
                        created_app = created_apps[0]
                        app_id = created_app.get("id")

                        # If CV version is provided, insert it
                        cv_versions_list = []
                        if payload.cv_version and app_id:
                            cv_data = {
                                "application_id": app_id,
                                "user_id": current_user.user_id,
                                "cv_json": payload.cv_version.cv_json,
                                "interview_questions": payload.cv_version.interview_questions or [],
                                "cover_letter": payload.cv_version.cover_letter,
                                "ats_gaps": payload.cv_version.ats_gaps or []
                            }
                            cv_res = await client.post(
                                f"{supabase_url}/rest/v1/cv_versions",
                                headers=get_supabase_headers(user_token),
                                json=cv_data
                            )
                            if cv_res.status_code in (200, 201):
                                cv_versions_list = cv_res.json()

                        return JobApplicationResponse(
                            id=app_id,
                            user_id=created_app.get("user_id"),
                            company_name=created_app.get("company_name"),
                            job_title=created_app.get("job_title"),
                            job_portal=created_app.get("job_portal"),
                            job_url=created_app.get("job_url"),
                            ats_match_score=created_app.get("ats_match_score", 0),
                            status=created_app.get("status", "saved"),
                            applied_at=created_app.get("applied_at"),
                            notes=created_app.get("notes"),
                            created_at=created_app.get("created_at"),
                            updated_at=created_app.get("updated_at"),
                            cv_versions=cv_versions_list
                        )
                else:
                    logger.error(f"Error creating job application in Supabase: {res.status_code} {res.text}")
                    raise HTTPException(status_code=500, detail="Failed to save job application in Supabase.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Unexpected error creating application: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    # Mock response if Supabase is offline
    import uuid
    mock_id = str(uuid.uuid4())
    return JobApplicationResponse(
        id=mock_id,
        user_id=current_user.user_id,
        company_name=payload.company_name,
        job_title=payload.job_title,
        job_portal=payload.job_portal or "manual",
        job_url=payload.job_url,
        ats_match_score=payload.ats_match_score or 0,
        status=payload.status or "saved",
        notes=payload.notes
    )


@router.patch("/applications/{app_id}", response_model=JobApplicationResponse)
async def update_job_application(
    app_id: str,
    request: Request,
    payload: JobApplicationUpdate,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Update a job application's status, notes, or details.
    """
    user_token = get_token_from_request(request)
    supabase_url = settings.SUPABASE_URL.rstrip("/")
    update_data = payload.model_dump(exclude_unset=True)

    if supabase_url and settings.SUPABASE_ANON_KEY and user_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.patch(
                    f"{supabase_url}/rest/v1/job_applications?id=eq.{app_id}&user_id=eq.{current_user.user_id}",
                    headers=get_supabase_headers(user_token),
                    json=update_data
                )
                if res.status_code == 200:
                    data = res.json()
                    if data and len(data) > 0:
                        item = data[0]
                        return JobApplicationResponse(
                            id=item.get("id"),
                            user_id=item.get("user_id"),
                            company_name=item.get("company_name", ""),
                            job_title=item.get("job_title", ""),
                            job_portal=item.get("job_portal", "manual"),
                            job_url=item.get("job_url"),
                            ats_match_score=item.get("ats_match_score", 0),
                            status=item.get("status", "saved"),
                            applied_at=item.get("applied_at"),
                            notes=item.get("notes"),
                            created_at=item.get("created_at"),
                            updated_at=item.get("updated_at")
                        )
                else:
                    logger.error(f"Error updating application: {res.status_code} {res.text}")
                    raise HTTPException(status_code=400, detail="Failed to update application.")
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update application endpoint: {e}")
            raise HTTPException(status_code=500, detail=str(e))

    return JobApplicationResponse(
        id=app_id,
        user_id=current_user.user_id,
        company_name=payload.company_name or "Application",
        job_title=payload.job_title or "Role",
        status=payload.status or "saved"
    )


@router.delete("/applications/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_job_application(
    app_id: str,
    request: Request,
    current_user: CurrentUser = Depends(get_current_user)
):
    """
    Delete a job application by ID.
    """
    user_token = get_token_from_request(request)
    supabase_url = settings.SUPABASE_URL.rstrip("/")

    if supabase_url and settings.SUPABASE_ANON_KEY and user_token:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.delete(
                    f"{supabase_url}/rest/v1/job_applications?id=eq.{app_id}&user_id=eq.{current_user.user_id}",
                    headers=get_supabase_headers(user_token)
                )
                if res.status_code in (200, 204):
                    return None
                else:
                    logger.error(f"Failed to delete application {app_id}: {res.status_code} {res.text}")
        except Exception as e:
            logger.error(f"Error deleting application {app_id}: {e}")

    return None
