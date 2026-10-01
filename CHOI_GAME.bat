@echo off
setlocal
title Linh Son Phi Kiem 3D - Tu Tien Truyen Ky
cd /d "%~dp0"

echo ================================================
echo   DANG KHOI CHAY LINH SON PHI KIEM 3D...
echo ================================================

where node >nul 2>nul
if %errorlevel%==0 (
    echo   [+] Khoi chay server Node.js...
    start "Linh Son Game Server" /b node server.js
    goto wait_for_server
)

where python >nul 2>nul
if %errorlevel%==0 (
    echo   [+] Khoi chay server Python...
    start "Linh Son Game Server" /b python -m http.server 8080
    goto wait_for_server
)

where py >nul 2>nul
if %errorlevel%==0 (
    echo   [+] Khoi chay server Py Launcher...
    start "Linh Son Game Server" /b py -m http.server 8080
    goto wait_for_server
)

echo   [!] Khong tim thay Node.js hoac Python tren may.
echo   Vui long cai Node.js hoac Python de choi Game.
pause
exit /b 1

:wait_for_server
echo   Dang doi server san sang...
set /a tries=0
:check_server
powershell -NoProfile -Command "if ((Test-NetConnection 127.0.0.1 -Port 8080 -WarningAction SilentlyContinue).TcpTestSucceeded) { exit 0 } else { exit 1 }" >nul 2>nul
if %errorlevel%==0 goto open_game
set /a tries+=1
if %tries% GEQ 10 goto open_game
timeout /t 1 /nobreak >nul
goto check_server

:open_game
start "" "http://127.0.0.1:8080/"
echo   Game da mo tren trinh duyet. Khong dong cua so nay khi dang choi.
pause
