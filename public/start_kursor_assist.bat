@echo off
chcp 65001 > nul
title KursorAssist - Launcher Windows
echo ================================================================
echo   URUCHAMIANIE KURSORASSIST (HUD & UŁATWIENIA DOSTĘPU WINDOWS)
echo ================================================================
echo.
echo [1/2] Sprawdzanie i instalowanie wymaganych bibliotek pip...
pip install -r requirements.txt
echo.
echo [2/2] Uruchamianie KursorAssist...
echo Nacisnij [Alt + Q] lub [Ctrl + Spacja] w dowolnym miejscu systemu!
echo.
python kursor_assist.py
pause
