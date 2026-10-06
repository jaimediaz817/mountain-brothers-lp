@echo off
rem ============================================================
rem  Mountain Brothers - local launcher (Windows)
rem  Double-click (or run in console) to serve the site and
rem  open it in the browser. Close this window to stop it.
rem
rem  Uses mb-serve.py (serves mountain_brothers/ with Range/206 so
rem  the hero <video> can stream/seek). Falls back to
rem  'python -m http.server' if mb-serve.py is missing.
rem ============================================================
setlocal enabledelayedexpansion

rem --- Base folder = where this .bat lives (no hardcoded paths) ---
set "ROOT=%~dp0"
cd /d "%ROOT%"

set "PORT=8080"
set "URL=http://localhost:%PORT%/"

echo.
echo   Mountain Brothers  ->  %URL%
echo   Close this window to stop the server.
echo.

rem --- Pick the best server available ---
if exist "%ROOT%mb-serve.py" (
    set "CMD=python "%ROOT%mb-serve.py" %PORT%"
) else (
    cd /d "%ROOT%mountain_brothers"
    set "CMD=python -m http.server %PORT%"
)

rem --- Open the browser ~1s after the server starts (background) ---
start "" /b cmd /c "ping -n 1 -w 1000 127.0.0.1 >nul 2>&1 & start http://localhost:%PORT%/"

rem --- Run the server (blocks until window is closed) ---
%CMD%

endlocal