@echo off
chcp 65001 >nul
echo.
echo 🧹 ========================================
echo    SCRIPT DE LIMPEZA - SISTEMA NPJ
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "backend" (
    echo ❌ Erro: Execute este script na raiz do projeto sys-npj-1
    echo.
    pause
    exit /b 1
)

echo 📂 Diretório atual: %CD%
echo.

REM Parar processos Node.js se estiverem rodando
echo 🛑 Parando processos Node.js...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo ✅ Processos Node.js finalizados
echo.

REM Limpar arquivos temporários do sistema
echo 🗑️  Removendo arquivos temporários...

REM Backend - node_modules e arquivos de build
if exist "backend\node_modules" (
    echo    📦 Removendo backend\node_modules...
    rmdir /s /q "backend\node_modules" 2>nul
)

if exist "backend\package-lock.json" (
    echo    🔒 Removendo backend\package-lock.json...
    del /q "backend\package-lock.json" 2>nul
)

REM Frontend - node_modules e arquivos de build
if exist "frontend\node_modules" (
    echo    📦 Removendo frontend\node_modules...
    rmdir /s /q "frontend\node_modules" 2>nul
)

if exist "frontend\package-lock.json" (
    echo    🔒 Removendo frontend\package-lock.json...
    del /q "frontend\package-lock.json" 2>nul
)

if exist "frontend\dist" (
    echo    🏗️  Removendo frontend\dist...
    rmdir /s /q "frontend\dist" 2>nul
)

if exist "frontend\.vite" (
    echo    ⚡ Removendo frontend\.vite...
    rmdir /s /q "frontend\.vite" 2>nul
)

REM Arquivos de debug e mock
echo 🐛 Removendo arquivos de debug e mock...

if exist "backend-mock.js" (
    echo    🎭 Removendo backend-mock.js...
    del /q "backend-mock.js" 2>nul
)

if exist "frontend\src\components\debug" (
    echo    🔍 Removendo pasta debug...
    rmdir /s /q "frontend\src\components\debug" 2>nul
)

if exist "test-api.js" (
    echo    🧪 Removendo test-api.js...
    del /q "test-api.js" 2>nul
)

REM Arquivos de log
echo 📋 Removendo arquivos de log...
for /r %%i in (*.log) do (
    echo    📄 Removendo %%i...
    del /q "%%i" 2>nul
)

REM Arquivos temporários diversos
echo 🔄 Removendo arquivos temporários diversos...

for /r %%i in (*.tmp) do (
    echo    📄 Removendo %%i...
    del /q "%%i" 2>nul
)

for /r %%i in (*.temp) do (
    echo    📄 Removendo %%i...
    del /q "%%i" 2>nul
)

for /r %%i in (*~) do (
    echo    📄 Removendo %%i...
    del /q "%%i" 2>nul
)

REM Arquivos de backup do editor
for /r %%i in (*.bak) do (
    echo    💾 Removendo %%i...
    del /q "%%i" 2>nul
)

for /r %%i in (*.orig) do (
    echo    📄 Removendo %%i...
    del /q "%%i" 2>nul
)

REM Arquivos de coverage de testes
if exist "coverage" (
    echo    📊 Removendo coverage...
    rmdir /s /q "coverage" 2>nul
)

if exist "backend\coverage" (
    echo    📊 Removendo backend\coverage...
    rmdir /s /q "backend\coverage" 2>nul
)

if exist "frontend\coverage" (
    echo    📊 Removendo frontend\coverage...
    rmdir /s /q "frontend\coverage" 2>nul
)

REM Arquivos de configuração temporária
echo ⚙️  Removendo configurações temporárias...

if exist ".env.temp" (
    echo    🔧 Removendo .env.temp...
    del /q ".env.temp" 2>nul
)

if exist "backend\.env.backup" (
    echo    🔧 Removendo backend\.env.backup...
    del /q "backend\.env.backup" 2>nul
)

if exist "config.temp.js" (
    echo    🔧 Removendo config.temp.js...
    del /q "config.temp.js" 2>nul
)

REM Limpar bancos de dados temporários (SQLite)
echo 🗄️  Removendo bancos de dados temporários...

for /r %%i in (*.sqlite) do (
    echo    🗄️  Removendo %%i...
    del /q "%%i" 2>nul
)

for /r %%i in (*.db) do (
    echo    🗄️  Removendo %%i...
    del /q "%%i" 2>nul
)

echo.
echo ✅ ========================================
echo    LIMPEZA CONCLUÍDA COM SUCESSO!
echo ========================================
echo.
echo 📝 Resumo das ações executadas:
echo    • Processos Node.js finalizados
echo    • node_modules removidos
echo    • Arquivos de build removidos
echo    • Arquivos de debug e mock removidos
echo    • Logs e cache limpos
echo    • Arquivos temporários removidos
echo    • Configurações temporárias limpas
echo    • Bancos de dados temporários removidos
echo.
echo 🚀 Para reinstalar dependências:
echo    cd backend ^&^& npm install
echo    cd frontend ^&^& npm install
echo.
echo 💡 Para rodar o projeto:
echo    Backend: cd backend ^&^& npm start
echo    Frontend: cd frontend ^&^& npm run dev
echo.
pause
