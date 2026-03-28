from fastapi import APIRouter, Depends, HTTPException

from core.auth import CurrentUser, get_current_user
from core.errors import NotFoundError
from schemas import StartupProfileCreateRequest, StartupTemplateSelectionRequest
from services.startup_service import startup_service


router = APIRouter(prefix="/api/startups", tags=["startups"])


@router.post("/profile")
def create_startup_profile(payload: StartupProfileCreateRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return startup_service.create_startup_profile(current_user.id, payload)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/profile/{startup_profile_id}")
def get_startup_profile(startup_profile_id: str, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return startup_service.get_startup_profile(startup_profile_id)
    except NotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/profile/templates")
def save_template_selections(payload: StartupTemplateSelectionRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return startup_service.save_template_selections(current_user.id, payload)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc