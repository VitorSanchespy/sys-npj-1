const rota = require('./routes/routes')
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());
app.use(rota);
app.listen(3001, () => console.log('Servidor rodando na porta www.localhost:3001'));
