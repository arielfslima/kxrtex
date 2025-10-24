@echo off
echo Iniciando PostgreSQL com Docker...
echo.

docker run --name kxrtex-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=kxrtex -p 5432:5432 -d postgres:15

echo.
echo PostgreSQL iniciado!
echo Aguardando banco ficar pronto...
timeout /t 5

echo.
echo Banco de dados pronto para uso!
echo.
echo Credenciais:
echo   Host: localhost
echo   Port: 5432
echo   User: postgres
echo   Password: postgres
echo   Database: kxrtex
