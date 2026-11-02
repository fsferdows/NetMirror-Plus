#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PORT="${PORT:-3000}"

echo "============================================================"
echo "  🍿 NETMIRROR / MOVIEBOX WEB STREAMING PLATFORM"
echo "  🚀 Starting Web Server on http://localhost:$PORT ..."
echo "============================================================"

if [ -f "./target/debug/moviebox_web" ]; then
    ./target/debug/moviebox_web --port "$PORT"
else
    cargo run --bin moviebox_web -- --port "$PORT"
fi

