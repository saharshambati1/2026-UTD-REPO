import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
 
from core.websocket_manager import manager
from core.deps import get_db_sync, verify_token 
from services import chat_service as svc
 
router = APIRouter(tags=["WebSocket"])
logger = logging.getLogger(__name__)

@router.websocket("/ws/{thread_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    thread_id: str,
    token: str = Query(...),
):
    # ── Auth ─────────────────────────────────────────────────
    user = await verify_token(token)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
 
    user_id   = str(user["id"])
    user_name = user["full_name"]
 
    
    db = get_db_sync()
 
    
    await manager.connect(websocket, thread_id, user_id)
    await svc.update_presence(db, user_id, "online")
 
    
    await manager.broadcast_to_thread(thread_id, {
        "type": "presence",
        "user_id": user_id,
        "user_name": user_name,
        "status": "online",
        "online_users": manager.get_online_users(thread_id),
    }, exclude_user=user_id)
 
    try:
        while True:
            raw = await websocket.receive_text()
 
            try:
                payload = json.loads(raw)
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({"type": "error", "detail": "Invalid JSON"}))
                continue
 
            msg_type = payload.get("type")
 
            
            if msg_type == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
 
            
            elif msg_type == "message":
                content      = payload.get("content", "").strip()
                reply_to     = payload.get("reply_to")
                is_anonymous = payload.get("is_anonymous", False)
 
                if not content:
                    await websocket.send_text(json.dumps({"type": "error", "detail": "Empty message"}))
                    continue
 
                try:
                    msg = await svc.send_message(db, user_id, thread_id, content, reply_to, is_anonymous)
                    await manager.broadcast_to_thread(thread_id, {
                        "type": "message",
                        "data": {
                            **msg,
                            "sender_name": "Anonymous" if is_anonymous else user_name,
                        },
                    })
                except PermissionError as e:
                    await websocket.send_text(json.dumps({"type": "error", "detail": str(e)}))
 
            
            elif msg_type == "typing":
                is_typing = bool(payload.get("is_typing", False))
                await svc.set_typing(db, user_id, thread_id, is_typing)
                await manager.broadcast_typing(thread_id, user_id, user_name, is_typing)
 
            
            elif msg_type == "presence":
                new_status = payload.get("status", "online")
                await svc.update_presence(db, user_id, new_status)
                await manager.broadcast_to_thread(thread_id, {
                    "type": "presence",
                    "user_id": user_id,
                    "user_name": user_name,
                    "status": new_status,
                }, exclude_user=user_id)
 
            # ── Mark thread as read ───────────────────────────
            elif msg_type == "read":
                last_msg_id = payload.get("last_message_id")
                if last_msg_id:
                    await svc.mark_thread_read(db, user_id, thread_id, last_msg_id)
 
            else:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "detail": f"Unknown message type: {msg_type}",
                }))
 
    except WebSocketDisconnect:
        logger.info(f"[WS] User {user_id} disconnected from thread {thread_id}")
 
    finally:
        await manager.disconnect(thread_id, user_id)
        await svc.set_typing(db, user_id, thread_id, False)   # clear any lingering typing
        await svc.update_presence(db, user_id, "offline")
 
        await manager.broadcast_to_thread(thread_id, {
            "type": "presence",
            "user_id": user_id,
            "status": "offline",
            "online_users": manager.get_online_users(thread_id),
        })
 