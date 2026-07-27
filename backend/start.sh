#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "==> Installing Node.js dependencies..."
npm install --omit=dev

echo "==> Installing Node.js Playwright Chromium browser..."
npx playwright install chromium

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Installing Python Playwright Chromium browser..."
python -m playwright install chromium

echo "==> Starting Ashray Backend..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
