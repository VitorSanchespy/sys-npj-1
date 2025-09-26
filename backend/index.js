// Servidor principal do sistema NPJ - configurações e inicialização
require('dotenv').config({ path: require('path').resolve(__dirname, '../env/main.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

module.exports = app;

// Configuração de CORS para permitir requisições do frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Middleware para parsing de JSON e URL encoding
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuração da pasta de uploads para arquivos
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Verificar banco de dados
// Tornar status do banco globalmente disponível
// O status será definido após autenticação abaixo

// Endpoint raiz para verificação de status da API
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema NPJ funcionando!', 
    timestamp: new Date().toISOString(),
    dbAvailable: global.dbAvailable || false,
    version: '1.0.0'
  });
});

// Configuração das rotas principais do sistema
app.use('/api/auth', require('./routes/autorizacaoRoute'));
app.use('/api/usuarios', require('./routes/usuarioRoute'));
app.use('/api/processos', require('./routes/processoRoute'));

// Sistema de Agendamentos Híbrido - Permite alternar entre monolítico e modular
app.use('/api/agendamentos', require('./routes/agendamentos'));

// Rotas para tabelas auxiliares - sistema unificado com controle de acesso
app.use('/api/tabelas-auxiliares', require('./routes/tabelasAuxiliares'));

// Rotas públicas para convites (sem autenticação)
const agendamentoController = require('./controllers/agendamentoController');
const { param, body } = require('express-validator');

app.post('/api/convite/:id/aceitar', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('email').isEmail().withMessage('Email deve ter formato válido')
], agendamentoController.aceitarConvitePublico);

app.post('/api/convite/:id/recusar', [
  param('id').isInt({ min: 1 }).withMessage('ID deve ser um número positivo'),
  body('email').isEmail().withMessage('Email deve ter formato válido')
], agendamentoController.recusarConvitePublico);

// Rotas do sistema
app.use('/api/atualizacoes', require('./routes/atualizacaoProcessoRoute'));
app.use('/api/arquivos', require('./routes/arquivoRoute'));
app.use('/api/dashboard', require('./routes/dashboardRoute'));


// Rotas de compatibilidade (sem /api)
app.use('/auth', require('./routes/autorizacaoRoute'));
app.use('/usuarios', require('./routes/usuarioRoute'));
app.use('/processos', require('./routes/processoRoute'));
app.use('/agendamentos', require('./routes/agendamentos')); // Usar rota híbrida
app.use('/arquivos', require('./routes/arquivoRoute'));
app.use('/dashboard', require('./routes/dashboardRoute'));

// Rota de status público para validação do sistema
app.get('/api/system-status', (req, res) => {
  res.json({
    api: 'funcionando',
    database: global.dbAvailable || false,
    routes: {
      auth: true,
      processos: true,
      agendamentos: true,
      individualizados: true
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

  const PORT = parseInt(process.env.PORT);
  const sequelize = require('./utils/sequelize');
  
  // Importar e inicializar o job de lembretes
  const lembreteJob = require('./jobs/lembreteJob');
  
  // Importar e inicializar os cron jobs de agendamentos
  const agendamentoCronJobs = require('./jobs/agendamentoCronJobs');
  
  sequelize.authenticate().then(() => {
    global.dbAvailable = true;
    console.log('✅ Banco de dados conectado');
    
    // Inicializar job de lembretes após conexão com o banco
    try {
      lembreteJob.iniciar();
      console.log('📧 Job de lembretes de agendamentos iniciado');
    } catch (error) {
      console.error('❌ Erro ao inicializar job de lembretes:', error.message);
    }
    
    // Inicializar cron jobs de agendamentos
    try {
      agendamentoCronJobs.start();
      console.log('⚡ Cron jobs de agendamentos iniciados');
    } catch (error) {
      console.error('❌ Erro ao inicializar cron jobs de agendamentos:', error.message);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌐 Acesse: http://localhost:${PORT}`);
      console.log('📧 Sistema de agendamentos individualizado ativo');
    });
  }).catch((err) => {
    global.dbAvailable = false;
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    console.error('🛑 O servidor não será iniciado sem banco de dados.');
    process.exit(1);
  });

// Middleware de tratamento de erros (deve vir antes das rotas 404)
const errorHandler = require('./middleware/errorHandlerMiddleware');
app.use(errorHandler);

// Rota não encontrada - deve vir por último
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Inicializar servidor
if (require.main === module) {
  // Validar variável de ambiente obrigatória
  if (!process.env.PORT) {
    console.error(' Erro: Variável de ambiente PORT é obrigatória!');
    console.error(' Configure no arquivo .env: PORT=3001');
    process.exit(1);
  }
}
