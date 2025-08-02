#!/bin/bash

# 🚀 Sistema NPJ - Script de Setup Automático
# Este script configura todo o ambiente local automaticamente

echo "🚀 Iniciando configuração do Sistema NPJ..."
echo "======================================"

# Verificar pré-requisitos
echo "🔍 Verificando pré-requisitos..."

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale Node.js 16+ antes de continuar."
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js versão $NODE_VERSION encontrada. Versão 16+ necessária."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Verificar npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado."
    exit 1
fi

echo "✅ npm $(npm --version) encontrado"

# Verificar MySQL
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL não encontrado. Instale MySQL 8.0+ antes de continuar."
    exit 1
fi

echo "✅ MySQL encontrado"

echo ""
echo "📦 Instalando dependências..."

# Instalar dependências do backend
echo "⚙️ Instalando dependências do backend..."
cd backend
if npm install; then
    echo "✅ Dependências do backend instaladas"
else
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

# Instalar dependências do frontend
echo "⚙️ Instalando dependências do frontend..."
cd ../frontend
if npm install; then
    echo "✅ Dependências do frontend instaladas"
else
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

cd ..

echo ""
echo "🔧 Configurando arquivos de ambiente..."

# Criar .env do backend se não existir
if [ ! -f "backend/.env" ]; then
    echo "📝 Criando arquivo backend/.env..."
    cat > backend/.env << 'EOF'
# Banco de Dados
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha_aqui
DB_NAME=npjdatabase
DB_PORT=3306

# JWT
JWT_SECRET=npj_secret_key_super_secure_2025
JWT_REFRESH_SECRET=npj_refresh_secret_key_2025

# Servidor
PORT=3001
NODE_ENV=development

# Email (opcional para desenvolvimento)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu_email@gmail.com
EMAIL_PASS=sua_senha_app

# Uploads
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
EOF
    echo "✅ Arquivo backend/.env criado"
else
    echo "ℹ️ Arquivo backend/.env já existe"
fi

# Criar .env do frontend se não existir
if [ ! -f "frontend/.env" ]; then
    echo "📝 Criando arquivo frontend/.env..."
    cat > frontend/.env << 'EOF'
# API Backend
VITE_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api

# Desenvolvimento
VITE_NODE_ENV=development
EOF
    echo "✅ Arquivo frontend/.env criado"
else
    echo "ℹ️ Arquivo frontend/.env já existe"
fi

echo ""
echo "💾 Configuração do banco de dados..."

# Solicitar senha do MySQL
echo "🔑 Digite a senha do MySQL root:"
read -s MYSQL_PASSWORD

# Testar conexão
echo "🔌 Testando conexão com MySQL..."
if mysql -u root -p$MYSQL_PASSWORD -e "SELECT 1;" &> /dev/null; then
    echo "✅ Conexão com MySQL estabelecida"
else
    echo "❌ Erro na conexão com MySQL. Verifique a senha."
    exit 1
fi

# Criar database
echo "📋 Criando database npjdatabase..."
mysql -u root -p$MYSQL_PASSWORD -e "CREATE DATABASE IF NOT EXISTS npjdatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;"

if [ $? -eq 0 ]; then
    echo "✅ Database npjdatabase criado/verificado"
else
    echo "❌ Erro ao criar database"
    exit 1
fi

# Importar estrutura
echo "📊 Importando estrutura do banco..."
if mysql -u root -p$MYSQL_PASSWORD npjdatabase < db/init.sql; then
    echo "✅ Estrutura do banco importada"
else
    echo "❌ Erro ao importar estrutura do banco"
    exit 1
fi

# Atualizar arquivo config.json com a senha
echo "⚙️ Atualizando configuração do banco..."
sed -i.bak "s/\"password\": \"sua_senha_aqui\"/\"password\": \"$MYSQL_PASSWORD\"/g" backend/config/config.json

# Atualizar .env com a senha
sed -i.bak "s/DB_PASSWORD=sua_senha_aqui/DB_PASSWORD=$MYSQL_PASSWORD/g" backend/.env

echo ""
echo "🧪 Executando testes..."

# Testar estrutura do banco
echo "🔍 Testando estrutura do banco..."
if node test-database-structure.js; then
    echo "✅ Estrutura do banco validada"
else
    echo "❌ Problemas na estrutura do banco"
fi

# Testar backend
echo "🔍 Testando endpoints do backend..."
cd backend
npm start &
BACKEND_PID=$!

# Aguardar backend iniciar
sleep 5

cd ..
if node test-backend.js; then
    echo "✅ Backend testado com sucesso"
else
    echo "⚠️ Alguns testes do backend falharam"
fi

# Parar backend
kill $BACKEND_PID

echo ""
echo "🎉 CONFIGURAÇÃO CONCLUÍDA!"
echo "========================="
echo ""
echo "📋 Para iniciar o sistema:"
echo ""
echo "🖥️  Terminal 1 (Backend):"
echo "   cd backend"
echo "   npm start"
echo ""
echo "🌐 Terminal 2 (Frontend):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "🔗 URLs de acesso:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "👤 Login padrão:"
echo "   Email: admin@teste.com"
echo "   Senha: admin123"
echo ""
echo "📚 Documentação completa: CONFIGURACAO-LOCAL.md"
echo ""
echo "🚀 Sistema NPJ pronto para desenvolvimento!"
