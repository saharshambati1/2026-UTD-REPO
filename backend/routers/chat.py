from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from core.deps import get_current_user, get_db          
from services import chat_service as svc
 
router = APIRouter(prefix="/chat", tags=["Chat"])
class CreateCommunityRequest(BaseModel):
    name: str              = Field(..., min_length=2, max_length=80)
    description: str       = Field("", max_length=500)
    kind: str              = Field(..., pattern="^(major|club|dorm|event|custom)$")
    org_id: Optional[str]  = None
    event_id: Optional[str]= None
    is_public: bool        = True
 
class CreateChannelRequest(BaseModel):
    name: str        = Field(..., min_length=1, max_length=50)
    description: str = Field("", max_length=200)
    is_readonly: bool = False
 
class CreateThreadRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
 
class SendMessageRequest(BaseModel):
    content: str              = Field(..., min_length=1, max_length=4000)
    reply_to: Optional[str]   = None
    is_anonymous: bool        = False
 
class EditMessageRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=4000)
 
class ReactionRequest(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=10)
 
class MarkReadRequest(BaseModel):
    last_message_id: str
 
class TypingRequest(BaseModel):
    is_typing: bool

def _handle(func):
    import functools
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        try:
            return await func(*args, **kwargs)
        except PermissionError as e:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return wrapper

@router.post("/communities", status_code=201)
@_handle
async def create_community(
    body: CreateCommunityRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.create_community(
        db, user.id, body.name, body.description,
        body.kind, body.org_id, body.event_id, body.is_public,
    )
 
 
@router.get("/communities")
async def list_communities(
    kind: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, le=50),
    offset: int = Query(0, ge=0),
    db=Depends(get_db),
):
    return await svc.list_communities(db, kind, search, limit, offset)
 
 
@router.get("/communities/{community_id}")
async def get_community(community_id: str, db=Depends(get_db)):
    result = await svc.get_community_detail(db, community_id)
    if not result:
        raise HTTPException(404, "Community not found")
    return result
 
 
@router.post("/communities/{community_id}/join", status_code=201)
@_handle
async def join_community(
    community_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.join_community(db, user.id, community_id)
 
 
@router.delete("/communities/{community_id}/leave", status_code=204)
async def leave_community(
    community_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    await svc.leave_community(db, user.id, community_id)

@router.get("/communities/{community_id}/channels")
async def get_channels(community_id: str, db=Depends(get_db)):
    return await svc.get_channels(db, community_id)
 
 
@router.post("/communities/{community_id}/channels", status_code=201)
@_handle
async def create_channel(
    community_id: str,
    body: CreateChannelRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.create_channel(
        db, user.id, community_id, body.name, body.description, body.is_readonly
    )

@router.get("/channels/{channel_id}/threads")
async def list_threads(
    channel_id: str,
    limit: int = Query(30, le=100),
    offset: int = Query(0, ge=0),
    db=Depends(get_db),
):
    return await svc.list_threads_for_channel(db, channel_id, limit, offset)
 
 
@router.post("/channels/{channel_id}/threads", status_code=201)
@_handle
async def create_community_thread(
    channel_id: str,
    body: CreateThreadRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.create_community_thread(db, user.id, channel_id, body.title)
 
 
@router.post("/events/{event_id}/threads", status_code=201)
@_handle
async def create_event_thread(
    event_id: str,
    body: CreateThreadRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.create_event_thread(db, user.id, event_id, body.title)
 
 
@router.get("/dm/{partner_id}")
@_handle
async def get_or_create_dm(
    partner_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.get_or_create_dm_thread(db, user.id, partner_id)
 
 
@router.get("/dm")
async def list_dms(user=Depends(get_current_user), db=Depends(get_db)):
    return await svc.list_dm_threads(db, user.id)

@router.get("/threads/{thread_id}/messages")
async def get_messages(
    thread_id: str,
    limit: int = Query(50, le=100),
    before: Optional[str] = Query(None, description="ISO timestamp cursor"),
    db=Depends(get_db),
):
    return await svc.get_messages(db, thread_id, limit, before)
 
 
@router.post("/threads/{thread_id}/messages", status_code=201)
@_handle
async def send_message(
    thread_id: str,
    body: SendMessageRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.send_message(
        db, user.id, thread_id, body.content, body.reply_to, body.is_anonymous
    )
 
 
@router.patch("/messages/{message_id}")
@_handle
async def edit_message(
    message_id: str,
    body: EditMessageRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.edit_message(db, user.id, message_id, body.content)
 
 
@router.delete("/messages/{message_id}", status_code=204)
@_handle
async def delete_message(
    message_id: str,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    await svc.delete_message(db, user.id, message_id)
 
 
@router.post("/messages/{message_id}/react")
@_handle
async def react_to_message(
    message_id: str,
    body: ReactionRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    return await svc.add_reaction(db, user.id, message_id, body.emoji)

@router.post("/threads/{thread_id}/read", status_code=204)
async def mark_read(
    thread_id: str,
    body: MarkReadRequest,
    user=Depends(get_current_user),
    db=Depends(get_db),
):
    await svc.mark_thread_read(db, user.id, thread_id, body.last_message_id)
 
 
@router.get("/unread")
async def unread_counts(user=Depends(get_current_user), db=Depends(get_db)):
    return await svc.get_unread_counts(db, user.id)