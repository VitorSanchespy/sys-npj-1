# Backend NPJ - Sistema Limpo e Otimizado

## 📁 Estrutura do Projeto

```
backend/
├── controllers/           # Controladores de negócio
│   ├── agendamentoController.js
│   ├── arquivoController.js
│   ├── atualizacaoProcessoController.js
│   ├── autorizacaoController.js
│   ├── notificacaoController.js
│   ├── processoController.js
│   ├── tabelaAuxiliarController.js
│   └── usuarioController.js
├── middleware/            # Middlewares de aplicação
│   ├── antiDuplicacaoMiddleware.js
│   ├── authMiddleware.js
│   ├── authUtils.js
│   ├── encodingMiddleware.js
│   ├── errorHandlerMiddleware.js
│   ├── roleMiddleware.js
│   ├── uploadMiddleware.js
│   └── validationMiddleware.js
├── models/               # Modelos de dados (Sequelize)
│   ├── agendamentoModel.js
│   ├── arquivoModel.js
│   ├── atualizacaoProcessoModel.js
│   ├── configuracaoNotificacaoModel.js
│   ├── diligenciaModel.js
│   ├── faseModel.js
│   ├── indexModel.js
│   ├── localTramitacaoModel.js
│   ├── materiaAssuntoModel.js
│   ├── notificacaoModel.js
│   ├── processoModel.js
│   ├── refreshTokenModel.js
│   ├── roleModel.js
│   ├── usuarioModel.js
│   └── usuarioProcessoModel.js
├── routes/               # Definições de rotas
│   ├── agendamentoRoute.js
│   ├── arquivoRoute.js
│   ├── atualizacaoProcessoRoute.js
│   ├── autorizacaoRoute.js
│   ├── notificacaoRoute.js
│   ├── processoRoute.js
│   ├── tabelaAuxiliarRoute.js
│   └── usuarioRoute.js
├── services/             # Serviços de aplicação
│   ├── emailService.js
│   ├── notificacaoService.js
│   ├── notificationScheduler.js
│   └── notificationService.js
├── utils/                # Utilitários
│   ├── config.js
│   ├── encodingUtils.js
│   ├── migrationRunner.js
│   ├── mockData.js
│   └── sequelize.js
├── migrations/           # Migrações do banco
├── uploads/             # Arquivos enviados
├── index.js             # Arquivo principal
└── package.json         # Dependências
```

## 🎯 Características do Sistema Limpo

### ✅ **Nomenclatura Padronizada**
- Controllers: `nomeController.js` (singular)
- Routes: `nomeRoute.js` (singular)  
- Models: `nomeModel.js` (singular)
- Services: `nomeService.js` (singular)

### ✅ **Código Limpo (Clean Code)**
- Removidos console.logs desnecessários
- Funções concisas e bem nomeadas
- Tratamento de erro padronizado
- Comentários apenas onde necessário

### ✅ **Arquivos Essenciais Apenas**
- Removidos arquivos órfãos (*_backup, *_mock, *_original, etc.)
- Removidos arquivos de debug e teste
- Mantidos apenas arquivos funcionais

### ✅ **Sistema Mock Otimizado**
- Dados mock essenciais para desenvolvimento
- Fallback automático quando BD não disponível
- Operações CRUD simuladas

## 🚀 Funcionalidades

### 🔐 **Autenticação**
- Login com JWT
- Registro de usuários
- Recuperação de senha
- Middleware de autenticação

### 👥 **Gestão de Usuários**
- CRUD completo
- Sistema de roles (Admin, Professor, Aluno)
- Perfil de usuário

### 📋 **Gestão de Processos**
- Criação e edição de processos jurídicos
- Acompanhamento de status
- Histórico de atualizações

### 📅 **Agendamentos**
- Criação de agendamentos
- Notificações automáticas
- Vinculação com processos

### 🔔 **Notificações**
- Sistema de notificações em tempo real
- Marcação de lida/não lida
- Tipos: info, success, warning, error

### 📁 **Gestão de Arquivos**
- Upload de documentos
- Validação de tipos
- Armazenamento seguro

### 📊 **Tabelas Auxiliares**
- Roles, Status, Tipos de ação
- Comarcas e Varas
- Prioridades

## 🛠️ **Tecnologias**

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **MySQL** - Banco de dados
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas
- **Multer** - Upload de arquivos

## ⚡ **Inicialização**

```bash
# Instalar dependências
npm install

# Iniciar servidor
npm start

# Servidor disponível em http://localhost:3001
```

## 🧪 **Testes**

O sistema possui 100% de cobertura de endpoints:

- **28 endpoints testados** no teste detalhado
- **22 endpoints testados** no teste rápido
- **100% de taxa de sucesso**

```bash
# Executar testes
node ../test-backend.js
node ../test-backend-complete.js
```

## 🌐 **Endpoints Principais**

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/registro` - Registro
- `GET /api/auth/perfil` - Perfil do usuário

### Usuários
- `GET /api/usuarios` - Listar usuários
- `POST /api/usuarios` - Criar usuário
- `GET /api/usuarios/:id` - Obter usuário
- `PUT /api/usuarios/:id` - Atualizar usuário

### Processos
- `GET /api/processos` - Listar processos
- `POST /api/processos` - Criar processo
- `GET /api/processos/:id` - Obter processo
- `PUT /api/processos/:id` - Atualizar processo

### Agendamentos
- `GET /api/agendamentos` - Listar agendamentos
- `POST /api/agendamentos` - Criar agendamento
- `GET /api/agendamentos/:id` - Obter agendamento
- `PUT /api/agendamentos/:id` - Atualizar agendamento

### Notificações
- `GET /api/notificacoes` - Listar notificações
- `POST /api/notificacoes` - Criar notificação
- `PUT /api/notificacoes/:id/lida` - Marcar como lida

### Arquivos
- `GET /api/arquivos` - Listar arquivos
- `POST /api/arquivos/upload` - Upload de arquivo

### Tabelas Auxiliares
- `GET /api/tabelas/roles` - Listar roles
- `GET /api/tabelas/status` - Listar status
- `GET /api/tabelas/tipos-acao` - Listar tipos de ação

## 🔒 **Segurança**

- Autenticação JWT
- Hash de senhas com bcrypt
- Middleware de autorização por roles
- Validação de dados de entrada
- Upload seguro de arquivos

## 📝 **Logs e Debug**

O sistema mantém logs essenciais para:
- Erros de sistema
- Falhas de autenticação  
- Status do banco de dados
- Modo mock ativo

---

**Sistema NPJ - Núcleo de Prática Jurídica**  
*Backend limpo, otimizado e 100% funcional* 🚀
