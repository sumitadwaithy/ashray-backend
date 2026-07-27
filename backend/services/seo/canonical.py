import re

def extract_canonical(html: str) -> str:
    """
    Extracts canonical URL tag from HTML.
    """
    match = re.search(r'<link[^>]*rel=["\']canonical["\'][^>]*href=["\'](.*?)["\']', html, re.IGNORECASE)
    if not match:
        match = re.search(r'<link[^>]*href=["\'](.*?)["\'][^>]*rel=["\']canonical["\']', html, re.IGNORECASE)
    return match.group(1).strip() if match else ""
