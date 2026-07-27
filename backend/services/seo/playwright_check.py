import os
import sys
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

async def check_playwright():
    result = {
        "playwright_installed": False,
        "chromium_available": False,
        "messages": [],
    }

    try:
        from playwright.async_api import async_playwright
        result["playwright_installed"] = True
    except ImportError:
        result["messages"].append(
            "SEO Validator dependency missing: Playwright Python package is not installed.\n"
            "  Install it with: pip install playwright"
        )
        return result

    browsers_path = Path(
        os.environ.get(
            "PLAYWRIGHT_BROWSERS_PATH",
            str(Path.home() / ".cache" / "ms-playwright"),
        )
    )

    try:
        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=["--no-sandbox", "--disable-setuid-sandbox"],
            )
            await browser.close()
        result["chromium_available"] = True
        result["messages"].append(
            "SEO Validator: Playwright and Chromium are available"
        )
    except Exception as e:
        msg = str(e)
        if "Executable doesn't exist" in msg or "executable does not exist" in msg.lower():
            result["messages"].append(
                "FATAL: SEO Validator requires Chromium but the browser binary is missing.\n"
                f"  Expected path: {browsers_path}\n"
                "  The server will start, but all SEO validation requests will fail.\n"
                "  To fix this, run the bootstrap setup script:\n"
                "    bash setup.sh\n"
                "  Or install Chromium manually:\n"
                "    python -m playwright install chromium\n"
                "  To use a custom browser cache location, set PLAYWRIGHT_BROWSERS_PATH\n"
                "  before running setup.sh:\n"
                "    PLAYWRIGHT_BROWSERS_PATH=/custom/path bash setup.sh"
            )
        elif missing_deps := _check_system_libraries(msg):
            result["messages"].append(
                "FATAL: SEO Validator requires Chromium but system libraries are missing.\n"
                f"  Missing: {', '.join(missing_deps)}\n"
                "  Install system dependencies with your package manager, or run:\n"
                "    python -m playwright install-deps chromium\n"
                "  Then re-run:  bash setup.sh"
            )
        else:
            result["messages"].append(
                "FATAL: SEO Validator requires Chromium but launch failed.\n"
                f"  Error: {msg}\n"
                "  This may indicate missing system libraries or permission issues.\n"
                "  Run: python -m playwright install-deps chromium\n"
                "  Then re-run:  bash setup.sh"
            )

    return result


KNOWN_CHROMIUM_LIBS = [
    "libnss3", "libnspr4", "libatk-1.0", "libcups", "libdrm",
    "libdbus-1", "libxkbcommon", "libxcomposite", "libxdamage",
    "libxfixes", "libxrandr", "libgbm", "libpango", "libcairo", "libasound",
]


def _check_system_libraries(error_message: str) -> list[str] | None:
    missing = []
    for lib in KNOWN_CHROMIUM_LIBS:
        if lib.lower() in error_message.lower():
            missing.append(lib)
    return missing if missing else None
