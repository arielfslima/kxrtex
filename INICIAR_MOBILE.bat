@echo off
title KXRTEX - Mobile Dev
color 0A

echo.
echo ==========================================
echo   KXRTEX - Iniciando Servidores
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/2] Iniciando Backend...
start "KXRTEX Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [2/2] Iniciando Expo...
echo.
echo Seu IP: 192.168.0.19
echo.
echo IMPORTANTE:
echo - Certifique-se que o celular esta na MESMA WiFi
echo - Instale o Expo Go no celular
echo.
echo Opcoes para conectar:
echo 1. Escanear QR Code (quando aparecer abaixo)
echo 2. Ou digite manualmente no Expo Go: exp://192.168.0.19:8081
echo.
echo Aguarde o QR Code aparecer...
echo.

cd mobile
npx expo start

pause
