require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Configuração básica de segurança
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Conexão com o banco de dados
require('./config/db');

// Rotas
app.use('/auth', require('./routes/authRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/processos', require('./routes/processoRoutes'));

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Rota não encontrada
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});