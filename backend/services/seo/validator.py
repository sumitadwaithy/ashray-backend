import time
import httpx
from typing import Dict, Any
from .schema import ValidateSeoResponse, ValidatorSeoData, OgTag, TwitterTag, HreflangTag
from .metadata import extract_metadata
from .canonical import extract_canonical
from .robots import extract_robots
from .structured_data import extract_structured_data

async def validate_page(url: str) -> ValidateSeoResponse:
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True, headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36"
        }) as client:
            res = await client.get(url)

        elapsed = round((time.time() - start) * 1000, 2)
        html = res.text
        meta = extract_metadata(html)
        canonical = extract_canonical(html)
        robots = extract_robots(html)
        structured = extract_structured_data(html)

        seo_data = ValidatorSeoData(
            title=meta.get("title", ""),
            metaDescription=meta.get("metaDescription", ""),
            canonical=canonical,
            robots=robots,
            viewport="width=device-width, initial-scale=1",
            ogTags=[OgTag(**t) for t in meta.get("ogTags", [])],
            twitterTags=[TwitterTag(**t) for t in meta.get("twitterTags", [])],
            structuredData=structured,
            h1=meta.get("h1", ""),
        )

        return ValidateSeoResponse(
            success=True,
            executionTimeMs=elapsed,
            requestedUrl=url,
            finalUrl=str(res.url),
            httpStatus=res.status_code,
            renderedHtml=html,
            renderedHead=html[:2000] if html else "",
            seo=seo_data
        )
    except Exception as e:
        elapsed = round((time.time() - start) * 1000, 2)
        return ValidateSeoResponse(
            success=False,
            executionTimeMs=elapsed,
            requestedUrl=url,
            error=str(e)
        )
