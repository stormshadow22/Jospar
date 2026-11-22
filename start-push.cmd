@echo off
setlocal
cd /d "%~dp0"
if not exist .env (
 echo Create .env from .env.example and configure LOCAL Firebase Admin credentials first.
 pause
 exit /b 1
)
node --env-file=.env server/index.js
pause
