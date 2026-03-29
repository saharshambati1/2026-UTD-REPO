from __future__ import annotations
import requests
from core.config import settings

class LinkingService:
    def generate_rag(self, payload: dict) -> dict:
        response = requests.post(
            f"{settings.RAG_SERVICE_URL}/generate",
            json=payload,
            headers={"x-internal-api-key": settings.INTERNAL_API_KEY},
            timeout=90,
        )
        response.raise_for_status()
        return response.json()

# ADD THIS LINE AT THE VERY BOTTOM
linking_service = LinkingService()
