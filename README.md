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

## 🚀 **CONFIGURAÇÃO PARA DESENVOLVIMENTO LOCAL**

### **� Pré-requisitos:**
- Node.js 16+ 
- MySQL 8.0+
- npm

### **📦 Configuração Automática:**

**Windows:**
```bash
# Clone o repositório
git clone https://github.com/VitorSanchespy/sys-npj-1.git
cd sys-npj-1

# Execute o setup local
setup-local.bat
```

**Linux/Mac:**
```bash
# Clone o repositório
git clone https://github.com/VitorSanchespy/sys-npj-1.git
cd sys-npj-1

# Torne executável e execute
chmod +x setup-local.sh
./setup-local.sh
```

### **🎯 Iniciar Servidores:**

**Windows:**
```bash
start-local.bat
```

**Linux/Mac:**
```bash
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

## 🗃️ Migrations

### Criar uma nova migration
```bash
npx sequelize-cli migration:generate --name nome_da_migration
```

### Executar migrations
```bash
npx sequelize-cli db:migrate
```

### Reverter a última migration
```bash
npx sequelize-cli db:migrate:undo
```

### Verificar status das migrations
```bash
npx sequelize-cli db:migrate:status
``` 

fazer:
- criar todas as migrations necessárias para o sistema, garantindo que todas as tabelas estejam criadas e atualizadas.

- garantir que os agendamentos sejam feitos corretamente. exemplo (Aluno cria um agendamento, o professor recebe a notificação, o aluno recebe a confirmação, etc). (OK)

- implementar sistema de notificações para os usuários (ex: email, push notifications) ou usar um frame work que ajude, quando um agendamento é criado, confirmado ou cancelado, tentativas de login, quando a senha for errada, quando o e-mail for errado, se já houver a notificação apenas reutilizar a função ou adaptar. Ou seja em todo o sistema e em toda função. Mas use (c499aca42967   mysql:8.0            "docker-entrypoint.s…"   3 hours ago          Up 14 minutos (healthy)   0.0.0.0:3307->3306/tcp, [::]:3307->3306/tcp   sistema-npj-db-1) o db no docker e o servirdor de backend na maquina localmente e o de frontend tambem pratindo da raiz do projeto entra na pasta backend e execulta npm start e partindo da raiz entra na pasta frontend e execulta npm run dev

- implementar sistema de notificações para os usuários (ex: email, push notifications) quando um agendamento é criado, confirmado ou cancelado, tentativas de login, quando a senha for errada, quando o e-mail for errado, ou seja em todo o sistema e em toda função.

- implementar comentarios de uma linha simples e objetivo

- implementar sistema de logs para registrar ações importantes (ex: criação de processos, agendamentos, etc).

- implementar sistema de auditoria para rastrear alterações em processos e agendamentos.

- organizar os testes de forma que sejam executados automaticamente ao iniciar o servidor, garantindo que todas as funcionalidades estejam funcionando corretamente.

- implementar uma regra lógica que evite a criação de agendamentos duplicados, processos duplicados, usuarios duplicados, etc. (OK)

- garantir que um numero de tentativas de login seja limitado sendo 5 tentativas na 5 só seja permintido tentativa depois de 1 hora.

- garantir que o sistema esteja preparado para receber novos módulos e funcionalidades no futuro, mantendo a estrutura modular e escalável.

- limpar o código, remover comentários desnecessários e garantir que o código esteja bem organizado e documentado.

- implementar testes automatizados para garantir a qualidade do código e facilitar manutenções futuras.

- implementar medidas para tratar dados com caracteres especiais, como acentos e caracteres não alfanuméricos, garantindo que o sistema funcione corretamente com diferentes idiomas e formatos de entrada.

- implementar um sistema de cache para melhorar a performance do sistema, especialmente em consultas frequentes ao banco de dados.

- limpar arquivos desnecessários e garantir que o repositório esteja organizado e fácil de navegar.

- limpar arquivos orfãos e garantir que o repositório esteja livre de arquivos temporários ou desnecessários.


os erros vc vai arrumando lembrando de usar o servirdor na maquina local backend (C:\Users\VTR\Documents\GitHub\sys-npj-1\backend) execulta npm start o do frontend (C:\Users\VTR\Documents\GitHub\sys-npj-1\frontend) execulta npm run dev e o servidor do banco de dados esta no conteiner (sistema-npj-db-1)  faça teste ou um debug para ver oque esta acontecendo analise o problema crie alternativas relacionadas e implemente a solução para resolver o problema logicamente e visualmente deixando funcional e perfeito.

- Arrumar formulario de criação de processos.
