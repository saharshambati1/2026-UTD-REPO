from __future__ import annotations

from typing import Any

import jwt
from fastapi import Depends, Header, HTTPException, status

from core.config import settings


class CurrentUser(dict):
    @property
    def id(self) -> str:
        return self.get("sub", "")


def parse_bearer_token(authorization: str | None) -> str:
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")
    prefix = "Bearer "
    if not authorization.startswith(prefix):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Authorization header")
    return authorization[len(prefix):]


def decode_supabase_jwt(token: str) -> dict[str, Any]:
    try:
        return jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token: {exc}") from exc


async def get_current_user(authorization: str | None = Header(default=None)) -> CurrentUser:
    token = parse_bearer_token(authorization)
    payload = decode_supabase_jwt(token)
    return CurrentUser(payload)