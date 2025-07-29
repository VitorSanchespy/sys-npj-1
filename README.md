# Sistema NPJ - Simples

Sistema de gerenciamento de processos jurídicos.

## Como usar

### 1. Docker (Recomendado)
```bash
docker-compose up -d
```

### 2. Acessar
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Banco: localhost:3306

### 3. Login padrão
- Email: admin@teste.com
- Senha: admin123

## Testes
```bash
# Teste completo
node tests/organized/integration/test_massivo_docker.js

# Script de testes
node run-tests.js --all
```

## Funcionalidades
- ✅ Login/Logout
- ✅ Usuários e roles
- ✅ Processos jurídicos
- ✅ Agendamentos
- ✅ Upload de arquivos
- ✅ Dashboard

## Tecnologias
- Frontend: React + Vite
- Backend: Node.js + Express
- Banco: MySQL
- Container: Docker
