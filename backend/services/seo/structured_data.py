import json
import re
from typing import List, Dict, Any

def extract_structured_data(html: str) -> List[Dict[str, Any]]:
    """
    Extracts application/ld+json script tags from HTML.
    """
    results: List[Dict[str, Any]] = []
    matches = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.IGNORECASE | re.DOTALL)
    for m in matches:
        try:
            parsed = json.loads(m.strip())
            results.append({"raw": m.strip(), "parsed": parsed})
        except Exception as e:
            results.append({"raw": m.strip(), "parsed": None, "parseError": str(e)})
    return results
