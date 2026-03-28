from fastapi import APIRouter, Depends, HTTPException, Query

from core.auth import CurrentUser, get_current_user
from schemas import InvestorCreateOutreachLinkRequest, InvestorMatchRequest
from services.investor_service import investor_service


router = APIRouter(prefix="/api/investors", tags=["investors"])


@router.get("")
def list_investors(limit: int = Query(default=50, le=100), current_user: CurrentUser = Depends(get_current_user)):
    return investor_service.list_investors(limit=limit)


@router.get("/{investor_id}")
def get_investor(investor_id: str, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return investor_service.get_investor_with_portfolio(investor_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post("/match")
def match_investors(payload: InvestorMatchRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return investor_service.match_investors(current_user.id, payload)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("/outreach-link")
def create_outreach_link(payload: InvestorCreateOutreachLinkRequest, current_user: CurrentUser = Depends(get_current_user)):
    try:
        return investor_service.create_outreach_link(current_user.id, payload)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc