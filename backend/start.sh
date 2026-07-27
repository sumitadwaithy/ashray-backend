#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

export PLAYWRIGHT_BROWSERS_PATH="$DIR/playwright_browsers"

echo "==> Starting Ashray Backend..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
