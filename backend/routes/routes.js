const {Router} = require('express');
const users = require('../controllers/users');
//const authController = require('../controllers/authController');
const allRoles = require('../controllers/rolesController');
const rota = Router()
rota.put('/users/:id', users.updateUser)
rota.get('/users', users.allUsers)
rota.get('/roles', allRoles.listarRoles)
rota.get('/', (req, res) => {
  res.send('Backend funcionando!');
});

module.exports = rota;