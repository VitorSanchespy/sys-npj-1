// config/db.js
require('dotenv').config();
const knex = require('knex');
const config = require('../knexfile');

// Conexão Knex para todas as operações
const db = knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  }
});

module.exports = db;