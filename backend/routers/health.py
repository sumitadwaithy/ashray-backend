from fastapi import APIRouter

router = APIRouter(tags=["Health"])

@router.get("/api/health")
@router.head("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ashray-backend",
        "services": {
            "ledger_sync": "active",
            "seo_validator": "active"
        }
    }
