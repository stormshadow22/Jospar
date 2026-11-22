@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24.12 or newer, then run this file again.
  pause
  exit /b 1
)
node -e "process.exit(((Number(process.versions.node.split('.')[0]) === 24 && Number(process.versions.node.split('.')[1]) >= 12) || Number(process.versions.node.split('.')[0]) > 24) ? 0 : 1)"
if errorlevel 1 (
  echo Node.js 24.12 or newer is required.
  pause
  exit /b 1
)
if not exist "server\node_modules\express\package.json" (
  call npm run setup
  if errorlevel 1 (
    echo Setup failed. See the error above.
    pause
    exit /b 1
  )
)
echo.
echo Open http://localhost:8089 after the server starts.
echo Keep this window open. Press Ctrl+C to stop.
echo.
call npm start
pause
