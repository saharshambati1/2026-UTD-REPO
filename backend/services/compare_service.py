from __future__ import annotations

from core.database import get_supabase
from core.errors import NotFoundError
from services.linking_service import linking_service
from services.startup_service import startup_service
from services.template_service import template_service

class CompareService:
    def compare_startup_to_templates(self, user_id: str, payload):
        supabase = get_supabase()
        startup = startup_service.get_startup_profile(payload.startup_profile_id)
        templates = template_service.get_templates_by_ids(payload.template_ids)
        if not templates:
            raise NotFoundError("No templates found")

        rag_payload = {
            "task": "startup_template_comparison",
            "startup": startup,
            "templates": templates,
            "instructions": {
                "compare_distribution": True,
                "compare_business_model": True,
                "compare_investor_fit": True,
                "compare_team_shape": True,
                "return_json": True,
            },
        }

        result = linking_service.generate_rag(rag_payload)

        saved = (
            supabase.table("startup_comparisons")
            .insert({
                "startup_profile_id": payload.startup_profile_id,
                "compared_template_ids": payload.template_ids,
                "comparison_title": f"Comparison for {startup['idea_name']}",
                "comparison_result": result,
                "created_by": user_id,
            })
            .execute()
        )
        return saved.data[0]


compare_service = CompareService()