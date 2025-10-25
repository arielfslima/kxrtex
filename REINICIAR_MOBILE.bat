@echo off
title KXRTEX - Reiniciar Mobile
color 0A

echo.
echo ==========================================
echo   KXRTEX - Reiniciando com Cache Limpo
echo ==========================================
echo.

cd /d "%~dp0"

echo [1/3] Matando processos Node...
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo [2/3] Iniciando Backend...
start "KXRTEX Backend" cmd /k "cd backend && npm run dev"
timeout /t 5 /nobreak >nul

echo [3/3] Iniciando Expo (cache limpo)...
echo.
echo ==========================================
echo   IMPORTANTE - Conectar no Celular:
echo ==========================================
echo.
echo Opcao 1: Escanear QR Code (quando aparecer)
echo.
echo Opcao 2: Digite manualmente no Expo Go:
echo   exp://192.168.0.19:8081
echo.
echo ==========================================
echo.
echo Aguarde o QR Code...
echo.

cd mobile
npx expo start -c --no-dev --minify

pause
