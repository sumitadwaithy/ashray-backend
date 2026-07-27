from typing import Dict, Any, List
import httpx
from .metadata import extract_metadata

async def crawl_site(url: str, max_depth: int = 2, max_pages: int = 50) -> Dict[str, Any]:
    """
    Crawls website pages and extracts SEO metadata.
    """
    pages: List[Dict[str, Any]] = []
    async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
        try:
            res = await client.get(url)
            if res.status_code == 200:
                meta = extract_metadata(res.text)
                pages.append({
                    "url": str(res.url),
                    "status": res.status_code,
                    "title": meta.get("title"),
                    "metaDescription": meta.get("metaDescription"),
                    "h1": meta.get("h1"),
                })
        except Exception as e:
            pages.append({"url": url, "error": str(e)})

    return {
        "success": True,
        "totalPages": len(pages),
        "pages": pages
    }
