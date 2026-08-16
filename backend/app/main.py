import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import analyze
from app.models.schemas import HealthResponse
from app.vectorstore.chroma_store import vector_store

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("strapy_ats.main")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered ATS CV Optimization & Multi-Agent Pipeline Engine — Powered by CierraLab",
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"chrome-extension://.*|https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(analyze.router, prefix=settings.API_V1_STR, tags=["Analyze"])


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint verifying API status and ChromaDB vectorstore persistence.
    """
    chroma_status = vector_store.check_health()
    return HealthResponse(
        status="ok",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        chroma_db_status=chroma_status
    )


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to StrapyATS API — Powered by CierraLab",
        "docs": "/docs",
        "health": "/health",
        "version": settings.VERSION
    }
