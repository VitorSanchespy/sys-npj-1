# 🚀 Endpoints - Consulta Rápida

## 🔐 **Autenticação**
```
POST   /api/auth/login              - Login
POST   /api/auth/registro           - Registro
POST   /api/auth/esqueci-senha      - Recuperar senha
POST   /api/auth/logout             - Logout
GET    /api/auth/perfil             - Perfil do usuário
GET    /api/auth/verificar-token    - Verificar token
```

## 👥 **Usuários**
```
GET    /api/usuarios                - Listar usuários
POST   /api/usuarios                - Criar usuário
GET    /api/usuarios/:id            - Obter usuário
PUT    /api/usuarios/:id            - Atualizar usuário
DELETE /api/usuarios/:id            - Deletar usuário
```

## 📋 **Processos**
```
GET    /api/processos               - Listar processos
POST   /api/processos               - Criar processo
GET    /api/processos/usuario       - Processos do usuário
GET    /api/processos/:id           - Obter processo
PUT    /api/processos/:id           - Atualizar processo
DELETE /api/processos/:id           - Deletar processo
```

## 📅 **Agendamentos**
```
GET    /api/agendamentos            - Listar agendamentos
POST   /api/agendamentos            - Criar agendamento
GET    /api/agendamentos/usuario    - Agendamentos do usuário
GET    /api/agendamentos/periodo    - Agendamentos por período
GET    /api/agendamentos/:id        - Obter agendamento
PUT    /api/agendamentos/:id        - Atualizar agendamento
DELETE /api/agendamentos/:id        - Deletar agendamento
```

## 🔔 **Notificações**
```
GET    /api/notificacoes                    - Listar notificações
POST   /api/notificacoes                    - Criar notificação
GET    /api/notificacoes/usuario            - Notificações do usuário
GET    /api/notificacoes/nao-lidas/count    - Contador não lidas
PUT    /api/notificacoes/marcar-todas-lidas - Marcar todas lidas
GET    /api/notificacoes/:id                - Obter notificação
PUT    /api/notificacoes/:id/lida           - Marcar como lida
DELETE /api/notificacoes/:id                - Deletar notificação
```

## 🔄 **Atualizações**
```
GET    /api/atualizacoes            - Listar atualizações
POST   /api/atualizacoes            - Criar atualização
GET    /api/atualizacoes/:id        - Obter atualização
PUT    /api/atualizacoes/:id        - Atualizar atualização
DELETE /api/atualizacoes/:id        - Deletar atualização
```

## 📁 **Arquivos**
```
GET    /api/arquivos                - Listar arquivos
POST   /api/arquivos/upload         - Upload arquivo
GET    /api/arquivos/:id            - Obter arquivo
GET    /api/arquivos/:id/download   - Download arquivo
DELETE /api/arquivos/:id            - Deletar arquivo
```

## 📊 **Tabelas Auxiliares**
```
GET    /api/tabelas/todas           - Todas as opções
GET    /api/tabelas/roles           - Listar roles
GET    /api/tabelas/tipos-acao      - Tipos de ação
GET    /api/tabelas/status          - Status processo
GET    /api/tabelas/prioridades     - Prioridades
GET    /api/tabelas/comarcas        - Comarcas
GET    /api/tabelas/varas           - Varas
```

---

como vou trabalhar com dados reais no banco de dados primeiro suba ele no docker dentro de um conteiner e uma imagem



## 🌐 **Base URLs**
- **Desenvolvimento**: `http://localhost:3001`
- **Total**: 49 endpoints funcionais
- **Status**: ✅ 100% operacional
