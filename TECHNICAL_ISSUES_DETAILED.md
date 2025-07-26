# 🔧 PROBLEMAS TÉCNICOS ESPECÍFICOS IDENTIFICADOS

## 📁 ARQUIVOS DE CONFIGURAÇÃO

### .gitignore - CRÍTICO ❌
**Arquivo:** `.gitignore`  
**Problemas:**
- Muito básico (apenas 3 entradas)
- Faltam exclusões importantes

**Correções necessárias:**
```gitignore
# Dependencies
node_modules/
*/node_modules/

# Production builds
/dist/
/build/
frontend/dist/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Database
*.sqlite
*.sqlite3
*.db

# Uploads
uploads/*
!uploads/.gitkeep

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Testing
/coverage

# Package managers
package-lock.json
yarn.lock
pnpm-lock.yaml
```

---

## 🗄️ BACKEND - PROBLEMAS CRÍTICOS

### 1. index.js - Configuração de Segurança ⚠️
**Arquivo:** `backend/index.js`  
**Problemas:**
```javascript
// ❌ PROBLEMA: CORS muito permissivo
const corsOptions = {
  origin: 'http://localhost:5173', // Apenas localhost
  credentials: true
};

// ❌ PROBLEMA: Configuração CSP inadequada
contentSecurityPolicy: {
  directives: {
    scriptSrc: ["'self'", "'unsafe-inline'"], // unsafe-inline é perigoso
  }
}
```

**Correções:**
```javascript
// ✅ SOLUÇÃO: CORS baseado em ambiente
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
};

// ✅ SOLUÇÃO: CSP mais restritivo
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"], // Apenas para styles
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"]
  }
}
```

### 2. JWT Secret Validation ❌
**Arquivo:** `backend/middleware/authMiddleware.js`  
**Problema:** Não valida se JWT_SECRET existe

**Correção necessária:**
```javascript
// ✅ Adicionar no início do index.js
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  console.error('❌ JWT_SECRET deve ter pelo menos 32 caracteres');
  process.exit(1);
}
```

### 3. Database Configuration ⚠️
**Arquivo:** `backend/config/config.js`  
**Problemas potenciais:**
- Sem configuração de pool de conexões otimizada
- Sem timeout configurado
- Sem retry logic

**Melhorias necessárias:**
```javascript
// ✅ Configuração otimizada
pool: {
  max: 10,
  min: 0,
  acquire: 30000,
  idle: 10000
},
retry: {
  match: [/ETIMEDOUT/, /EHOSTUNREACH/, /ECONNRESET/, /ECONNREFUSED/],
  max: 3
}
```

### 4. Error Handling Global ❌
**Problema:** Não há middleware global de tratamento de erros

**Implementar:**
```javascript
// ✅ Error handler global
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: err.errors
    });
  }
  
  if (err.name === 'SequelizeConnectionError') {
    return res.status(503).json({
      error: 'Erro de conexão com banco de dados'
    });
  }
  
  res.status(500).json({
    error: 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});
```

### 5. Logging System ❌
**Problema:** Apenas morgan para HTTP logs

**Implementar:**
```javascript
// ✅ Winston logger estruturado
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});
```

---

## 🎨 FRONTEND - PROBLEMAS CRÍTICOS

### 1. package.json - Dependências ⚠️
**Arquivo:** `frontend/package.json`  
**Problemas:**
- Falta ESLint configurado adequadamente
- Sem Prettier
- Sem Husky para pre-commit hooks
- Versões desatualizadas

**Dependências que faltam:**
```json
{
  "devDependencies": {
    "eslint": "^8.x.x",
    "eslint-plugin-react": "^7.x.x",
    "eslint-plugin-react-hooks": "^4.x.x",
    "@typescript-eslint/eslint-plugin": "^6.x.x",
    "prettier": "^3.x.x",
    "husky": "^8.x.x",
    "lint-staged": "^13.x.x",
    "@testing-library/react": "^13.x.x",
    "@testing-library/jest-dom": "^5.x.x",
    "vitest": "^0.34.x"
  }
}
```

### 2. Vite Configuration ⚠️
**Arquivo:** `frontend/vite.config.js`  
**Análise:** Configuração muito básica

**Melhorias necessárias:**
```javascript
// ✅ Configuração otimizada
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@mantine/core', '@mantine/hooks']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### 3. Error Boundaries ❌
**Problema:** Não implementado

**Implementar:**
```jsx
// ✅ Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    // Enviar para serviço de monitoramento
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Algo deu errado!</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## 🗃️ BANCO DE DADOS - PROBLEMAS

