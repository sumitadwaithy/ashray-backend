#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "============================================"
echo "  Ashray Backend — Bootstrap Setup"
echo "============================================"
echo ""
echo "Step 1: Installing Python dependencies..."
pip install -r requirements.txt

echo ""
echo "Step 2: Installing Playwright Chromium browser..."
export PLAYWRIGHT_BROWSERS_PATH="$DIR/playwright_browsers"
echo "  (This downloads ~300 MB to $PLAYWRIGHT_BROWSERS_PATH)"
python -m playwright install chromium

# Install system dependencies if running with root privileges (e.g. VPS bootstrap)
if [ "$(id -u)" -eq 0 ]; then
  echo ""
  echo "Step 3: Running as root. Installing system dependencies for Chromium..."
  python -m playwright install-deps chromium || true
fi

echo ""
echo "============================================"
echo "  Setup complete."
echo ""
echo "  Start the server with:  uvicorn main:app --host 0.0.0.0 --port 8000"
echo "  Or use:                 ./start.sh"
echo "============================================"
