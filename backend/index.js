require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const slowDown = require('express-slow-down');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();

module.exports = app; // Exporta o app para testes

// Configuração básica de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'cdn.example.com'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'cdn.example.com']
    }
  },
  hsts: {
    maxAge: 63072000, // 2 anos em segundos
    includeSubDomains: true,
    preload: true
  }
}));

// Header adicional contra XSS
app.use((req, res, next) => {
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Configuração do CORS
app.use(cors());

// Configurar pasta de uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware para servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurar body parser (exceto para upload de arquivos)
app.use((req, res, next) => {
  // Pular express.json() apenas para a rota de upload de arquivos
  if (req.path === '/api/arquivos/upload' && req.method === 'POST') {
    return next();
  }
  express.json()(req, res, next);
});

app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message:'Muitas requisições - tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 50,
  delayMs:(used, req) => {
    const delayAfter = req.slowDown.limit;
    return (used - delayAfter) * 500;
  }
});
app.use(speedLimiter);

// Conexão com o banco de dados
require('./utils/config');

//server
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  // Inscreve o usuário em canais
  socket.on('inscrever', (data) => {
    if (data.processoId) {
      socket.join(`processo_${data.processoId}`);
    }
    if (data.usuarioId) {
      socket.join(`usuario_${data.usuarioId}`);
    }
  });

  socket.on('disconnect', () => {
    // Client disconnected
  });
});

// Inicializar serviço de notificações
const NotificacaoService = require('./services/notificacaoService');
const notificacaoService = new NotificacaoService(io);

// Configurar o serviço de notificação globalmente
global.notificacaoService = notificacaoService;

// Configurar o serviço de notificação nos controllers
const agendamentoController = require('./controllers/agendamentoControllers');
agendamentoController.setNotificacaoService(notificacaoService);

console.log('✅ Serviço de notificações inicializado');


// Rotas
console.log('🔧 Registrando rotas...');
app.use('/auth', require('./routes/autorizacaoRoutes'));
console.log('✅ /auth registrado');
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
console.log('✅ /api/usuarios registrado');
app.use('/api/processos', require('./routes/processoRoutes'));
console.log('✅ /api/processos registrado');
// Compatibilidade: rotas sem prefixo /api para processos
app.use('/processos', require('./routes/processoRoutes'));
console.log('✅ /processos registrado (compatibilidade)');
app.use('/api/agendamentos', require('./routes/agendamentoRoutes'));
console.log('✅ /api/agendamentos registrado');
app.use('/api/notificacoes', require('./routes/notificacaoRoutes'));
console.log('✅ /api/notificacoes registrado');
// Compatibilidade: rotas sem prefixo /api
app.use('/notificacoes', require('./routes/notificacaoRoutes'));
console.log('✅ /notificacoes registrado (compatibilidade)');
app.use('/api/atualizacoes', require('./routes/atualizacaoProcessoRoutes'));
console.log('✅ /api/atualizacoes registrado');
app.use('/api/aux', require('./routes/tabelaAuxiliarRoutes'));
console.log('✅ /api/aux registrado');
app.use('/api/arquivos', require('./routes/arquivoRoutes'));
console.log('✅ /api/arquivos registrado');
// Tratamento de erros
const errorHandler = require('./middleware/errorHandlerMiddleware');
app.use(errorHandler);

// Rota não encontrada (deve ser a última)
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  
  async function initializeServer() {
    try {
      // Verificar se MySQL está disponível
      const sequelize = require('./utils/sequelize');
      let dbConnected = false;
      
      try {
        await sequelize.authenticate();
        console.log('✅ Conexão com o banco estabelecida');
        dbConnected = true;
        
        // Executar migrations apenas se o banco estiver conectado
        console.log('🔄 Executando migrations...');
        const MigrationRunner = require('./utils/migrationRunner');
        const runner = new MigrationRunner();
        await runner.runMigrations();
      } catch (dbError) {
        console.log('⚠️ MySQL não está disponível. Executando em modo desenvolvimento...');
        console.log('💡 Para usar o banco completo, inicie o MySQL e reinicie o servidor.');
        dbConnected = false;
      }
      
      // Inicializar sistema de notificações mesmo sem banco
      try {
        const { inicializarCronJobs } = require('./services/notificationScheduler');
        inicializarCronJobs();
        console.log('✅ Sistema de notificações inicializado');
      } catch (notifError) {
        console.log('⚠️ Sistema de notificações não pôde ser inicializado:', notifError.message);
      }
      
      server.listen(PORT, () => {
        console.log(`🚀 Servidor rodando na porta ${PORT}`);
        console.log(dbConnected ? 
          '✅ Sistema NPJ inicializado com banco completo!' : 
          '⚠️ Sistema NPJ em modo desenvolvimento (sem banco)'
        );
        console.log(`🌐 Acesse: http://localhost:${PORT}`);
      });
    } catch (error) {
      console.error('❌ Erro ao inicializar servidor:', error);
      process.exit(1);
    }
  }
  
  initializeServer();
}