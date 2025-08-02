#!/bin/bash

# 🧹 Sistema NPJ - Script de Limpeza
# Remove arquivos temporários e reseta o ambiente

echo "🧹 Iniciando limpeza do Sistema NPJ..."
echo "===================================="

# Confirmar ação
read -p "⚠️ Isso irá remover node_modules, logs e arquivos temporários. Continuar? (y/N): " confirm
if [[ $confirm != [yY] ]]; then
    echo "❌ Operação cancelada"
    exit 0
fi

echo ""
echo "🗑️ Removendo arquivos temporários..."

# Remover node_modules
if [ -d "node_modules" ]; then
    echo "📦 Removendo node_modules raiz..."
    rm -rf node_modules
fi

if [ -d "backend/node_modules" ]; then
    echo "📦 Removendo node_modules do backend..."
    rm -rf backend/node_modules
fi

if [ -d "frontend/node_modules" ]; then
    echo "📦 Removendo node_modules do frontend..."
    rm -rf frontend/node_modules
fi

# Remover package-lock.json
echo "🔒 Removendo package-lock.json..."
rm -f package-lock.json
rm -f backend/package-lock.json
rm -f frontend/package-lock.json

# Remover logs
echo "📋 Removendo logs..."
rm -f *.log
rm -f backend/*.log
rm -f frontend/*.log
rm -rf logs/

# Remover build temporário
echo "🏗️ Removendo builds temporários..."
rm -rf frontend/dist/
rm -rf frontend/build/
rm -rf backend/dist/

# Remover uploads de teste
echo "📁 Removendo uploads temporários..."
find backend/uploads/ -type f ! -name '.gitkeep' -delete 2>/dev/null || true

# Remover arquivos temporários
echo "🗂️ Removendo arquivos temporários..."
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.bak" -type f -delete 2>/dev/null || true
find . -name "*.swp" -type f -delete 2>/dev/null || true
find . -name "*.swo" -type f -delete 2>/dev/null || true

# Remover cache
echo "🗄️ Removendo cache..."
rm -rf .npm/
rm -rf .cache/
rm -rf backend/.cache/
rm -rf frontend/.cache/

echo ""
echo "✅ Limpeza concluída!"
echo ""
echo "📦 Para reinstalar dependências:"
echo "   npm run install:all"
echo ""
echo "🚀 Para configurar novamente:"
echo "   ./setup.sh (Linux/Mac) ou setup.bat (Windows)"
echo ""
echo "🧹 Sistema limpo e pronto!"
