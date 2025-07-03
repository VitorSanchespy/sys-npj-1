const cors = require('cors');
const express = require('express');
const rota = require('./routes/routes');
const bodyParser = require('body-parser');
const router = require('./routes/processoRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas públicas
app.use('/auth', rota);

// Rotas protegidas
app.use('/api/processos', processoRoutes);
app.use('/api/usuarios', usuarioRoutes);
// Tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ erro: 'Ocorreu um erro no servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
