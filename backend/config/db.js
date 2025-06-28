
const mysql = require('mysql2');
const db = mysql.createConnection({
  host: 'sistema-npj-db-1',
  user: 'appuser',
  password: 'app123',
  database: 'npjdatabase'
});
db.connect(err => {
  if (err) throw err;
  console.log('MySQL conectado.');
});
module.exports = db;
