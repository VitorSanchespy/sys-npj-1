echo "=========================================="
echo "   PREPARANDO BUILD PARA PRODUÇÃO"
echo "=========================================="
echo.

echo "1️⃣ Instalando dependências do frontend..."
cd frontend
call npm install

echo.
echo "2️⃣ Gerando build de produção..."
call npm run build

echo.
echo "3️⃣ Verificando build gerado..."
if exist "dist\" (
    echo "✅ Build do frontend criado com sucesso em frontend/dist/"
    dir dist /b
) else (
    echo "❌ Erro: Build não foi gerado"
    pause
    exit /b 1
)

cd ..

echo.
echo "4️⃣ Verificando dependências do backend..."
cd backend
call npm install

cd ..

echo.
echo "=========================================="
echo "   ✅ BUILD PARA PRODUÇÃO CONCLUÍDO"
echo "=========================================="
echo.
echo "📁 Arquivos de produção:"
echo "   • frontend/dist/ - Build estático do frontend"
echo "   • backend/ - Código do servidor"
echo "   • .env - Configurações (ajustar para produção)"
echo.
echo "🚀 Para deploy em produção:"
echo "   1. Configurar variáveis de ambiente de produção"
echo "   2. Servir frontend/dist/ em servidor web (nginx/apache)"
echo "   3. Executar backend em servidor Node.js"
echo "   4. Configurar banco MySQL de produção"
echo.
echo "✨ Sistema NPJ pronto para produção!"
pause
