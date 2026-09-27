@echo off
title Linh Son Phi Kiem 3D - Tu Tien Truyen Ky
echo ===================================================
echo   DANG KHOI CHAY SERVER TU TIEN TRUYEN KY...
echo ===================================================
cd /d "%~dp0"
start "" http://127.0.0.1:8080

where node >nul 2>nul
if %errorlevel%==0 (
    echo   [+] Khoi chay bang Node.js Server...
    node server.js
    goto end
)

where python >nul 2>nul
if %errorlevel%==0 (
    echo   [+] Khoi chay bang Python Server...
    python -m http.server 8080
    goto end
)

where py >nul 2>nul
if %errorlevel%==0 (
    echo   [+] Khoi chay bang Py Launcher...
    py -m http.server 8080
    goto end
)

echo   [!] Khong tim thay Node.js hoac Python tren may!
echo   Vui long cai dat Node.js hoac Python de chay may chu cuc bo.
:end
pause
