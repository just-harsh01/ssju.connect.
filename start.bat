@echo off
title SSJU Connect - Campus Social & PYQ Vault
cd /d "%~dp0"
echo ========================================================
echo        Starting SSJU Connect Full-Stack Portal
echo   Soban Singh Jeena University Campus Social & PYQ Hub
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Full-Stack Node.js Engine (Database + PYQ Uploads)...
    node server.js
    pause
    goto end
)

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Starting Python Server Engine...
    python server.py
    pause
    goto end
)

echo Opening directly in default browser...
start index.html

:end
