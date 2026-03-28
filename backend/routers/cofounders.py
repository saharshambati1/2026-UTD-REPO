from fastapi import APIRouter, Depends, HTTPException

from core.auth import CurrentUser, get_current_user
from schemas import CofounderSearchRequest
from services.cofounder_service import cofounder_service


router = APIRouter(prefix="/api/cofounders", tags=["cofounders"])


@router.post("/search")
def search_cofounders(payload: CofounderSearchRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return cofounder_service.search_cofounders(current_user.id, payload)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc