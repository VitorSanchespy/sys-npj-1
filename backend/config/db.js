// config/db.js
require('dotenv').config();
const knex = require('knex');
const config = require('../knexfile');

// Conexão Knex para todas as operações
const db = knex(config.development);

module.exports = db;