# 🏛️ Sistema NPJ - Núcleo de Prática Jurídica

## 📋 **VISÃO GERAL**

Sistema completo de gestão para Núcleos de Prática Jurídica, desenvolvido com tecnologias modernas e arquitetura escalável.

### **🛠️ Stack Tecnológica:**
- **Backend:** Node.js + Express + MySQL + Sequelize
- **Frontend:** React + Vite + TailwindCSS
- **Banco:** MySQL 8.0 com 15 tabelas relacionais
- **Autenticação:** JWT com refresh tokens
- **Upload:** Sistema de arquivos integrado

---
Valide o E-mail From no env

## 🚀 **CONFIGURAÇÃO PARA DESENVOLVIMENTO LOCAL**

### **� Pré-requisitos:**
- Node.js 16+ 
- MySQL 8.0+
- npm

### **📦 Configuração Automática:**

**Windows:**
```powershell
# Clone o repositório
git clone https://github.com/VitorSanchespy/sys-npj-1.git
cd sys-npj-1

# Execute o setup local
setup-local.bat
```

**Linux/Mac:**
```powershell
# Clone o repositório
git clone https://github.com/VitorSanchespy/sys-npj-1.git
cd sys-npj-1

# Torne executável e execute
chmod +x setup-local.sh
./setup-local.sh
```

### **🎯 Iniciar Servidores:**

**Windows:**
```powershell
start-local.bat
```

**Linux/Mac:**
```powershell
chmod +x start-local.sh
./start-local.sh
```

### **🌐 Acessos:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Usuário Admin:** admin@npj.com / admin123

⚠️ **IMPORTANTE:** Altere a senha do admin após o primeiro login!

---

## � **DOCUMENTAÇÃO COMPLETA**

| Documento | Descrição |
|-----------|-----------|
| **[CONFIGURACAO-LOCAL.md](CONFIGURACAO-LOCAL.md)** | Guia completo de configuração local |
| **[ENDPOINTS-BACKEND.md](ENDPOINTS-BACKEND.md)** | Documentação detalhada da API (49 endpoints) |
| **[API-QUICK-REFERENCE.md](API-QUICK-REFERENCE.md)** | Referência rápida da API |
| **[GUIA-CONFIGURACAO-BANCO.md](GUIA-CONFIGURACAO-BANCO.md)** | Configuração do banco de dados |
| **[ANALISE-BANCO-DADOS.md](ANALISE-BANCO-DADOS.md)** | Análise da estrutura do banco |

- 📡 **[Endpoints Completos](ENDPOINTS-BACKEND.md)** - Documentação detalhada de todos os 49 endpoints
- 🚀 **[Consulta Rápida](API-QUICK-REFERENCE.md)** - Referência rápida dos endpoints
- 📝 **[Changelog](CHANGELOG.md)** - Histórico de mudanças e melhorias
- 🔧 **[Relatório de Correções](RELATORIO-CORRECOES.md)** - Detalhes das correções realizadas

## 🚀 Execução com Docker (Recomendado)

### Pré-requisitos
- Docker
- Docker Compose

### 1. Clone o repositório:
```powershell
git clone https://github.com/VitorSanchespy/sys-npj-1.git
cd sys-npj-1
```

### 2. Execute com Docker:
```powershell
docker-compose up -d
```

### 3. Acesse a aplicação:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Banco de Dados**: localhost:3306

### 4. Containers em execução:
```powershell
# Verificar status
docker ps

# Containers ativos:
# npj-frontend  -> 0.0.0.0:5173->5173/tcp
# npj-backend   -> 0.0.0.0:3001->3001/tcp  
# sistema-npj-db-1 -> 0.0.0.0:3306->3306/tcp
```

## 🧪 Executar Testes

### Testes Backend (via container):
```powershell
# Teste massivo completo
docker exec npj-backend node test_script.js

# Testes específicos
docker exec npj-backend node testarFluxoCompleto.js
docker exec npj-backend node testarProcessos.js
docker exec npj-backend node testAgendamento.js
```

### Testes Frontend:
```powershell
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

## 🔧 Desenvolvimento Local (Opcional)
### Git:
```powershell
git clean -fd #  limpa arquivos não rastreados
```

### Backend && Frontend:
```powershell

.\setup-local.sh # configura para iniciar em ambiente local os servidores 
.\start-local.bat   # inicia os servidores

```

## 🗃️ Migrations

### Criar uma nova migration
```powershell
npx sequelize-cli migration:generate --name nome_da_migration
```powershell
npx sequelize-cli migration:generate --name nome_da_migration
```

### Executar migrations
```powershell
npx sequelize-cli db:migrate
```
window.testAPI()
### Reverter a última migration
```powershell
npx sequelize-cli db:migrate:undo
```

### Verificar status das migrations
```powershell
npx sequelize-cli db:migrate:status
``` 