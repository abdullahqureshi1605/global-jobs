from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.adzuna import router as adzuna_router
from app.api.processing.route import router as processing_router
from app.api.review.route import router as review_router
from app.api.review.targeted import router as targeted_router
from app.api.public_jobs.route import router as public_jobs_router
from app.api.admin_ops.route import router as admin_ops_router


app = FastAPI(
    title="Horizon Jobs Backend",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
#
# IMPORTANT:
# targeted_router MUST be registered BEFORE review_router
# because review_router contains /{job_id} routes.
# ============================================================

app.include_router(
    adzuna_router,
    prefix="/api/adzuna",
)

app.include_router(
    processing_router,
    prefix="/api/processing",
)

# Static targeted routes FIRST:
# /api/review/targeted-analysis
# /api/review/{job_id}/targeted-recheck
app.include_router(
    targeted_router,
    prefix="/api/review",
)

# Generic review routes SECOND:
# /api/review/{job_id}
# /api/review/{job_id}/approve
# /api/review/{job_id}/reject
# /api/review/{job_id}/publish
# /api/review/{job_id}/unpublish
app.include_router(
    review_router,
    prefix="/api/review",
)

app.include_router(
    public_jobs_router,
    prefix="/api/public/jobs",
)

app.include_router(
    admin_ops_router,
    prefix="/api/admin-ops",
)


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "horizon-jobs-backend",
    }


@app.get("/")
async def root():
    return {
        "status": "ok",
        "service": "horizon-jobs-backend",
        "message": "Horizon Jobs Backend",
    }
