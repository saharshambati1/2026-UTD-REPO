from fastapi import APIRouter, Depends, HTTPException

from core.auth import CurrentUser, get_current_user
from core.errors import BadRequestError
from schemas import TemplateCompareRequest
from services.template_service import template_service


router = APIRouter(prefix="/api/templates", tags=["templates"])


@router.get("")
def list_templates(current_user: CurrentUser = Depends(get_current_user)):
    return template_service.list_templates()


@router.post("/compare")
def compare_templates(payload: TemplateCompareRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return template_service.compare_templates(payload.template_ids)
    except BadRequestError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc