@echo off
REM 🚀 Sistema NPJ - Script de Inicialização para Windows
REM Inicia todos os serviços em janelas separadas

echo 🚀 Iniciando Sistema NPJ...
echo ==========================

REM Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Execute este script na raiz do projeto
    pause
    exit /b 1
)

REM Verificar se MySQL está rodando
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="1" (
    echo 🔄 Iniciando MySQL...
    net start mysql80 >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo ⚠️ Erro ao iniciar MySQL. Inicie manualmente ou verifique o serviço
        pause
        exit /b 1
    )
    timeout /t 3 >nul
)

echo ✅ MySQL rodando

echo 🖥️ Iniciando Backend...
start "NPJ Backend" cmd /k "cd /d %cd%\backend && echo 🚀 Iniciando Backend... && npm start"

echo ⏳ Aguardando backend inicializar...
timeout /t 5 >nul

echo 🌐 Iniciando Frontend...
start "NPJ Frontend" cmd /k "cd /d %cd%\frontend && echo 🚀 Iniciando Frontend... && npm run dev"

echo.
echo 🎉 Sistema NPJ iniciado!
echo =======================
echo.
echo 🔗 URLs disponiveis:
echo    📱 Frontend: http://localhost:5173
echo    ⚙️ Backend:  http://localhost:3001
echo.
echo 👤 Login padrao:
echo    📧 Email: admin@teste.com
echo    🔑 Senha: admin123
echo.
echo 📋 Para parar o sistema:
echo    Feche as janelas do terminal ou pressione Ctrl+C em cada uma
echo.
echo 🚀 Desenvolvimento iniciado com sucesso!

pause
