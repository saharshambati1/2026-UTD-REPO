from __future__ import annotations

from core.database import get_supabase
from services.startup_service import startup_service

supabase = get_supabase()
class CofounderService:
    def search_cofounders(self, user_id: str, payload):
        startup = startup_service.get_startup_profile(payload.startup_profile_id)

        users_res = (
            supabase.table("users")
            .select("id,full_name,email,avatar_url,major,skills,interests,is_verified,reputation_score")
            .eq("is_verified", True)
            .neq("id", user_id)
            .limit(payload.limit * 5)
            .execute()
        )
        users = users_res.data or []

        needed_roles = [r.lower() for r in payload.needed_roles]
        matches = []

        for user in users:
            skills = [str(s).lower() for s in (user.get("skills") or [])]
            interests = [str(i).lower() for i in (user.get("interests") or [])]

            skill_score = 0.0
            for role in needed_roles:
                if any(role in skill or skill in role for skill in skills):
                    skill_score += 1.0
            if needed_roles:
                skill_score = skill_score / len(needed_roles)

            founder_interest = 1.0 if any(i in ["startup", "founder", "building", "entrepreneurship"] for i in interests) else 0.25
            rep_score = min(float(user.get("reputation_score") or 0) / 100.0, 1.0)

            total = round((skill_score * 0.6) + (founder_interest * 0.25) + (rep_score * 0.15), 3)

            matches.append({
                "user_id": user["id"],
                "name": user["full_name"],
                "photo_url": user.get("avatar_url"),
                "description": f"{user.get('major') or ''} | Skills: {', '.join(user.get('skills') or [])}",
                "skills": user.get("skills") or [],
                "interests": user.get("interests") or [],
                "score": total,
            })

        matches.sort(key=lambda x: x["score"], reverse=True)
        matches = matches[: payload.limit]

        saved = (
            supabase.table("startup_cofounder_searches")
            .insert({
                "startup_profile_id": payload.startup_profile_id,
                "searched_by": user_id,
                "needed_roles": payload.needed_roles,
                "search_result": {"matches": matches, "startup": startup},
            })
            .execute()
        )

        return saved.data[0]


cofounder_service = CofounderService()