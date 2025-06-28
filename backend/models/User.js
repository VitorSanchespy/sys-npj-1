const db = require('../config/db');

module.exports = {
  findByEmail: (email, callback) => {
    db.query('SELECT * FROM usuarios WHERE email = ?', [email], callback);
  },

  create: (user, callback) => {
    db.query('INSERT INTO usuarios SET ?', user, callback);
  },
};
