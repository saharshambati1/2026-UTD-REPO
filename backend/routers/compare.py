from fastapi import APIRouter, Depends, HTTPException

from core.auth import CurrentUser, get_current_user
from schemas import StartupCompareRequest
from services.compare_service import compare_service


router = APIRouter(prefix="/api/compare", tags=["compare"])


@router.post("/startup")
def compare_startup(payload: StartupCompareRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return compare_service.compare_startup_to_templates(current_user.id, payload)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc