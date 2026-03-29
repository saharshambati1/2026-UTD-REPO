from __future__ import annotations

from core.database import get_supabase
from core.errors import NotFoundError, BadRequestError

supabase = get_supabase()


class StartupService:
    def create_startup_profile(self, user_id: str, payload):
        row = {
            "created_by": user_id,
            "organization_id": payload.organization_id,
            "idea_name": payload.idea_name,
            "one_liner": payload.one_liner,
            "problem": payload.problem,
            "target_customer": payload.target_customer,
            "industry": payload.industry,
            "business_model": payload.business_model,
            "distribution_channel": payload.distribution_channel,
            "funding_stage": payload.funding_stage,
            "current_stage": payload.current_stage,
            "product_state": payload.product_state,
            "traction_summary": payload.traction_summary,
            "goals_20_weeks": payload.goals_20_weeks,
        }
        res = supabase.table("startup_profiles").insert(row).execute()
        if not res.data:
            raise BadRequestError("Failed to create startup profile")
        return res.data[0]

    def get_startup_profile(self, startup_profile_id: str):
        res = (
            supabase.table("startup_profiles")
            .select("*")
            .eq("id", startup_profile_id)
            .limit(1)
            .execute()
        )
        if not res.data:
            raise NotFoundError(f"Startup profile {startup_profile_id} not found")
        return res.data[0]


    def save_template_selections(self, user_id: str, payload):
        supabase = get_supabase()
        records = []
        for template_id in payload.template_ids:
            records.append({
                "startup_profile_id": payload.startup_profile_id,
                "template_id": template_id,
                "selected_by": user_id,
                "selection_reason": payload.selection_reason,
            })

        if records:
            supabase.table("startup_template_selections").upsert(records).execute()

        selected = (
            supabase.table("startup_template_selections")
            .select("id,startup_profile_id,template_id,selection_reason,created_at")
            .eq("startup_profile_id", payload.startup_profile_id)
            .execute()
        )
        return selected.data or []


startup_service = StartupService()




