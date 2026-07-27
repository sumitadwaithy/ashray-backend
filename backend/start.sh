#!/usr/bin/env bash
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "==> Starting Ashray Backend..."
exec uvicorn main:app --host 0.0.0.0 --port "${PORT:-8000}"
