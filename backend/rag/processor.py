import fitz  
from openai import OpenAI
from core.config import get_settings

settings = get_settings()
client = OpenAI(api_key=settings.openai_api_key)

def extract_text_from_pdf(pdf_content: bytes) -> str:
    text = ""
    with fitz.open(stream=pdf_content, filetype="pdf") as doc:
        for page in doc:
            text += page.get_text()
    return text

async def get_embedding(text: str) -> list[float]:
    clean_text = text.replace("\n", " ")[:8000]
    response = client.embeddings.create(input=[clean_text], model="text-embedding-3-small")
    return response.data[0].embedding