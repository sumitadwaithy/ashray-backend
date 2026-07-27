from typing import Dict, Any, List
import re

def extract_metadata(html: str) -> Dict[str, Any]:
    """
    Parses HTML content to extract meta title, meta description, OG tags, and Twitter card tags.
    """
    title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
    title = title_match.group(1).strip() if title_match else ""

    desc_match = re.search(r'<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
    if not desc_match:
        desc_match = re.search(r'<meta[^>]*content=["\'](.*?)["\'][^>]*name=["\']description["\']', html, re.IGNORECASE)
    description = desc_match.group(1).strip() if desc_match else ""

    og_tags: List[Dict[str, str]] = []
    for m in re.finditer(r'<meta[^>]*property=["\'](og:[^"\']+)["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE):
        og_tags.append({"property": m.group(1), "content": m.group(2)})

    twitter_tags: List[Dict[str, str]] = []
    for m in re.finditer(r'<meta[^>]*name=["\'](twitter:[^"\']+)["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE):
        twitter_tags.append({"name": m.group(1), "content": m.group(2)})

    h1_match = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.IGNORECASE | re.DOTALL)
    h1 = re.sub(r'<[^>]+>', '', h1_match.group(1)).strip() if h1_match else ""

    return {
        "title": title,
        "metaDescription": description,
        "ogTags": og_tags,
        "twitterTags": twitter_tags,
        "h1": h1
    }
