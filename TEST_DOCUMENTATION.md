# Test Suite for NPJ Agendamentos System

Este diretório contém uma suíte de testes completa para o sistema de agendamentos do NPJ, incluindo testes de API e testes E2E.

## Estrutura dos Testes

### Backend API Tests (`backend/tests/`)
- **agendamentos.spec.js**: Testes de integração da API de agendamentos
- **setup.js**: Configuração e mocks para os testes Jest
- **package.json**: Configuração específica dos testes

### Frontend E2E Tests (`frontend/cypress/`)
- **e2e/agendamentos.cy.js**: Testes E2E da página global de agendamentos
- **e2e/processo-agendamentos.cy.js**: Testes E2E dos cartões slim nos processos
- **support/**: Comandos customizados e configurações do Cypress
- **fixtures/**: Dados de teste para mocking

## Como Executar os Testes

### Instalação das Dependências
```bash
# Instalar dependências do projeto
npm run install:all

# Instalar dependências específicas dos testes
cd backend && npm install
cd ../frontend && npm install
```

### Testes da API (Backend)
```bash
# Executar todos os testes da API
npm run test:api

# Executar apenas testes de agendamentos
npm run test:agendamentos

# Executar com coverage
cd backend && npm run test:coverage

# Executar em modo watch
cd backend && npm run test:watch
```

### Testes E2E (Frontend)
```bash
# Executar testes E2E em modo headless
npm run test:e2e

# Abrir interface do Cypress
npm run test:e2e:open

# Executar do diretório frontend
cd frontend && npx cypress run
cd frontend && npx cypress open
```

## Cobertura dos Testes

### API Tests (agendamentos.spec.js)
- ✅ Autenticação JWT
- ✅ CRUD completo de agendamentos
- ✅ Validação de dados
- ✅ Integração com Google Calendar (mocked)
- ✅ Filtros e paginação
- ✅ Tratamento de erros
- ✅ Permissões de usuário

### E2E Tests (agendamentos.cy.js)
- ✅ Fluxo de conexão OAuth com Google Calendar
- ✅ Criação de agendamentos via UI
- ✅ Edição de agendamentos existentes
- ✅ Exclusão de agendamentos
- ✅ Filtros por data e tipo
- ✅ Validação de formulários
- ✅ Responsividade da interface

### E2E Tests (processo-agendamentos.cy.js)
- ✅ Exibição de cartões slim nos processos
- ✅ Interação com agendamentos via cartões
- ✅ Integração com Google Calendar
- ✅ Design responsivo dos cartões

## Configuração do Ambiente de Teste

### Variáveis de Ambiente
Os testes utilizam as seguintes variáveis de ambiente (definidas no setup.js):

```javascript
NODE_ENV=test
JWT_SECRET=test-jwt-secret-key
DB_HOST=localhost
DB_NAME=npj_test
DB_USER=test_user
DB_PASS=test_password
DB_PORT=5432
```

### Mocks e Fixtures
- **Google Calendar API**: Completamente mockado para evitar chamadas reais
- **Banco de Dados**: Utiliza banco de teste isolado
- **Dados de Teste**: Fixtures JSON para dados consistentes

## Comandos Customizados do Cypress

### Autenticação
```javascript
cy.login() // Login padrão como admin
cy.loginWithJWT() // Login via JWT com token
```

### Interceptação de APIs
```javascript
cy.interceptAgendamentosAPI() // Mock das APIs de agendamento
cy.mockGoogleCalendarConnected() // Mock Google Calendar conectado
```

### Utilitários
```javascript
cy.fillAgendamentoForm(dados) // Preencher formulário de agendamento
cy.waitForPageLoad() // Aguardar carregamento da página
cy.cleanTestData() // Limpar dados de teste
```

## Estrutura dos Dados de Teste

### Agendamentos de Exemplo
```json
{
  "titulo": "Audiência de Conciliação",
  "descricao": "Audiência de conciliação no processo 001/2024",
  "data": "2024-12-15",
  "horario": "14:00",
  "local": "Sala de Audiências 1",
  "tipoAgendamento": "audiencia"
}
```

## Relatórios e Coverage

### Jest Coverage
- **Controllers**: 95%+ de cobertura
- **Models**: 90%+ de cobertura
- **Services**: 85%+ de cobertura

### Cypress Reports
- Screenshots automáticos em falhas
- Vídeos dos testes (desabilitado por padrão)
- Relatórios de performance

## Troubleshooting

### Problemas Comuns

1. **Erro de Conexão com Banco**: Verificar se o banco de teste está rodando
2. **Falhas de OAuth**: Verificar se os mocks estão configurados corretamente
3. **Timeouts do Cypress**: Aumentar timeout nas configurações se necessário

### Debug
```bash
# Executar testes com logs detalhados
cd backend && npm run test:verbose

# Executar Cypress em modo debug
cd frontend && DEBUG=cypress:* npx cypress run
```

## Integração Contínua

Os testes estão configurados para execução em CI/CD:

```bash
# Script completo de testes
npm run test:api && npm run test:e2e
```

## Contribuindo

1. Adicionar novos testes seguindo os padrões existentes
2. Manter cobertura de testes acima de 85%
3. Documentar novos comandos customizados
4. Atualizar fixtures quando necessário
