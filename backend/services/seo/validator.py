import time
import json
import asyncio
import base64
import os
from pathlib import Path

# Configure Playwright to use project-local cache if available
base_dir = Path(__file__).parent.parent.parent.resolve()
local_cache = base_dir / "playwright_browsers"
if local_cache.exists():
    os.environ["PLAYWRIGHT_BROWSERS_PATH"] = str(local_cache)

from .schema import ValidateSeoResponse, ValidatorSeoData, OgTag, TwitterTag, HreflangTag

def build_response_from_runner_data(url: str, start: float, data: dict) -> ValidateSeoResponse:
    seo_raw = data.get("seo") or {}

    og_tags = [OgTag(**t) for t in seo_raw.get("ogTags", []) if isinstance(t, dict)]
    tw_tags = [TwitterTag(**t) for t in seo_raw.get("twitterTags", []) if isinstance(t, dict)]
    href_tags = [HreflangTag(**t) for t in seo_raw.get("hreflangTags", []) if isinstance(t, dict)]

    seo_data = ValidatorSeoData(
        title=seo_raw.get("title", ""),
        metaDescription=seo_raw.get("metaDescription", ""),
        canonical=seo_raw.get("canonical", ""),
        robots=seo_raw.get("robots", ""),
        keywords=seo_raw.get("keywords", ""),
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

def parse_runner_stdout(stdout: bytes) -> dict | None:
    if not stdout:
        return None

    lines = stdout.decode("utf-8", errors="ignore").strip().splitlines()
    for line in reversed(lines):
        line = line.strip()
        if line.startswith("{") and line.endswith("}"):
            try:
                return json.loads(line)
            except json.JSONDecodeError:
                return None
    return None

async def render_with_python_playwright(url: str, start: float) -> ValidateSeoResponse:
    from playwright.async_api import async_playwright

    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--disable-blink-features=AutomationControlled",
            ],
        )

        try:
            context = await browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
                viewport={"width": 1280, "height": 800},
                extra_http_headers={"Accept-Language": "en-US,en;q=0.9"},
            )
            page = await context.new_page()
            page.set_default_timeout(30000)

            response = None
            try:
                response = await page.goto(url, wait_until="networkidle", timeout=30000)
            except Exception:
                response = None

            title = ""
            try:
                title = await page.title()
            except Exception:
                title = ""

            if "Checking your browser" in title or "Just a moment" in title:
                try:
                    await page.wait_for_function(
                        "() => !document.title.includes('Checking your browser') && !document.title.includes('Just a moment')",
                        timeout=8000,
                    )
                except Exception:
                    pass

            try:
                await page.wait_for_function("() => document.readyState === 'complete'", timeout=10000)
            except Exception:
                pass
            await page.wait_for_timeout(500)

            seo_raw = await page.evaluate(
                """() => {
                    const d = document;
                    const title = d.querySelector('title')?.textContent || '';
                    const metaDescription = d.querySelector('meta[name="description"]')?.getAttribute('content') || '';
                    const canonical = d.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
                    const robots = d.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
                    const keywords = d.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
                    const viewport = d.querySelector('meta[name="viewport"]')?.getAttribute('content') || '';
                    const themeColor = d.querySelector('meta[name="theme-color"]')?.getAttribute('content') || '';
                    const favicon = d.querySelector('link[rel="icon"]')?.getAttribute('href') || d.querySelector('link[rel="shortcut icon"]')?.getAttribute('href') || '';
                    const hreflangTags = Array.from(d.querySelectorAll('link[rel="alternate"][hreflang]')).map((el) => ({
                      hreflang: el.getAttribute('hreflang') || '',
                      href: el.getAttribute('href') || '',
                    }));
                    const ogTags = Array.from(d.querySelectorAll('meta[property^="og:"]')).map((el) => ({
                      property: el.getAttribute('property') || '',
                      content: el.getAttribute('content') || '',
                    }));
                    const twitterTags = Array.from(d.querySelectorAll('meta[name^="twitter:"]')).map((el) => ({
                      name: el.getAttribute('name') || '',
                      content: el.getAttribute('content') || '',
                    }));
                    const jsonLd = Array.from(d.querySelectorAll('script[type="application/ld+json"]')).map((el) => {
                      try {
                        return { raw: el.textContent || '', parsed: JSON.parse(el.textContent || '{}') };
                      } catch {
                        return { raw: el.textContent || '', parsed: { parseError: 'Invalid JSON' } };
                      }
                    });
                    const h1 = d.querySelector('h1')?.textContent?.trim() || '';
                    const headings = Array.from(d.querySelectorAll('h1, h2, h3, h4, h5, h6')).map((el) => ({
                      tag: el.tagName.toLowerCase(),
                      text: (el.textContent || '').trim(),
                    }));
                    const images = Array.from(d.querySelectorAll('img')).map((el) => ({
                      src: el.getAttribute('src') || '',
                      alt: el.getAttribute('alt') || '',
                    }));
                    const internalLinks = Array.from(d.querySelectorAll('a[href]'))
                      .map((el) => ({
                        href: el.getAttribute('href') || '',
                        text: (el.textContent || '').trim().slice(0, 80),
                      }))
                      .filter((link) => link.href && !link.href.startsWith('#') && !link.href.startsWith('javascript:'));

                    return {
                      title, metaDescription, canonical, robots, keywords, viewport, themeColor,
                      favicon, hreflangTags, ogTags, twitterTags, jsonLd, structuredData: jsonLd,
                      h1, headings, images, internalLinks,
                    };
                }"""
            )

            rendered_html = await page.content()
            rendered_head = await page.evaluate("() => document.querySelector('head')?.innerHTML || ''")
            screenshot = None
            try:
                screenshot_bytes = await page.screenshot(type="png", full_page=False)
                screenshot = base64.b64encode(screenshot_bytes).decode("ascii")
            except Exception:
                screenshot = None

            data = {
                "success": True,
                "executionTimeMs": round((time.time() - start) * 1000, 2),
                "finalUrl": response.url if response else url,
                "httpStatus": response.status if response else 200,
                "renderedHtml": rendered_html,
                "renderedHead": rendered_head,
                "screenshot": screenshot,
                "seo": seo_raw,
            }
            return build_response_from_runner_data(url, start, data)
        finally:
            await browser.close()

async def validate_page(url: str) -> ValidateSeoResponse:
    start = time.time()
    
    try:
        return await render_with_python_playwright(url, start)
    except Exception as e:
        elapsed = round((time.time() - start) * 1000, 2)
        return ValidateSeoResponse(
            success=False,
            executionTimeMs=elapsed,
            requestedUrl=url,
            error=f"Rendered SEO validation requires Playwright-rendered HTML. Python Playwright render failed: {e}"
        )
