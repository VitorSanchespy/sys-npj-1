# 🚀 Sistema NPJ - Configuração Local Completa

## 📋 **PRÉ-REQUISITOS**

### **🛠️ Softwares Necessários:**
- **Node.js** (versão 16 ou superior)
- **MySQL** (versão 8.0 ou superior)
- **Git** (para clone do repositório)

### **🔧 Verificar Instalações:**
```bash
node --version    # Deve mostrar v16+ 
npm --version     # Deve mostrar 8+
mysql --version   # Deve mostrar 8.0+
```

---

## 🎯 **CONFIGURAÇÃO COMPLETA**

### **1️⃣ Clonar e Configurar Projeto**

```bash
# Clone do repositório
git clone https://github.com/VitorSanchespy/sys-npj-1.git
cd sys-npj-1

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install

# Voltar para raiz
cd ..
```

### **2️⃣ Configurar Banco de Dados**

#### **Criar Database no MySQL:**
```sql
# Conectar ao MySQL
mysql -u root -p

# Criar database
CREATE DATABASE npjdatabase CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

# Verificar criação
SHOW DATABASES;

# Sair
exit;
```

#### **Executar Script Inicial:**
```bash
# Importar estrutura completa
mysql -u root -p npjdatabase < db/init.sql
```

### **3️⃣ Configurar Variáveis de Ambiente**

#### **Backend (.env):**
Criar arquivo `backend/.env`:
```env
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
```

#### **Frontend (.env):**
Criar arquivo `frontend/.env`:
```env
# API Backend
VITE_API_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:3001/api

# Desenvolvimento
VITE_NODE_ENV=development
```

### **4️⃣ Configurar Backend**

#### **Arquivo: `backend/config/config.json`**
```json
{
  "development": {
    "username": "root",
    "password": "sua_senha_aqui",
    "database": "npjdatabase",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql",
    "timezone": "-04:00",
    "define": {
      "timestamps": true,
      "underscored": false
    },
    "logging": console.log
  },
  "test": {
    "username": "root",
    "password": "sua_senha_aqui",
    "database": "npjdatabase_test",
    "host": "127.0.0.1",
    "port": 3306,
    "dialect": "mysql",
    "logging": false
  },
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "mysql",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}
```

---

## 🚀 **EXECUTAR O SISTEMA**

### **Opção 1: Manual (3 Terminais)**

#### **Terminal 1 - Banco de Dados:**
```bash
# Iniciar MySQL (se não estiver rodando)
# Windows:
net start mysql80

# Linux/Mac:
sudo service mysql start
# ou
sudo systemctl start mysql
```

#### **Terminal 2 - Backend:**
```bash
cd backend
npm start

# Deve mostrar:
# ✅ Servidor rodando na porta 3001
# 🌐 Acesse: http://localhost:3001
# ✅ Sistema com banco de dados
```

#### **Terminal 3 - Frontend:**
```bash
cd frontend  
npm run dev

# Deve mostrar:
# ➜  Local:   http://localhost:5173/
# ➜  Network: use --host to expose
```

### **Opção 2: Docker (Recomendado)**

```bash
# Construir e executar todos os serviços
docker-compose up -d

# Verificar status
docker-compose ps

# Logs em tempo real
docker-compose logs -f
```

---

## 🧪 **TESTAR O SISTEMA**

### **1. Testar Backend:**
```bash
# Teste completo dos endpoints
node test-backend.js

# Deve mostrar:
# ✅ Testes passaram: 28
# ❌ Testes falharam: 0
# 📊 Taxa de sucesso: 100.0%
```

### **2. Testar Banco:**
```bash
# Verificar estrutura do banco
node test-database-structure.js

# Deve mostrar:
# ✅ 15 tabelas criadas
# 🎉 Todas as tabelas necessárias estão presentes!
```

### **3. Testar Frontend:**
- Acesse: `http://localhost:5173`
- Faça login com:
  - **Email:** admin@teste.com
  - **Senha:** admin123

---

## 📱 **ACESSOS DO SISTEMA**

### **🌐 URLs Locais:**
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001
- **Documentação API:** http://localhost:3001/api-docs (se configurado)

### **👥 Usuários Padrão:**
```
Admin:
- Email: admin@teste.com
- Senha: admin123
- Role: Admin

Professor:
- Email: professor@teste.com  
- Senha: admin123
- Role: Professor

Aluno:
- Email: aluno@teste.com
- Senha: admin123
- Role: Aluno
```

---

## 🔧 **COMANDOS ÚTEIS**

### **Backend:**
```bash
cd backend

# Desenvolvimento
npm run dev          # Nodemon (reinicia automaticamente)
npm start           # Produção
npm test            # Executar testes

# Banco de Dados
npm run migrate     # Executar migrations
npm run seed        # Executar seeds
npm run db:reset    # Reset completo do banco
```

### **Frontend:**
```bash
cd frontend

# Desenvolvimento
npm run dev         # Servidor de desenvolvimento
npm run build       # Build para produção
npm run preview     # Preview do build
npm run lint        # Verificar código
```

### **Docker:**
```bash
# Gerenciar containers
docker-compose up -d      # Iniciar em background
docker-compose down       # Parar e remover
docker-compose restart    # Reiniciar serviços
docker-compose logs -f    # Ver logs

# Reconstruir após mudanças
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

---

## 🛠️ **SOLUÇÃO DE PROBLEMAS**

### **❌ Erro de Conexão com Banco:**
```
ER_ACCESS_DENIED_ERROR
```
**Solução:** Verificar usuário/senha no `.env` e `config.json`

### **❌ Porta em Uso:**
```
EADDRINUSE: address already in use :::3001
```
**Solução:** Matar processo ou mudar porta
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID [PID_NUMBER] /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### **❌ Banco Não Existe:**
```
ER_BAD_DB_ERROR: Unknown database 'npjdatabase'
```
**Solução:** Criar banco novamente
```sql
CREATE DATABASE npjdatabase;
```

### **❌ Módulos Não Encontrados:**
```
Module not found
```
**Solução:** Reinstalar dependências
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 **STATUS ESPERADO**

Após configuração completa, você deve ter:

### **✅ Backend (http://localhost:3001):**
- 49 endpoints funcionais
- 15 tabelas no banco
- Sistema de autenticação JWT
- Upload de arquivos
- Sistema de notificações

### **✅ Frontend (http://localhost:5173):**
- Interface React responsiva
- Autenticação completa
- Gestão de processos
- Sistema de agendamentos
- Notificações em tempo real

### **✅ Banco de Dados:**
- 15 tabelas criadas
- Dados iniciais inseridos
- Relacionamentos configurados
- Zero migrations pendentes

---

**🎉 Sistema NPJ 100% configurado e funcional localmente!** 🚀
