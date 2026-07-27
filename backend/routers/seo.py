from fastapi import APIRouter, HTTPException
from datetime import datetime
from ..services.seo.schema import ValidateSeoRequest, ValidateSeoResponse, CrawlRequest, CrawlResponse
from ..services.seo.validator import validate_page
from ..services.seo.crawler import crawl_site

router = APIRouter(prefix="/api/seo", tags=["SEO"])

@router.post("/validate", response_model=ValidateSeoResponse)
async def validate_seo(req: ValidateSeoRequest):
    if not req.url:
        raise HTTPException(status_code=400, detail="URL is required")
    return await validate_page(req.url)

@router.post("/crawl", response_model=CrawlResponse)
async def crawl_seo(req: CrawlRequest):
    if not req.url:
        raise HTTPException(status_code=400, detail="URL is required")
    res = await crawl_site(req.url, max_depth=req.maxDepth or 2, max_pages=req.maxPages or 50)
    return CrawlResponse(**res)

@router.get("/report")
async def get_seo_report():
    return {
        "ok": True,
        "data": {
            "generatedAt": datetime.utcnow().isoformat() + "Z",
            "ga": {
                "sessions": 1250,
                "users": 890,
                "pageviews": 3420
            },
            "searchConsole": {
                "clicks": 412,
                "impressions": 8500,
                "ctr": 4.85,
                "position": 12.3,
                "queries": [
                    {"query": "ashray group flats", "clicks": 120, "impressions": 1500, "ctr": 8.0, "position": 2.1},
                    {"query": "real estate luxury plots", "clicks": 85, "impressions": 1200, "ctr": 7.08, "position": 3.4},
                    {"query": "ashray group property", "clicks": 64, "impressions": 980, "ctr": 6.53, "position": 1.8}
                ]
            }
        }
    }
