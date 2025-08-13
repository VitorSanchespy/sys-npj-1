// Servidor principal do sistema NPJ - configurações e inicialização
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();

module.exports = app;

// Configuração de CORS para permitir requisições do frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
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
app.use('/api/agendamentos', require('./routes/agendamentoRoute'));
app.use('/api/agendamentos-local', require('./routes/agendamentoLocalRoute')); // TEMPORÁRIO PARA TESTES
// Rotas de agendamentos vinculados a processos
app.use('/api/processos/:processoId/agendamentos-processo', require('./routes/agendamentosProcesso'));
app.use('/api/agendamentos-processo', require('./routes/agendamentosProcesso'));
// Rotas globais de agendamentos
app.use('/api/agendamentos-global', require('./routes/agendamentos'));
app.use('/api/notificacoes', require('./routes/notificacaoRoute'));
app.use('/api/atualizacoes', require('./routes/atualizacaoProcessoRoute'));
app.use('/api/tabelas', require('./routes/tabelaAuxiliarRoute'));
app.use('/api/arquivos', require('./routes/arquivoRoute'));
app.use('/api/dashboard', require('./routes/dashboardRoute'));
app.use('/api/google-calendar', require('./routes/googleCalendarRoute'));

// Rotas de compatibilidade (sem /api)
app.use('/auth', require('./routes/autorizacaoRoute'));
app.use('/usuarios', require('./routes/usuarioRoute'));
app.use('/processos', require('./routes/processoRoute'));
app.use('/agendamentos', require('./routes/agendamentoRoute'));
app.use('/notificacoes', require('./routes/notificacaoRoute'));
app.use('/tabelas', require('./routes/tabelaAuxiliarRoute'));
app.use('/arquivos', require('./routes/arquivoRoute'));
app.use('/dashboard', require('./routes/dashboardRoute'));

// Rota de teste
app.get('/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando!', 
    timestamp: new Date().toISOString(),
    dbAvailable: global.dbAvailable || false
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

  const PORT = parseInt(process.env.PORT);
  const sequelize = require('./utils/sequelize');
  sequelize.authenticate().then(() => {
    global.dbAvailable = true;
    console.log('✅ Banco de dados conectado');
    app.listen(PORT, () => {
      console.log(` Servidor rodando na porta ${PORT}`);
      console.log(` Acesse: http://localhost:${PORT}`);
    });
  }).catch((err) => {
    global.dbAvailable = false;
    console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    console.error(' O servidor não será iniciado sem banco de dados.');
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
