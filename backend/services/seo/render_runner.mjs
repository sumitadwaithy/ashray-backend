import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

const targetUrl = process.argv[2];
if (!targetUrl) {
  console.log(JSON.stringify({ success: false, error: 'Missing target URL argument' }));
  process.exit(1);
}

let chromium;
try {
  const localPlaywrightPath = join(projectRoot, 'server/seo-validator/node_modules/playwright/index.mjs');
  const p = await import(pathToFileURL(localPlaywrightPath).href);
  chromium = p.chromium;
} catch {
  try {
    const p = await import('playwright');
    chromium = p.chromium;
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: `Playwright module missing: ${err.message}` }));
    process.exit(1);
  }
}

const start = performance.now();
let browser;

try {
  browser = await chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });

  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  const response = await page.goto(targetUrl, {
    waitUntil: 'networkidle',
    timeout: 30000,
  }).catch(() => null);

  // Wait if bot challenge page is detected
  let checkTitle = await page.title().catch(() => '');
  if (checkTitle.includes('Checking your browser') || checkTitle.includes('Just a moment')) {
    await page.waitForFunction(() => !document.title.includes('Checking your browser') && !document.title.includes('Just a moment'), { timeout: 8000 }).catch(() => {});
  }

  await page.waitForFunction(() => document.readyState === 'complete', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(500);

  const executionTimeMs = Math.round(performance.now() - start);

  const seoData = await page.evaluate(() => {
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
  });

  const renderedHtml = await page.content();
  const renderedHead = await page.evaluate(() => document.querySelector('head')?.innerHTML || '');
  const screenshotBase64 = await page.screenshot({ type: 'png', fullPage: false }).then(buf => buf.toString('base64')).catch(() => null);

  await browser.close();

  const finalUrl = response?.url() || targetUrl;
  const httpStatus = response?.status() || 200;

  console.log(JSON.stringify({
    success: true,
    executionTimeMs,
    requestedUrl: targetUrl,
    finalUrl,
    httpStatus,
    renderedHtml,
    renderedHead,
    screenshot: screenshotBase64,
    seo: seoData,
  }));
} catch (err) {
  if (browser) await browser.close().catch(() => {});
  const executionTimeMs = Math.round(performance.now() - start);
  console.log(JSON.stringify({
    success: false,
    executionTimeMs,
    requestedUrl: targetUrl,
    finalUrl: null,
    httpStatus: null,
    renderedHtml: null,
    renderedHead: null,
    screenshot: null,
    seo: null,
    error: err instanceof Error ? err.message : String(err),
  }));
}
