from __future__ import annotations

import json
import logging
from collections import defaultdict
from typing import Any

from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        self._connections: dict[str, dict[str, WebSocket]] = defaultdict(dict)

    async def connect(self, websocket: WebSocket, thread_id: str, user_id: str):
        await websocket.accept()
        self._connections[thread_id][user_id] = websocket
        logger.info("[WS] User %s connected to thread %s", user_id, thread_id)

    async def disconnect(self, thread_id: str, user_id: str):
        self._connections[thread_id].pop(user_id, None)
        if not self._connections[thread_id]:
            del self._connections[thread_id]
        logger.info("[WS] User %s disconnected from thread %s", user_id, thread_id)

    def get_online_users(self, thread_id: str) -> list[str]:
        return list(self._connections.get(thread_id, {}).keys())

    async def broadcast_to_thread(
        self,
        thread_id: str,
        message: dict[str, Any],
        exclude_user: str | None = None,
    ):
        raw = json.dumps(message)
        for uid, ws in list(self._connections.get(thread_id, {}).items()):
            if uid == exclude_user:
                continue
            try:
                await ws.send_text(raw)
            except Exception:
                logger.warning("[WS] Failed to send to user %s in thread %s", uid, thread_id)

    async def broadcast_typing(
        self,
        thread_id: str,
        user_id: str,
        user_name: str,
        is_typing: bool,
    ):
        await self.broadcast_to_thread(
            thread_id,
            {
                "type": "typing",
                "user_id": user_id,
                "user_name": user_name,
                "is_typing": is_typing,
            },
            exclude_user=user_id,
        )


manager = ConnectionManager()
