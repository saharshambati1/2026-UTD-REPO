from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
import time
import traceback
from core.config import get_settings
from core.cache import get_redis
from core.database import get_supabase
from RAG.ragchat import router as rag_router
from routers.compare import router as compare_router
from routers.cofounders import router as cofounders_router
from routers.investors import router as investors_router
from routers.roadmap import router as roadmap_router
from routers.startups import router as startups_router
from routers.templates import router as templates_router
from routers.research import router as research_router
from routers.community import router as community_router
from routers.chat import router as chat_router
from routers.websocket import router as websocket_router



settings = get_settings()

# Base Setup
app = FastAPI(
    title="Folia API",
    description="Financial intelligence backend — RAG advisor, simulators, tax engine, and market data.",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url=None, 
)


# Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)

app.add_middleware(
    CORSMiddleware, 
    allow_origins=[
        "http://localhost:3000",
        settings.frontend_url,
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type", 
        "Authorization", 
        "Accept", 
        "Origin", 
        "X-Requested-With"
    ],
)

@app.middleware("http")
async def security_and_timing(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elasped = round((time.time() - start) * 1000, 1)
    response.headers["X-Process-Time-Ms"] = str(elasped)
    
    # Security Headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()" 
    
    if request.url.scheme == "https":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

    if request.url.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
 
    return response

# Error Handler for All Backend
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if settings.debug:
        detail = traceback.format_exc()
    else:
        detail = "An internal error occurred."
    return JSONResponse(
        status_code=500,
        content={"detail": detail, "type": type(exc).__name__},
    )

# Extends all routes for backend
app.include_router(rag_router)
app.include_router(templates_router)
app.include_router(startups_router)
app.include_router(compare_router)
app.include_router(roadmap_router)
app.include_router(cofounders_router)
app.include_router(investors_router)
app.include_router(research_router)
app.include_router(community_router)
app.include_router(chat_router)
app.include_router(websocket_router)



# Route for Health Checking
@app.get("/", tags=["System"])
async def root():
    return {
        "name":    settings.app_name,
        "version": settings.app_version,
        "status":  "running",
        "docs":    "/docs",
    }


@app.get("/health", tags=["System"])
async def health_check():
    checks = {}
 
    try:
        get_supabase().table("profiles").select("id").limit(1).execute()
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"
 
    try:
        r = await get_redis()
        if r:
            await r.ping()
            checks["redis"] = "ok"
        else:
            checks["redis"] = "not configured"
    except Exception as e:
        checks["redis"] = f"error: {e}"
 
 
    checks["sendgrid"] = "configured" if settings.sendgrid_api_key else "not configured"
 
    return {"status": "ok", "version": settings.app_version, "checks": checks}
