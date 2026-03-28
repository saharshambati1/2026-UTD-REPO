from fastapi import APIRouter, Depends, HTTPException

from core.auth import CurrentUser, get_current_user
from schemas import RoadmapGenerateRequest
from services.roadmap_service import roadmap_service


router = APIRouter(prefix="/api/roadmap", tags=["roadmap"])


@router.post("/generate")
def generate_roadmap(payload: RoadmapGenerateRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return roadmap_service.generate_roadmap(current_user.id, payload)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc