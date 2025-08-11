# 📋 CHECKLIST COMPLETO DE TESTES - SISTEMA NPJ

## 🎯 Objetivo dos Testes
Mapear e validar todos os endpoints, permissões e funcionalidades do sistema NPJ, garantindo que cada tipo de usuário (Admin, Professor, Aluno) tenha acesso apenas às funcionalidades permitidas.

---

## 🔧 PRÉ-REQUISITOS

### Serviços Necessários
- [ ] Backend rodando na porta 3001 (`npm run start` ou `./start-local.bat`)
- [ ] Frontend rodando na porta 5173 (`npm run dev` no diretório frontend)
- [ ] Banco de dados configurado e funcionando
- [ ] Usuários de teste criados:
  - [ ] Admin: admin@teste.com / 123456
  - [ ] Professor: professor@teste.com / 123456
  - [ ] Aluno: aluno@teste.com / 123456

### Dependências de Teste
- [ ] Node.js instalado
- [ ] Axios para testes de API
- [ ] Playwright para testes E2E (opcional)

---

## 📊 1. TESTES DE BACKEND (API)

### 🔐 Autenticação
- [ ] **POST /api/auth/login** - Login para todos os tipos de usuário
- [ ] **POST /api/auth/register** - Registro de novos usuários
- [ ] **POST /api/auth/refresh** - Refresh de tokens
- [ ] **POST /api/auth/logout** - Logout

### 👥 Gerenciamento de Usuários
- [ ] **GET /api/usuarios** - Listar usuários
  - [ ] ✅ Admin: Acesso total
  - [ ] ✅ Professor: Acesso limitado
  - [ ] ❌ Aluno: Sem acesso
- [ ] **GET /api/usuarios/perfil** - Perfil próprio
  - [ ] ✅ Admin: Próprio perfil
  - [ ] ✅ Professor: Próprio perfil
  - [ ] ✅ Aluno: Próprio perfil
- [ ] **POST /api/usuarios** - Criar usuário
  - [ ] ✅ Admin: Pode criar qualquer tipo
  - [ ] ⚠️ Professor: Pode criar Aluno/Professor apenas
  - [ ] ❌ Aluno: Sem permissão
- [ ] **PUT /api/usuarios/:id** - Atualizar usuário
  - [ ] ✅ Admin: Pode atualizar qualquer usuário
  - [ ] ⚠️ Professor: Limitações
  - [ ] ❌ Aluno: Apenas próprio perfil
- [ ] **DELETE /api/usuarios/:id** - Deletar usuário
  - [ ] ✅ Admin: Pode deletar
  - [ ] ❌ Professor: Sem permissão
  - [ ] ❌ Aluno: Sem permissão

### ⚖️ Processos
- [ ] **GET /api/processos** - Listar processos
  - [ ] ✅ Admin: Todos os processos
  - [ ] ✅ Professor: Todos os processos
  - [ ] ⚠️ Aluno: Apenas processos vinculados
- [ ] **GET /api/processos/usuario** - Processos do usuário
  - [ ] ✅ Admin: Seus processos
  - [ ] ✅ Professor: Seus processos
  - [ ] ✅ Aluno: Seus processos
- [ ] **POST /api/processos** - Criar processo
  - [ ] ✅ Admin: Pode criar
  - [ ] ✅ Professor: Pode criar
  - [ ] ❌ Aluno: Sem permissão
- [ ] **PUT /api/processos/:id** - Atualizar processo
  - [ ] ✅ Admin: Pode atualizar qualquer
  - [ ] ✅ Professor: Pode atualizar qualquer
  - [ ] ⚠️ Aluno: Apenas vinculados
- [ ] **DELETE /api/processos/:id** - Deletar processo
  - [ ] ✅ Admin: Pode deletar
  - [ ] ✅ Professor: Pode deletar
  - [ ] ❌ Aluno: Sem permissão
- [ ] **POST /api/processos/:id/vincular-usuario** - Vincular usuário
  - [ ] ✅ Admin: Pode vincular qualquer usuário
  - [ ] ✅ Professor: Pode vincular Aluno/Professor
  - [ ] ❌ Aluno: Sem permissão
- [ ] **DELETE /api/processos/:id/desvincular-usuario** - Desvincular usuário
  - [ ] ✅ Admin: Pode desvincular
  - [ ] ✅ Professor: Pode desvincular
  - [ ] ❌ Aluno: Sem permissão
- [ ] **PUT /api/processos/:id/concluir** - Concluir processo
  - [ ] ✅ Admin: Pode concluir
  - [ ] ✅ Professor: Pode concluir
  - [ ] ⚠️ Aluno: Apenas se vinculado

### 📅 Agendamentos
- [ ] **GET /api/agendamentos** - Listar agendamentos
  - [ ] ✅ Admin: Todos os agendamentos
  - [ ] ✅ Professor: Todos os agendamentos
  - [ ] ✅ Aluno: Todos os agendamentos
- [ ] **POST /api/agendamentos** - Criar agendamento
  - [ ] ✅ Admin: Pode criar
  - [ ] ✅ Professor: Pode criar
  - [ ] ✅ Aluno: Pode criar
- [ ] **PUT /api/agendamentos/:id** - Atualizar agendamento
  - [ ] ✅ Admin: Pode atualizar qualquer
  - [ ] ✅ Professor: Pode atualizar qualquer
  - [ ] ⚠️ Aluno: Apenas próprios
- [ ] **DELETE /api/agendamentos/:id** - Deletar agendamento
  - [ ] ✅ Admin: Pode deletar qualquer
  - [ ] ✅ Professor: Pode deletar qualquer
  - [ ] ⚠️ Aluno: Apenas próprios
- [ ] **GET /api/agendamentos/estatisticas** - Estatísticas
  - [ ] ✅ Admin: Acesso total
  - [ ] ✅ Professor: Acesso total
  - [ ] ✅ Aluno: Acesso total

### 📁 Arquivos
- [ ] **GET /api/arquivos** - Listar arquivos
  - [ ] ✅ Admin: Todos os arquivos
  - [ ] ✅ Professor: Todos os arquivos
  - [ ] ⚠️ Aluno: Apenas próprios
- [ ] **POST /api/arquivos** - Upload de arquivo
  - [ ] ✅ Admin: Pode fazer upload
  - [ ] ✅ Professor: Pode fazer upload
  - [ ] ✅ Aluno: Pode fazer upload
- [ ] **DELETE /api/arquivos/:id** - Deletar arquivo
  - [ ] ✅ Admin: Pode deletar qualquer
  - [ ] ✅ Professor: Pode deletar qualquer
  - [ ] ⚠️ Aluno: Apenas próprios
- [ ] **GET /api/arquivos/usuario/:id** - Arquivos por usuário
  - [ ] ✅ Admin: Pode ver de qualquer usuário
  - [ ] ⚠️ Professor: Limitações
  - [ ] ❌ Aluno: Sem acesso

### 🔔 Notificações
- [ ] **GET /api/notificacoes** - Listar notificações
  - [ ] ✅ Admin: Próprias notificações
  - [ ] ✅ Professor: Próprias notificações
  - [ ] ✅ Aluno: Próprias notificações
- [ ] **PUT /api/notificacoes/:id/lida** - Marcar como lida
  - [ ] ✅ Admin: Próprias notificações
  - [ ] ✅ Professor: Próprias notificações
  - [ ] ✅ Aluno: Próprias notificações
- [ ] **DELETE /api/notificacoes/:id** - Deletar notificação
  - [ ] ✅ Admin: Próprias notificações
  - [ ] ✅ Professor: Próprias notificações
  - [ ] ✅ Aluno: Próprias notificações

### 📊 Dashboard
- [ ] **GET /api/dashboard/estatisticas** - Estatísticas do dashboard
  - [ ] ✅ Admin: Dados globais
  - [ ] ✅ Professor: Dados globais
  - [ ] ⚠️ Aluno: Dados filtrados
- [ ] **GET /api/dashboard/stats** - Stats alternativo
  - [ ] ✅ Admin: Dados globais
  - [ ] ✅ Professor: Dados globais
  - [ ] ⚠️ Aluno: Dados filtrados
- [ ] **GET /api/dashboard/exportar** - Exportar relatório
  - [ ] ✅ Admin: Pode exportar
  - [ ] ✅ Professor: Pode exportar
  - [ ] ✅ Aluno: Pode exportar
- [ ] **GET /api/dashboard/status-detalhado** - Status detalhado
  - [ ] ✅ Admin: Acesso completo
  - [ ] ✅ Professor: Acesso completo
  - [ ] ⚠️ Aluno: Dados limitados

### 🗂️ Tabelas Auxiliares
- [ ] **GET /api/tabelas/roles** - Listar roles
  - [ ] ✅ Admin: Acesso total
  - [ ] ✅ Professor: Acesso total
  - [ ] ✅ Aluno: Acesso total
- [ ] **GET /api/tabelas/fases** - Listar fases
  - [ ] ✅ Admin: Acesso total
  - [ ] ✅ Professor: Acesso total
  - [ ] ✅ Aluno: Acesso total

---

## 🎭 2. TESTES DE FRONTEND (E2E)

### 🔄 Auto-Refresh Pós-CRUD
- [ ] **Agendamentos**
  - [ ] Criar agendamento → Refresh automático
  - [ ] Editar agendamento → Refresh automático
  - [ ] Deletar agendamento → Refresh automático
- [ ] **Processos**
  - [ ] Criar processo → Refresh automático
  - [ ] Editar processo → Refresh automático
  - [ ] Vincular usuário → Refresh automático
- [ ] **Arquivos**
  - [ ] Upload arquivo → Refresh automático
  - [ ] Deletar arquivo → Refresh automático
- [ ] **Usuários**
  - [ ] Criar usuário → Refresh automático
  - [ ] Editar usuário → Refresh automático

### 🔒 Permissões de Interface
- [ ] **Admin**
  - [ ] ✅ Botão "Gerenciar Usuários" visível
  - [ ] ✅ Botão "Novo Processo" visível
  - [ ] ✅ Botão "Novo Agendamento" visível
  - [ ] ✅ Acesso a todos os menus
- [ ] **Professor**
  - [ ] ✅ Botão "Novo Processo" visível
  - [ ] ✅ Botão "Novo Agendamento" visível
  - [ ] ⚠️ "Gerenciar Usuários" com limitações
- [ ] **Aluno**
  - [ ] ✅ Botão "Novo Agendamento" visível
  - [ ] ❌ Botão "Novo Processo" oculto
  - [ ] ❌ "Gerenciar Usuários" oculto

### 📱 Responsividade
- [ ] **Mobile (320px)**
  - [ ] Layout funcional
  - [ ] Navegação acessível
  - [ ] Formulários utilizáveis
- [ ] **Tablet (768px)**
  - [ ] Layout adaptado
  - [ ] Todos os elementos visíveis
- [ ] **Desktop (1920px)**
  - [ ] Layout completo
  - [ ] Aproveitamento do espaço

### 📊 Funcionalidades Específicas
- [ ] **Dashboard**
  - [ ] Estatísticas carregam corretamente
  - [ ] Gráficos são exibidos
  - [ ] Diferenciação por tipo de usuário
- [ ] **Exportação de Relatórios**
  - [ ] Botão de export funciona
  - [ ] PDF é gerado
  - [ ] Conteúdo está correto
- [ ] **Notificações**
  - [ ] Lista carrega
  - [ ] Marcar como lida funciona
  - [ ] Contadores atualizam

---

## 🚀 3. EXECUÇÃO DOS TESTES

### Scripts Disponíveis
```bash
# Executar todos os testes
node run-all-tests.js

# Apenas testes de backend
node test-endpoints-complete.js

# Apenas testes de frontend E2E
node test-frontend-e2e.js
```

### Ordem de Execução
1. **Preparar ambiente** - Verificar serviços rodando
2. **Testes de Backend** - Validar todos os endpoints
3. **Testes de Frontend** - Validar interface e funcionalidades
4. **Relatório Consolidado** - Analisar resultados

---

## 📈 4. MÉTRICAS DE QUALIDADE

### Metas de Sucesso
- [ ] Taxa de sucesso geral: **≥ 85%**
- [ ] Taxa de sucesso backend: **≥ 90%**
- [ ] Taxa de sucesso frontend: **≥ 80%**
- [ ] Permissões de segurança: **100%**

### Indicadores Críticos
- [ ] Admin não pode ter falhas de permissão
- [ ] Aluno não pode acessar dados não autorizados
- [ ] Auto-refresh funciona em todos os CRUDs
- [ ] Exportação de relatórios funciona

---

## 📁 5. ARQUIVOS GERADOS

### Relatórios
- [ ] `consolidated-test-report.json` - Relatório principal
- [ ] `test-report.json` - Relatório backend
- [ ] `frontend-test-report.json` - Relatório frontend

### Análises
- [ ] Análise de qualidade por componente
- [ ] Recomendações de melhorias
- [ ] Métricas de performance

---

## ✅ 6. VALIDAÇÃO FINAL

### Critérios de Aprovação
- [ ] Todos os testes críticos passaram
- [ ] Permissões funcionam corretamente
- [ ] Auto-refresh implementado
- [ ] Interface responsiva
- [ ] Relatórios podem ser exportados

### Ações Pós-Teste
- [ ] Corrigir falhas identificadas
- [ ] Implementar melhorias sugeridas
- [ ] Documentar problemas conhecidos
- [ ] Planejar próximos testes

---

## 🔧 COMANDOS ÚTEIS

```bash
# Iniciar backend
cd backend && npm start

# Iniciar frontend
cd frontend && npm run dev

# Instalar dependências de teste
npm install axios playwright

# Executar testes específicos
node test-endpoints-complete.js
node test-frontend-e2e.js
node run-all-tests.js

# Verificar logs
tail -f backend/logs/app.log
```

---

**📋 Este checklist garante a máxima qualidade, segurança e aderência às regras de negócio do Sistema NPJ.**
