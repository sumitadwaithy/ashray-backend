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
echo "  (This downloads ~300 MB to ~/.cache/ms-playwright/)"
python -m playwright install chromium

echo ""
echo "============================================"
echo "  Setup complete."
echo ""
echo "  Start the server with:  uvicorn main:app --host 0.0.0.0 --port 8000"
echo "  Or use:                 ./start.sh"
echo "============================================"
