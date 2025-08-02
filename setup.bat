@echo off
REM 🚀 Sistema NPJ - Script de Setup para Windows
REM Este script configura todo o ambiente local automaticamente

echo 🚀 Iniciando configuracao do Sistema NPJ...
echo ======================================

REM Verificar pré-requisitos
echo 🔍 Verificando pre-requisitos...

REM Verificar Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js nao encontrado. Instale Node.js 16+ antes de continuar.
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
node --version

REM Verificar npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm nao encontrado.
    pause
    exit /b 1
)

echo ✅ npm encontrado
npm --version

REM Verificar MySQL
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ MySQL nao encontrado. Instale MySQL 8.0+ antes de continuar.
    pause
    exit /b 1
)

echo ✅ MySQL encontrado

echo.
echo 📦 Instalando dependencias...

REM Instalar dependências do backend
echo ⚙️ Instalando dependencias do backend...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependencias do backend
    pause
    exit /b 1
)
echo ✅ Dependencias do backend instaladas

REM Instalar dependências do frontend
echo ⚙️ Instalando dependencias do frontend...
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao instalar dependencias do frontend
    pause
    exit /b 1
)
echo ✅ Dependencias do frontend instaladas

cd ..

echo.
echo 🔧 Configurando arquivos de ambiente...

REM Criar .env do backend se não existir
if not exist "backend\.env" (
    echo 📝 Criando arquivo backend\.env...
    (
        echo # Banco de Dados
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=sua_senha_aqui
        echo DB_NAME=npjdatabase
        echo DB_PORT=3306
        echo.
        echo # JWT
        echo JWT_SECRET=npj_secret_key_super_secure_2025
        echo JWT_REFRESH_SECRET=npj_refresh_secret_key_2025
        echo.
        echo # Servidor
        echo PORT=3001
        echo NODE_ENV=development
        echo.
        echo # Email ^(opcional para desenvolvimento^)
        echo EMAIL_HOST=smtp.gmail.com
        echo EMAIL_PORT=587
        echo EMAIL_USER=seu_email@gmail.com
        echo EMAIL_PASS=sua_senha_app
        echo.
        echo # Uploads
        echo UPLOAD_PATH=./uploads
        echo MAX_FILE_SIZE=10485760
    ) > backend\.env
    echo ✅ Arquivo backend\.env criado
) else (
    echo ℹ️ Arquivo backend\.env ja existe
)

REM Criar .env do frontend se não existir
if not exist "frontend\.env" (
    echo 📝 Criando arquivo frontend\.env...
    (
        echo # API Backend
        echo VITE_API_URL=http://localhost:3001
        echo VITE_API_BASE_URL=http://localhost:3001/api
        echo.
        echo # Desenvolvimento
        echo VITE_NODE_ENV=development
    ) > frontend\.env
    echo ✅ Arquivo frontend\.env criado
) else (
    echo ℹ️ Arquivo frontend\.env ja existe
)

echo.
echo 💾 Configuracao do banco de dados...

REM Solicitar senha do MySQL
set /p MYSQL_PASSWORD=🔑 Digite a senha do MySQL root: 

REM Testar conexão
echo 🔌 Testando conexao com MySQL...
mysql -u root -p%MYSQL_PASSWORD% -e "SELECT 1;" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro na conexao com MySQL. Verifique a senha.
    pause
    exit /b 1
)
echo ✅ Conexao com MySQL estabelecida

REM Criar database
echo 📋 Criando database npjdatabase...
mysql -u root -p%MYSQL_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS npjdatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao criar database
    pause
    exit /b 1
)
echo ✅ Database npjdatabase criado/verificado

REM Importar estrutura
echo 📊 Importando estrutura do banco...
mysql -u root -p%MYSQL_PASSWORD% npjdatabase < db\init.sql
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erro ao importar estrutura do banco
    pause
    exit /b 1
)
echo ✅ Estrutura do banco importada

REM Atualizar arquivo config.json com a senha
echo ⚙️ Atualizando configuracao do banco...
powershell -Command "(Get-Content backend\config\config.json) -replace '\"password\": \"sua_senha_aqui\"', '\"password\": \"%MYSQL_PASSWORD%\"' | Set-Content backend\config\config.json"

REM Atualizar .env com a senha
powershell -Command "(Get-Content backend\.env) -replace 'DB_PASSWORD=sua_senha_aqui', 'DB_PASSWORD=%MYSQL_PASSWORD%' | Set-Content backend\.env"

echo.
echo 🧪 Executando testes...

REM Testar estrutura do banco
echo 🔍 Testando estrutura do banco...
node test-database-structure.js
if %ERRORLEVEL% EQU 0 (
    echo ✅ Estrutura do banco validada
) else (
    echo ❌ Problemas na estrutura do banco
)

echo.
echo 🎉 CONFIGURACAO CONCLUIDA!
echo =========================
echo.
echo 📋 Para iniciar o sistema:
echo.
echo 🖥️  Terminal 1 ^(Backend^):
echo    cd backend
echo    npm start
echo.
echo 🌐 Terminal 2 ^(Frontend^):
echo    cd frontend
echo    npm run dev
echo.
echo 🔗 URLs de acesso:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo.
echo 👤 Login padrao:
echo    Email: admin@teste.com
echo    Senha: admin123
echo.
echo 📚 Documentacao completa: CONFIGURACAO-LOCAL.md
echo.
echo 🚀 Sistema NPJ pronto para desenvolvimento!

pause
