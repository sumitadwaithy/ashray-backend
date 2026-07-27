from typing import List, Dict, Any

def parse_sitemap_urls(xml_content: str) -> List[str]:
    import re
    urls = re.findall(r'<loc>(.*?)</loc>', xml_content, re.IGNORECASE)
    return [u.strip() for u in urls if u.strip()]
