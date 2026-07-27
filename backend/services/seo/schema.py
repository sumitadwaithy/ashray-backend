from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict

class OgTag(BaseModel):
    property: str
    content: str

class TwitterTag(BaseModel):
    name: str
    content: str

class HreflangTag(BaseModel):
    hreflang: str
    href: str

class HeadingTag(BaseModel):
    tag: str
    text: str

class ImageTag(BaseModel):
    src: str
    alt: str

class LinkTag(BaseModel):
    href: str
    text: str

class ValidatorSeoData(BaseModel):
    title: str = ""
    metaDescription: str = ""
    canonical: str = ""
    robots: str = ""
    viewport: str = ""
    themeColor: str = ""
    favicon: str = ""
    hreflangTags: List[HreflangTag] = Field(default_factory=list)
    ogTags: List[OgTag] = Field(default_factory=list)
    twitterTags: List[TwitterTag] = Field(default_factory=list)
    structuredData: List[Dict[str, Any]] = Field(default_factory=list)
    h1: str = ""
    headings: List[HeadingTag] = Field(default_factory=list)
    images: List[ImageTag] = Field(default_factory=list)
    internalLinks: List[LinkTag] = Field(default_factory=list)

class ValidateSeoRequest(BaseModel):
    url: str

class ValidateSeoResponse(BaseModel):
    success: bool = True
    executionTimeMs: float = 0.0
    requestedUrl: str
    finalUrl: Optional[str] = None
    httpStatus: Optional[int] = 200
    renderedHtml: Optional[str] = None
    renderedHead: Optional[str] = None
    screenshot: Optional[str] = None
    seo: Optional[ValidatorSeoData] = None
    error: Optional[str] = None

class CrawlRequest(BaseModel):
    url: str
    maxDepth: Optional[int] = 2
    maxPages: Optional[int] = 50

class CrawlResponse(BaseModel):
    success: bool = True
    totalPages: int = 0
    pages: List[Dict[str, Any]] = Field(default_factory=list)

class PageSpeedRequest(BaseModel):
    url: str
    strategy: Optional[str] = "mobile"

class PageSpeedResponse(BaseModel):
    success: bool = True
    performanceScore: float = 0.0
    seoScore: float = 0.0
    accessibilityScore: float = 0.0
    bestPracticesScore: float = 0.0
    metrics: Dict[str, Any] = Field(default_factory=dict)
