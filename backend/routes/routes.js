const {Router} = require('express');
const users = require('../controllers/users');
const process = require('../controllers/processes')
//const authController = require('../controllers/authController');
const allRoles = require('../controllers/rolesController');
const rota = Router()

//Rotas
rota.put('/users/:id', users.updateUser)
rota.get('/users', users.allUsers)
rota.put('/processes/:id/attribur-student', users.assignStudentProcess)
rota.put('/processes/:id/update', process.updateProcess)
rota.get('/roles', allRoles.listarRoles)
rota.get('/', (req, res) => {
  res.send('Backend funcionando!');
});

module.exports = rota;