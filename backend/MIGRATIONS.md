# Sistema de Migrations - NPJ Backend

## 📋 Visão Geral

Este sistema de migrations permite gerenciar automaticamente a estrutura do banco de dados, garantindo que todas as tabelas necessárias estejam criadas e atualizadas.

## 🚀 Como Usar

### Execução Automática
As migrations são executadas automaticamente quando o servidor é iniciado:
```bash
npm start
```

### Execução Manual
```bash
# Executar todas as migrations pendentes
npm run migrate

# Verificar tabelas faltantes sem executar migrations
npm run migrate:check

# Fazer rollback de uma migration específica
npm run migrate:rollback 20250729_01_create_notificacoes.js
```

### Usando o Docker
```bash
# Executar migrations no container
docker exec npj-backend npm run migrate

# Verificar status das tabelas
docker exec npj-backend npm run migrate:check
```

## 📁 Estrutura de Pastas

```
backend/
├── migrations/           # Arquivos de migration
│   ├── 20250729_01_create_notificacoes.js
│   ├── 20250729_02_create_configuracoes_notificacao.js
│   ├── 20250729_03_create_agendamentos.js
│   └── 20250729_04_create_refresh_tokens.js
├── models/              # Models do Sequelize (antigo db/)
├── utils/
│   └── migrationRunner.js
└── migrate.js           # Script CLI
```

## 🛠️ Migrations Disponíveis

### 1. `20250729_01_create_notificacoes.js`
- **Finalidade**: Cria tabela para sistema de notificações
- **Tabela**: `notificacoes`
- **Campos**: id, usuario_id, processo_id, agendamento_id, tipo, titulo, mensagem, canal, status, data_envio, data_leitura, tentativas, erro_detalhes, criado_em

### 2. `20250729_02_create_configuracoes_notificacao.js` 
- **Finalidade**: Configurações de notificação por usuário
- **Tabela**: `configuracoes_notificacao`
- **Campos**: id, usuario_id, email_lembretes, email_alertas, email_atualizacoes, sistema_lembretes, sistema_alertas, sistema_atualizacoes, dias_alerta_sem_atualizacao, horario_preferido_email

### 3. `20250729_03_create_agendamentos.js`
- **Finalidade**: Sistema de agendamentos e lembretes
- **Tabela**: `agendamentos`
- **Campos**: id, processo_id, usuario_id, tipo_evento, titulo, descricao, data_evento, local, status, lembrete_1_dia, lembrete_2_dias, lembrete_1_semana

### 4. `20250729_04_create_refresh_tokens.js`
- **Finalidade**: Gerenciamento de tokens JWT refresh
- **Tabela**: `refresh_tokens`
- **Campos**: id, user_id, token, expires_at, revoked, createdAt, updatedAt

## 🔍 Verificação de Tabelas

O sistema verifica automaticamente se as seguintes tabelas estão presentes:

✅ **Tabelas Principais**
- `usuarios` - Usuários do sistema
- `roles` - Perfis de usuário
- `processos` - Processos jurídicos
- `arquivos` - Arquivos anexados

✅ **Tabelas de Sistema** 
- `agendamentos` - Agendamentos e lembretes
- `notificacoes` - Sistema de notificações
- `configuracoes_notificacao` - Configurações por usuário
- `refresh_tokens` - Tokens de autenticação

✅ **Tabelas de Relacionamento**
- `atualizacoes_processo` - Histórico de atualizações
- `usuarios_processo` - Vinculação usuário-processo

✅ **Tabelas Auxiliares**
- `materia_assunto` - Matérias e assuntos jurídicos
- `fase` - Fases processuais
- `diligencia` - Tipos de diligência
- `local_tramitacao` - Locais de tramitação

## 🔧 Troubleshooting

### Erro de Conexão
```bash
❌ Erro: Access denied for user 'root'@'localhost'
```
**Solução**: Verificar variáveis de ambiente no `.env`:
```env
DB_HOST=sistema-npj-db-1
DB_USER=root
DB_PASSWORD=12345678@
DB_NAME=npjdatabase
```

### Tabelas Faltantes
```bash
⚠️ Tabelas faltantes encontradas: notificacoes, agendamentos
```
**Solução**: Executar as migrations:
```bash
npm run migrate
```

### Migration Já Executada
```bash
✅ Nenhuma migration pendente
```
Isso é normal - significa que todas as tabelas estão atualizadas.

## 🆕 Criando Novas Migrations

Para criar uma nova migration:

1. Criar arquivo em `migrations/` com formato: `YYYYMMDD_NN_descricao.js`
2. Implementar funções `up` e `down`:

```javascript
const migration = {
  up: async (connection) => {
    await connection.execute(`
      CREATE TABLE nova_tabela (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL
      )
    `);
  },

  down: async (connection) => {
    await connection.execute('DROP TABLE IF EXISTS nova_tabela');
  }
};

module.exports = migration;
```

3. Executar: `npm run migrate`

## 📊 Status do Sistema

Após a reorganização:
- ❌ Pasta `db/` → ✅ Pasta `models/` 
- ❌ Criação manual de tabelas → ✅ Sistema de migrations
- ❌ Verificação manual → ✅ Verificação automática
- ❌ Sem histórico → ✅ Controle de versão do banco
