from __future__ import annotations

from typing import Any

import jwt
from fastapi import Depends, Header, HTTPException, Query, status

from core.config import settings
from core.database import get_supabase
from core.auth import CurrentUser, parse_bearer_token, decode_supabase_jwt


async def get_current_user(
    authorization: str | None = Header(default=None),
) -> CurrentUser:
    token = parse_bearer_token(authorization)
    payload = decode_supabase_jwt(token)
    return CurrentUser(payload)


def get_db():
    return get_supabase()


def get_db_sync():
    return get_supabase()


async def verify_token(token: str) -> dict | None:
    try:
        payload = decode_supabase_jwt(token)
        user_id = payload.get("sub")
        if not user_id:
            return None
        db = get_supabase()
        res = db.table("users").select("id,full_name").eq("id", user_id).limit(1).execute()
        if not res.data:
            return None
        return res.data[0]
    except Exception:
        return None
