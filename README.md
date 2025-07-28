# 🏛️ Sistema NPJ - Núcleo de Prática Jurídica UFMT

Sistema completo de gerenciamento de processos jurídicos para o Núcleo de Prática Jurídica da UFMT, desenvolvido em Node.js + React com MySQL.

## 📋 Visão Geral

- **Frontend**: React 18 + Vite + TailwindCSS  
- **Backend**: Node.js + Express + Sequelize ORM
- **Banco de Dados**: MySQL 8.0
- **Containerização**: Docker + Docker Compose
- **Autenticação**: JWT + Refresh Tokens

## 🚀 Execução com Docker (Recomendado)

### Pré-requisitos
- Docker
- Docker Compose

### 1. Clone o repositório:
```bash
git clone https://github.com/VitorSanchespy/sys-npj-1.git
cd sys-npj-1
```

### 2. Execute com Docker:
```bash
docker-compose up -d
```

### 3. Acesse a aplicação:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Banco de Dados**: localhost:3306

### 4. Containers em execução:
```bash
# Verificar status
docker ps

# Containers ativos:
# npj-frontend  -> 0.0.0.0:5173->5173/tcp
# npj-backend   -> 0.0.0.0:3001->3001/tcp  
# sistema-npj-db-1 -> 0.0.0.0:3306->3306/tcp
```

## 🧪 Executar Testes

### Testes Backend (via container):
```bash
# Teste massivo completo
docker exec npj-backend node test_script.js

# Testes específicos
docker exec npj-backend node testarFluxoCompleto.js
docker exec npj-backend node testarProcessos.js
docker exec npj-backend node testAgendamento.js
```

### Testes Frontend:
```bash
# Teste do sistema completo
node test_system.js

# Verificar funcionalidades no browser
# Acesse: http://localhost:5173
```

## ✅ Funcionalidades Testadas e Funcionais

- ✅ **Autenticação**: Login/Logout com JWT
- ✅ **Usuários**: CRUD completo + roles (Admin, Professor, Aluno)
- ✅ **Processos**: Criação, edição, listagem e detalhes
- ✅ **Agendamentos**: Sistema completo com lembretes
- ✅ **Arquivos**: Upload e gerenciamento de documentos
- ✅ **Dashboard**: Visão geral e estatísticas
- ✅ **Responsividade**: Interface otimizada para mobile

## 📊 Documentação Completa

- **`EXECUTIVE_ROADMAP.md`** - Roadmap estratégico do projeto
- **`PROJECT_ANALYSIS_COMPLETE.md`** - Análise técnica completa
- **`TECHNICAL_ISSUES_DETAILED.md`** - Issues e melhorias identificadas
- **`RESTAURACAO_COMPLETA.md`** - Guia de restauração e uso

## 🔧 Desenvolvimento Local (Opcional)

### Backend:
```bash
cd backend
npm install
npm start  # Porta 3001
```

### Frontend:
```bash
cd frontend  
npm install
npm run dev  # Porta 5173
```