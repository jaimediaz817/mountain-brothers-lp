#!/usr/bin/env bash
# ============================================================
#  Mountain Brothers - local launcher (Git Bash / Linux/macOS)
#  Run:  ./server-mb.sh
#  Serves mountain_brothers/ with mb-serve.py (Range/206 so the
#  hero <video> can stream/seek) and opens the browser.
#  Press Ctrl+C to stop the server.
# ============================================================
set -e
cd "$(dirname "$0")"

PORT=8080
URL="http://localhost:$PORT/"

echo
echo "  Mountain Brothers  ->  $URL"
echo "  Press Ctrl+C to stop the server."
echo

if [ -f "$PWD/mb-serve.py" ]; then
    python mb-serve.py "$PORT" &
else
    cd mountain_brothers
    python -m http.server "$PORT" &
fi

SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null' EXIT INT TERM

sleep 1

# Open the browser: Windows (Git Bash), Linux, then macOS.
if command -v explorer.exe >/dev/null 2>&1; then
    explorer.exe "$URL" &
elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" &
elif command -v open >/dev/null 2>&1; then
    open "$URL" &
else
    echo "Open this in your browser:  $URL"
fi

wait "$SERVER_PID"