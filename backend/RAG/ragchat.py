import os
from fastapi import APIRouter, BackgroundTasks, HTTPException
from openai import AsyncOpenAI

# Import only the RAG schemas
from schemas import RoadmapRequest, DynamicStartupResponse

# Import your synchronous Supabase wrappers
from core.database import select_rows, insert_rows, update_rows

# Initialize OpenAI
openai = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Your router is perfectly configured here
router = APIRouter(prefix="/rag-chat", tags=["RAG"])


# ==========================================
# BACKGROUND WORKER (RAG Engine Update)
# ==========================================
async def background_rag_update(org_id: str, author_id: str, user_prompt: str, current_summary: str):
    try:
        # 1. Embed and log the raw prompt
        prompt_res = await openai.embeddings.create(input=user_prompt, model="text-embedding-3-small")
        insert_rows("organization_context_log", [{
            "org_id": org_id,
            "author_id": author_id,
            "update_content": user_prompt,
            "update_embedding": prompt_res.data[0].embedding
        }])

        # 2. Generate and embed the new summary
        summary_res = await openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": f"Old Summary: {current_summary}\nNew Update: {user_prompt}\nWrite a single, updated paragraph summarizing this organization."}]
        )
        new_summary = summary_res.choices[0].message.content
        new_summary_res = await openai.embeddings.create(input=new_summary, model="text-embedding-3-small")

        # 3. Overwrite the Master Anchor
        update_rows("organizations", "id", org_id, {
            "current_state_summary": new_summary,
            "summary_embedding": new_summary_res.data[0].embedding
        })
    except Exception as e:
        print(f"Background Task Failed: {e}")


# ==========================================
# ENDPOINT 1: AI ROADMAP GENERATOR
# ==========================================
@router.post("/roadmap", response_model=DynamicStartupResponse)
async def generate_dynamic_roadmap(request: RoadmapRequest, background_tasks: BackgroundTasks):
    
    # 1. Fetch Anchor
    org_data = select_rows("organizations", filters={"id": request.org_id}, limit=1)
    if not org_data:
        raise HTTPException(status_code=404, detail="Organization not found")
    current_summary = org_data[0].get("current_state_summary") or "A newly formed project."

    # 2. Fetch History
    log_data = select_rows("organization_context_log", filters={"org_id": request.org_id}, limit=5, order_by="created_at", order_desc=True)
    historical_context = "\n".join([log["update_content"] for log in log_data])

    # 3. Fetch Template
    template_context = ""
    if request.template_id:
        template_data = select_rows("templates", filters={"id": request.template_id}, limit=1)
        if template_data:
            t = template_data[0]
            template_context = f"Template {t['name']}:\n{t['content']}"

    # 4. Generate AI Output
    system_prompt = f"""
    You are an elite startup accelerator architect.
    State: {current_summary}
    History: {historical_context}
    {template_context}
    Input: {request.user_prompt}
    
    If it's a question, answer it (intent: 'question_answer'). 
    If it requires a structural plan, generate a highly detailed 20-week roadmap (intent: 'update_roadmap').
    """
    
    completion = await openai.beta.chat.completions.parse(
        model="gpt-4o-2024-08-06",
        messages=[{"role": "system", "content": system_prompt}],
        response_format=DynamicStartupResponse,
    )

    # 5. Background Task Trigger
    background_tasks.add_task(background_rag_update, request.org_id, request.author_id, request.user_prompt, current_summary)

    return completion.choices[0].message.parsed