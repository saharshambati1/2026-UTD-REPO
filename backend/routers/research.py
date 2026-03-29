from fastapi import APIRouter, UploadFile, File, HTTPException
from services.research_service import ResearchService

router = APIRouter(prefix="/research", tags=["Research Hub"])

@router.post("/match/{user_id}")
async def onboard_and_match(user_id: str, file: UploadFile = File(...)):
    """Upload resume, get top 10 matches + their papers."""
    content = await file.read()
    return await ResearchService.process_and_match(user_id, content)

