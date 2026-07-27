import re

def extract_robots(html: str) -> str:
    """
    Extracts meta robots directives from HTML.
    """
    match = re.search(r'<meta[^>]*name=["\']robots["\'][^>]*content=["\'](.*?)["\']', html, re.IGNORECASE)
    if not match:
        match = re.search(r'<meta[^>]*content=["\'](.*?)["\'][^>]*name=["\']robots["\']', html, re.IGNORECASE)
    return match.group(1).strip() if match else ""
