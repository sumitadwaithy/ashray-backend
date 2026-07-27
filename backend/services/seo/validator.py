import time
import os
import json
import asyncio
import httpx
from pathlib import Path
from typing import Dict, Any
from .schema import ValidateSeoResponse, ValidatorSeoData, OgTag, TwitterTag, HreflangTag
from .metadata import extract_metadata
from .canonical import extract_canonical
from .robots import extract_robots
from .structured_data import extract_structured_data

async def validate_page(url: str) -> ValidateSeoResponse:
    start = time.time()
    
    # 1. Try running Node Playwright runner script for full JS rendering
    try:
        script_dir = Path(__file__).parent
        runner_path = script_dir / "render_runner.mjs"
        
        if runner_path.exists():
            proc = await asyncio.create_subprocess_exec(
                "node",
                str(runner_path),
                url,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=35.0)
            
            if proc.returncode == 0 and stdout:
                lines = stdout.decode("utf-8", errors="ignore").strip().splitlines()
                # Find JSON output line
                for line in reversed(lines):
                    line = line.strip()
                    if line.startswith("{") and line.endswith("}"):
                        data = json.loads(line)
                        if data.get("success"):
                            seo_raw = data.get("seo") or {}
                            
                            og_tags = [OgTag(**t) for t in seo_raw.get("ogTags", []) if isinstance(t, dict)]
                            tw_tags = [TwitterTag(**t) for t in seo_raw.get("twitterTags", []) if isinstance(t, dict)]
                            href_tags = [HreflangTag(**t) for t in seo_raw.get("hreflangTags", []) if isinstance(t, dict)]
                            
                            seo_data = ValidatorSeoData(
                                title=seo_raw.get("title", ""),
                                metaDescription=seo_raw.get("metaDescription", ""),
                                canonical=seo_raw.get("canonical", ""),
                                robots=seo_raw.get("robots", ""),
                                viewport=seo_raw.get("viewport", ""),
                                themeColor=seo_raw.get("themeColor", ""),
                                favicon=seo_raw.get("favicon", ""),
                                hreflangTags=href_tags,
                                ogTags=og_tags,
                                twitterTags=tw_tags,
                                structuredData=seo_raw.get("structuredData", []),
                                h1=seo_raw.get("h1", ""),
                                headings=seo_raw.get("headings", []),
                                images=seo_raw.get("images", []),
                                internalLinks=seo_raw.get("internalLinks", [])
                            )
                            
                            return ValidateSeoResponse(
                                success=True,
                                executionTimeMs=data.get("executionTimeMs", round((time.time() - start) * 1000, 2)),
                                requestedUrl=url,
                                finalUrl=data.get("finalUrl") or url,
                                httpStatus=data.get("httpStatus") or 200,
                                renderedHtml=data.get("renderedHtml"),
                                renderedHead=data.get("renderedHead"),
                                screenshot=data.get("screenshot"),
                                seo=seo_data
                            )
    except Exception as e:
        print(f"[validator.py] Playwright subprocess note: {e}")

    # 2. Fallback: HTTP GET fetch if Playwright runner unavailable
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