### 1. Migrations sem Rollback ❌
**Arquivo:** Várias migrations
**Problema:** Nem todas têm função down()

**Exemplo de correção:**
```javascript
// ✅ Migration com rollback
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('agendamentos', {
      // ... definições
    });
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('agendamentos');
  }
};
```

### 2. Falta de Índices ⚠️
**Problema:** Poucas tabelas têm índices otimizados

**Implementar:**
```javascript
// ✅ Adicionar índices
await queryInterface.addIndex('processos', ['status', 'criado_em']);
await queryInterface.addIndex('agendamentos', ['data_evento', 'status']);
await queryInterface.addIndex('usuarios', ['email']);
```

### 3. Seeders Ausentes ❌
**Problema:** Não há dados iniciais para desenvolvimento

**Implementar:**
```javascript
// ✅ Seeder para dados iniciais
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('usuarios', [
      {
        nome: 'Admin',
        email: 'admin@npj.ufmt.edu.br',
        senha: bcrypt.hashSync('admin123', 10),
        role_id: 1,
        ativo: true
      }
    ]);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('usuarios', null, {});
  }
};
```

---

## 🧪 TESTES - PROBLEMAS CRÍTICOS

### 1. Cobertura Insuficiente ❌
**Arquivos existentes:**
- `backend/tests/api.e2e.test.js` - Básico
- `backend/tests/backend.test.js` - Incompleto  
- `backend/tests/usuario.me.e2e.test.js` - Parcial

**Testes que faltam:**
- Unit tests para todos os controllers
- Integration tests para todas as rotas
- Database tests
- Frontend component tests
- E2E tests completos

### 2. Test Environment ❌
**Problema:** Testes rodam no mesmo DB de desenvolvimento

**Implementar:**
```javascript
// ✅ Configuração de teste isolada
// config/config.js
test: {
  username: process.env.DB_TEST_USER || 'root',
  password: process.env.DB_TEST_PASS || '',
  database: process.env.DB_TEST_NAME || 'sys_npj_test',
  host: process.env.DB_TEST_HOST || 'localhost',
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
}
```

---

## 📊 MONITORAMENTO - AUSENTE ❌

### 1. Health Checks
**Implementar:**
```javascript
// ✅ Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

### 2. Metrics Collection
**Implementar:**
```javascript
// ✅ Métricas básicas
const promClient = require('prom-client');

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route']
});
```

---

## 🔒 SEGURANÇA - PROBLEMAS ADICIONAIS

### 1. Input Validation ⚠️
**Problema:** Validação inconsistente entre rotas

**Padronizar:**
```javascript
// ✅ Validação robusta
const { body, validationResult } = require('express-validator');

const validateProcess = [
  body('numero_processo')
    .matches(/^\d{7}-\d{2}\.\d{4}\.\d\.\d{2}\.\d{4}$/)
    .withMessage('Número de processo inválido'),
  body('descricao')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Descrição deve ter entre 10 e 1000 caracteres'),
];
```

### 2. SQL Injection Protection ⚠️
**Status:** Sequelize ORM protege, mas verificar raw queries

### 3. XSS Protection ⚠️
**Implementar:**
```javascript
// ✅ Sanitização de input
const xss = require('xss');

app.use((req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
});
```

---

## 📱 RESPONSIVIDADE - PROBLEMAS

### 1. Breakpoints Inconsistentes ⚠️
**Problema:** TailwindCSS usado sem padronização

**Padronizar:**
```javascript
// ✅ tailwind.config.js otimizado
module.exports = {
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        }
      }
    }
  }
}
```

### 2. Mobile Navigation ❌
**Problema:** Menu mobile não otimizado

---

# 🎯 RESUMO DE PRIORIDADES

## 🚨 CRÍTICO (Implementar AGORA)
1. **JWT Secret Validation** - Segurança crítica
2. **Global Error Handler** - Estabilidade  
3. **Gitignore completo** - Segurança de código
4. **Environment validation** - Configuração

## ⚠️ ALTO (Próxima semana)
1. **Logging estruturado** - Debugging
2. **Database indices** - Performance
3. **Error boundaries** - UX
4. **Health checks** - Monitoramento

## 📋 MÉDIO (Próximas 2 semanas)
1. **Test coverage** - Qualidade
2. **Input validation** - Segurança
3. **Database seeders** - Desenvolvimento
4. **CI/CD pipeline** - Automação

## 📈 BAIXO (Próximo mês)
1. **TypeScript migration** - Manutenibilidade
2. **Performance optimization** - UX
3. **Design system** - Consistência
4. **PWA features** - Mobile

---

*Análise técnica detalhada realizada em 26/07/2025*
