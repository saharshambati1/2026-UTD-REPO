from __future__ import annotations

from core.database import get_supabase
from services.linking_service import linking_service
from services.startup_service import startup_service
from services.template_service import template_service

supabase = get_supabase()
class RoadmapService:
    def generate_roadmap(self, user_id: str, payload):
        startup = startup_service.get_startup_profile(payload.startup_profile_id)
        templates = template_service.get_templates_by_ids(payload.template_ids)

        rag_payload = {
            "task": "startup_20_week_roadmap",
            "startup": startup,
            "templates": templates,
            "instructions": {
                "weeks": 20,
                "include_product_build": True,
                "include_distribution_plan": True,
                "include_investor_readiness": True,
                "include_kpis": True,
                "include_deliverables": True,
                "goal": payload.custom_goal,
                "return_json": True,
            },
        }

        result = linking_service.generate_rag(rag_payload)

        roadmap_res = (
            supabase.table("startup_roadmaps")
            .insert({
                "startup_profile_id": payload.startup_profile_id,
                "compared_template_ids": payload.template_ids,
                "roadmap_title": f"20-week roadmap for {startup['idea_name']}",
                "roadmap_result": result,
                "created_by": user_id,
            })
            .execute()
        )
        roadmap = roadmap_res.data[0]

        distribution_result = result.get("distribution_plan", {}) if isinstance(result, dict) else {}
        readiness_result = result.get("funding_readiness", {}) if isinstance(result, dict) else {}

        supabase.table("startup_distribution_plans").insert({
            "startup_profile_id": payload.startup_profile_id,
            "roadmap_id": roadmap["id"],
            "distribution_channel": startup.get("distribution_channel"),
            "plan_result": distribution_result,
            "created_by": user_id,
        }).execute()

        supabase.table("startup_funding_readiness").insert({
            "startup_profile_id": payload.startup_profile_id,
            "roadmap_id": roadmap["id"],
            "readiness_score": readiness_result.get("score"),
            "readiness_summary": readiness_result.get("summary"),
            "readiness_result": readiness_result,
            "created_by": user_id,
        }).execute()

        return roadmap


roadmap_service = RoadmapService()