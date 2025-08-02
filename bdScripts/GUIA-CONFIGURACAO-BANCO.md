# 🎯 Guia Completo - Configuração do Banco de Dados NPJ

## 🚨 **PROBLEMA IDENTIFICADO**

Seu arquivo `db/init.sql` está **DESATUALIZADO** e não contém todas as tabelas necessárias para o funcionamento completo do sistema NPJ.

### **❌ Tabelas Faltantes:**
- `agendamentos` - Sistema de agendamentos
- `notificacoes` - Sistema de notificações  
- `configuracoes_notificacao` - Preferências do usuário
- `refresh_tokens` - Tokens JWT

### **❌ Colunas Faltantes:**
- `arquivos.nome_original` - Nome original do arquivo
- `arquivos.ativo` - Soft delete
- `atualizacoes_processo.status` - Status da atualização
- Campos `createdAt` e `updatedAt` em várias tabelas

---

## ✅ **SOLUÇÕES DISPONÍVEIS**

### **🎯 Opção 1: Banco Novo (RECOMENDADO)**

Se você quer criar um banco completamente novo:

```bash
# 1. Criar database no MySQL
mysql -u root -p
CREATE DATABASE npjdatabase;
exit

# 2. Executar script completo
node setup-database.js
```

O arquivo `db/init-complete.sql` contém:
- ✅ Todas as 15 tabelas necessárias
- ✅ Relacionamentos (Foreign Keys) corretos
- ✅ Índices para performance
- ✅ Dados iniciais (roles, diligências, etc.)
- ✅ Migrations marcadas como executadas

### **🔧 Opção 2: Atualizar Banco Existente**

Se você já tem dados no banco e quer apenas atualizar:

```bash
# Executar migration unificada
node run-migration.js
```

A migration `20250129000001_migration_unificada_npj.js`:
- ✅ Cria tabelas faltantes
- ✅ Adiciona colunas faltantes
- ✅ Preserva dados existentes
- ✅ Verifica antes de criar/alterar

### **🔄 Opção 3: Reset Completo**

Se você quer recomeçar do zero:

```bash
# 1. Apagar banco atual
mysql -u root -p
DROP DATABASE npjdatabase;
CREATE DATABASE npjdatabase;
exit

# 2. Executar script completo
node setup-database.js
```

---

## 🔧 **CONFIGURAÇÃO NECESSÁRIA**

### **1. Credenciais do MySQL**

Verifique o arquivo `backend/config/config.json`:

```json
{
  "development": {
    "username": "root",
    "password": "sua_senha",
    "database": "npjdatabase",
    "host": "127.0.0.1",
    "dialect": "mysql"
  }
}
```

### **2. Variáveis de Ambiente**

Ou use variáveis de ambiente (`.env`):

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=npjdatabase
```

---

## 🧪 **TESTANDO A CONFIGURAÇÃO**

### **1. Testar Estrutura do Banco**

```bash
node test-database-structure.js
```

Esse script verifica:
- ✅ Se todas as tabelas existem
- ✅ Se as colunas estão corretas
- ✅ Se as migrations foram executadas

### **2. Testar Backend**

```bash
# No diretório backend
cd backend
npm start

# Em outro terminal
cd ..
node test-backend.js
```

Deve mostrar:
```
✅ Testes passaram: 28
❌ Testes falharam: 0
📊 Taxa de sucesso: 100.0%
```

---

## 📋 **ESTRUTURA FINAL DO BANCO**

Após a configuração, você terá **15 tabelas**:

### **🔐 Autenticação e Usuários:**
1. `roles` - Papéis (Admin, Professor, Aluno)
2. `usuarios` - Usuários do sistema
3. `refresh_tokens` - Tokens JWT

### **📋 Processos Jurídicos:**
4. `processos` - Processos principais
5. `arquivos` - Documentos anexados
6. `atualizacoes_processo` - Histórico de mudanças
7. `usuarios_processo` - Relacionamento usuários/processos

### **📊 Dados Auxiliares:**
8. `diligencia` - Tipos de diligência
9. `fase` - Fases processuais
10. `materia_assunto` - Matérias jurídicas
11. `local_tramitacao` - Locais de tramitação

### **🆕 Novas Funcionalidades:**
12. `agendamentos` - Sistema de agendamentos
13. `notificacoes` - Sistema de notificações
14. `configuracoes_notificacao` - Preferências

### **⚙️ Sistema:**
15. `sequelizemeta` - Controle de migrations

---

## 🚀 **COMANDOS RÁPIDOS**

```bash
# Para banco novo
node setup-database.js

# Para atualizar banco existente  
node run-migration.js

# Para testar estrutura
node test-database-structure.js

# Para testar sistema completo
node test-backend.js
```

---

## 🆘 **SOLUÇÃO DE PROBLEMAS**

### **❌ Erro de Conexão**
```
ER_ACCESS_DENIED_ERROR
```
**Solução:** Verifique usuário/senha do MySQL

### **❌ Banco Não Existe**
```
ER_BAD_DB_ERROR
```
**Solução:** Crie o banco primeiro
```sql
CREATE DATABASE npjdatabase;
```

### **❌ Migration Falha**
```
Migration failed
```
**Solução:** Use o `init-complete.sql` para banco novo

### **❌ Tabelas Faltando**
```
Table 'agendamentos' doesn't exist
```
**Solução:** Execute `node run-migration.js`

---

## 🎯 **RECOMENDAÇÃO FINAL**

**Para novo desenvolvimento:** Use `node setup-database.js` com `init-complete.sql`

**Para banco existente:** Use `node run-migration.js` 

**Resultado:** Sistema NPJ 100% funcional com todas as features! 🚀
