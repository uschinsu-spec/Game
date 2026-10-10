@echo off
chcp 65001 >nul
title Vạn Mộc Sâm Lâm - Tu Tiên 2D

echo ====================================================
echo        VẠN MỘC SÂM LÂM - TU TIÊN TOP-DOWN 2D
echo ====================================================
echo.

cd /d "%~dp0"
if exist "TuTien-TopDown-2D\index.html" cd "TuTien-TopDown-2D"

echo [*] Đang kiểm tra môi trường chạy...

set RUNNER=
where py >nul 2>nul
if %errorlevel% equ 0 (
    set RUNNER=py
    goto :start_server
)

where python >nul 2>nul
if %errorlevel% equ 0 (
    python --version >nul 2>nul
    if %errorlevel% equ 0 (
        set RUNNER=python
        goto :start_server
    )
)

where node >nul 2>nul
if %errorlevel% equ 0 (
    set RUNNER=node
    goto :start_node_server
)

echo [!] LỖI: Không tìm thấy Python hoặc Node.js trên máy của bạn!
echo     Vui lòng cài đặt Python (https://www.python.org/) để chạy game.
echo.
pause
exit /b 1

:start_server
echo [*] Môi trường: %RUNNER% (Python)
echo [*] Đang khởi động HTTP server tại http://localhost:8000
echo [*] Đang mở trình duyệt web...
echo.
echo ====================================================
echo   Trang game: http://localhost:8000
echo   (Đóng cửa sổ này khi bạn không chơi nữa)
echo ====================================================
echo.

start "" "http://localhost:8000"
%RUNNER% -m http.server 8000
goto :end

:start_node_server
echo [*] Môi trường: Node.js
echo [*] Đang khởi động HTTP server bằng npx serve...
start "" "http://localhost:8000"
npx -y serve -l 8000 .
goto :end

:end
pause
