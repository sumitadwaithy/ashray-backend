from fastapi import APIRouter
from services.seo.schema import PageSpeedRequest, PageSpeedResponse
from services.seo.pagespeed import fetch_pagespeed_metrics

router = APIRouter(prefix="/api/pagespeed", tags=["PageSpeed"])

@router.post("", response_model=PageSpeedResponse)
@router.get("", response_model=PageSpeedResponse)
async def analyze_pagespeed(url: str = "https://ashraygroup.in", strategy: str = "mobile"):
    res = await fetch_pagespeed_metrics(url=url, strategy=strategy)
    return PageSpeedResponse(**res)
