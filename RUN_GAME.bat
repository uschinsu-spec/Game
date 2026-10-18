@echo off
cd /d "%~dp0"
title Babylon MMORPG - Python Server
where py >nul 2>nul
if %errorlevel%==0 (
  py server.py
  goto :eof
)
where python >nul 2>nul
if %errorlevel%==0 (
  python server.py
  goto :eof
)
echo.
echo KHONG TIM THAY PYTHON.
echo Cai Python 3 tu https://www.python.org/downloads/
echo Nho tick "Add Python to PATH" khi cai.
echo.
pause
