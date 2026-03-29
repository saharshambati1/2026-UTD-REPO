from RAG.processor import extract_text_from_pdf, get_embedding
from core.database import execute_rpc, select_rows, insert_rows, upsert_rows
from openai import OpenAI
from core.config import settings

client = OpenAI(api_key=settings.OPENAI_API_KEY)

class ResearchService:
    @staticmethod
    async def process_and_match(user_id: str, file_bytes: bytes):
        # 1. Extract & Embed Student Resume
        resume_text = extract_text_from_pdf(file_bytes)
        embedding = await get_embedding(resume_text)

        # 2. Update Student Profile
        await upsert_rows("users", [{"id": user_id, "profile_embedding": embedding}])

        # 3. Vector Match via Supabase RPC
        matched_profs = await execute_rpc("match_research_labs", {"student_embedding": embedding})

        # 4. Attach Papers to each Match
        for prof in matched_profs:
            prof['recent_papers'] = await select_rows("professor_papers", {"professor_id": prof['professor_id']})
        
        return matched_profs

    @staticmethod
    async def generate_paper_email(student_id: str, prof_id: str, paper_id: str):
        # Fetch Context
        s = (await select_rows("users", {"id": student_id}, limit=1))[0]
        p = (await select_rows("professors", {"id": prof_id}, limit=1))[0]
        paper = (await select_rows("professor_papers", {"id": paper_id}, limit=1))[0]

        # AI Cold Email Prompt
        prompt = f"""
        Write a cold email from {s['full_name']} to Prof. {p['full_name']} regarding their paper: "{paper['title']}".
        Reference this abstract: {paper['abstract']}.
        Student skills: {s['skills']}. 
        Connect a specific skill to a technical detail in the abstract. 
        Goal: Request a 15-min meeting. Max 180 words.
        """

        response = client.chat.completions.create(model="gpt-4o", messages=[{"role": "user", "content": prompt}])
        email_content = response.choices[0].message.content

        # Save record
        await insert_rows("research_applications", [{
            "student_id": student_id, "professor_id": prof_id, 
            "paper_id": paper_id, "generated_email_content": email_content
        }])

        return email_content