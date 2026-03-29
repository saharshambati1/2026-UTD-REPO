from __future__ import annotations

from core.database import get_supabase
from services.startup_service import startup_service

supabase = get_supabase()

class InvestorService:
    def list_investors(self, limit: int = 50):
        res = (
            supabase.table("investors")
            .select("*")
            .order("updated_at", desc=True)
            .limit(limit)
            .execute()
        )
        return res.data or []

    def get_investor_with_portfolio(self, investor_id: str):
        investor_res = (
            supabase.table("investors")
            .select("*")
            .eq("id", investor_id)
            .limit(1)
            .execute()
        )
        investor = investor_res.data[0] if investor_res.data else None
        if not investor:
            raise ValueError("Investor not found")

        portfolio_res = (
            supabase.table("investor_startup_investments")
            .select("*")
            .eq("investor_id", investor_id)
            .order("created_at", desc=True)
            .execute()
        )

        return {
            "investor": investor,
            "portfolio": portfolio_res.data or [],
        }

    def match_investors(self, user_id: str, payload):
        supabase = get_supabase()
        startup = startup_service.get_startup_profile(payload.startup_profile_id)
        investors = self.list_investors(limit=max(payload.limit * 5, 25))

        industry = (startup.get("industry") or "").lower()
        stage = (startup.get("funding_stage") or "idea").lower()
        distribution = (startup.get("distribution_channel") or "").lower()

        ranked = []
        for investor in investors:
            sectors = [str(x).lower() for x in (investor.get("sector_focus") or [])]
            stages = [str(x).lower() for x in (investor.get("stage_focus") or [])]
            thesis = (investor.get("thesis") or "").lower()

            sector_score = 1.0 if any(industry in s or s in industry for s in sectors) else 0.3
            stage_score = 1.0 if any(stage in s or s in stage for s in stages) else 0.4
            thesis_score = 0.8 if distribution and distribution in thesis else 0.3
            total = round((sector_score * 0.45) + (stage_score * 0.35) + (thesis_score * 0.20), 3)

            ranked.append({
                "investor_id": investor["id"],
                "name": investor["name"],
                "firm_name": investor.get("firm_name"),
                "photo_url": investor.get("photo_url"),
                "description": investor.get("description"),
                "score": total,
            })

        ranked.sort(key=lambda x: x["score"], reverse=True)
        ranked = ranked[: payload.limit]

        for row in ranked:
            supabase.table("startup_investor_matches").upsert({
                "startup_profile_id": payload.startup_profile_id,
                "investor_id": row["investor_id"],
                "score": row["score"],
                "rationale": "Matched by stage, sector, and distribution fit",
                "match_payload": row,
                "created_by": user_id,
            }).execute()

        return {"matches": ranked}

    def create_outreach_link(self, user_id: str, payload):
        res = (
            supabase.table("investor_outreach_threads")
            .upsert({
                "startup_profile_id": payload.startup_profile_id,
                "investor_id": payload.investor_id,
                "thread_id": payload.thread_id,
                "created_by": user_id,
            })
            .execute
        )
        return res.data[0]


investor_service = InvestorService()