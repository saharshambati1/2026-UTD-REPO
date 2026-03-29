from __future__ import annotations

from core.database import get_supabase
from core.errors import BadRequestError

class TemplateService:
    def list_templates(self):
        supabase = get_supabase()
        res = (
            supabase.table("templates")
            .select("id,name,description,distribution_channel,created_at")
            .order("created_at", desc=True)
            .execute()
        )
        return res.data or []

    def get_templates_by_ids(self, template_ids: list[str]):
        if not template_ids:
            return []
        supabase = get_supabase()
        res = (
            supabase.table("templates")
            .select("id,name,description,distribution_channel")
            .in_("id", template_ids)
            .execute()
        )
        return res.data or []

    def compare_templates(self, template_ids: list[str]):
        if len(template_ids) < 2:
            raise BadRequestError("Select at least 2 templates to compare")

        templates = self.get_templates_by_ids(template_ids)
        comparison = []
        for row in templates:
            comparison.append({
                "id": row["id"],
                "name": row["name"],
                "description": row["description"],
                "distribution_channel": row["distribution_channel"],
            })
        return {"templates": comparison}


template_service = TemplateService()