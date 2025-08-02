require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

module.exports = app;

// Configuração básica do CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
}));

// Middleware básico
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configurar pasta de uploads
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Verificar banco de dados
let dbAvailable = false;
try {
  const sequelize = require('./utils/sequelize');
  sequelize.authenticate().then(() => {
    dbAvailable = true;
    console.log('✅ Banco de dados conectado');
  }).catch(() => {
    dbAvailable = false;
    console.log('⚠️ Usando modo mock (sem banco)');
  });
} catch (error) {
  dbAvailable = false;
  console.log('⚠️ Usando modo mock (sem banco)');
}

// Tornar status do banco globalmente disponível
global.dbAvailable = dbAvailable;

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Sistema NPJ funcionando!', 
    timestamp: new Date().toISOString(),
    dbAvailable: global.dbAvailable || false,
    version: '1.0.0'
  });
});

// Rotas principais
app.use('/api/auth', require('./routes/autorizacaoRoute'));
app.use('/api/usuarios', require('./routes/usuarioRoute'));
app.use('/api/processos', require('./routes/processoRoute'));
app.use('/api/agendamentos', require('./routes/agendamentoRoute'));
app.use('/api/notificacoes', require('./routes/notificacaoRoute'));
app.use('/api/atualizacoes', require('./routes/atualizacaoProcessoRoute'));
app.use('/api/tabelas', require('./routes/tabelaAuxiliarRoute'));
app.use('/api/arquivos', require('./routes/arquivoRoute'));

// Rotas de compatibilidade (sem /api)
app.use('/auth', require('./routes/autorizacaoRoute'));
app.use('/processos', require('./routes/processoRoute'));
app.use('/notificacoes', require('./routes/notificacaoRoute'));

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

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada' });
});

// Inicializar servidor
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  
  app.listen(PORT, () => {
    console.log(`� Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(global.dbAvailable ? 
      '✅ Sistema com banco de dados' : 
      '⚠️ Sistema em modo mock'
    );
  });
}
