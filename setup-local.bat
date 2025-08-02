@echo off
echo ========================================
echo  SISTEMA NPJ - STARTUP LOCAL
echo ========================================
echo.

echo Configurando projeto para desenvolvimento local...
echo.

echo 1. Verificando dependencias do backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do backend!
    pause
    exit /b 1
)

echo.
echo 2. Verificando dependencias do frontend...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Erro ao instalar dependencias do frontend!
    pause
    exit /b 1
)

echo.
echo 3. Executando migracoes do banco de dados...
cd ..\backend
call npm run migrate
if %errorlevel% neq 0 (
    echo Erro ao executar migracoes!
    echo Certifique-se de que o MySQL esta rodando e configurado corretamente.
    pause
    exit /b 1
)

echo.
echo 4. Criando usuario admin inicial...
node utils/createAdmin.js

echo.
echo ========================================
echo  CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo O projeto foi configurado com sucesso!
echo.
echo Para iniciar os servidores, execute:
echo   start-local.bat
echo.
echo Usuario admin criado:
echo   Email: admin@npj.com
echo   Senha: admin123
echo.
echo IMPORTANTE: Altere a senha apos o primeiro login!
echo.
pause
