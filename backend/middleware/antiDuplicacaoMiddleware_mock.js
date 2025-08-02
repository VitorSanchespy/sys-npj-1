/**
 * Middleware para prevenir duplicações no sistema (versão mock)
 */

// Verificar se o banco está disponível
let dbAvailable = false;
let mockData = null;

try {
  const sequelize = require('../utils/sequelize');
  sequelize.authenticate().then(() => {
    dbAvailable = true;
  }).catch(() => {
    dbAvailable = false;
    mockData = require('../utils/mockData');
  });
} catch (error) {
  mockData = require('../utils/mockData');
  dbAvailable = false;
}

if (!mockData) {
  mockData = require('../utils/mockData');
}

/**
 * Validação anti-duplicação para usuários
 */
const validarUsuarioDuplicado = async (req, res, next) => {
  try {
    const { email } = req.body;
    const { id } = req.params; // Para atualizações
    
    if (!dbAvailable) {
      // Verificação mock
      const emailExiste = mockData.usuarios.some(u => 
        u.email === email && (!id || u.id !== parseInt(id))
      );
      
      if (emailExiste) {
        return res.status(400).json({
          erro: 'Email já cadastrado',
          detalhes: 'Este endereço de email já está sendo usado por outro usuário'
        });
      }
    } else {
      // Usar banco real
      const { usuariosModels: Usuario } = require('../models/indexModels');
      const { Op } = require('sequelize');
      
      const whereClause = { email };
      if (id) {
        whereClause.id = { [Op.ne]: id };
      }
      
      const usuarioExistente = await Usuario.findOne({ where: whereClause });
      
      if (usuarioExistente) {
        return res.status(400).json({
          erro: 'Email já cadastrado',
          detalhes: 'Este endereço de email já está sendo usado por outro usuário'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro na validação anti-duplicação:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * Validação anti-duplicação para processos
 */
const validarProcessoDuplicado = async (req, res, next) => {
  try {
    const { numero_processo } = req.body;
    const { id } = req.params;
    
    if (!dbAvailable) {
      // Verificação mock
      const processoExiste = mockData.processos.some(p => 
        p.numero_processo === numero_processo && (!id || p.id !== parseInt(id))
      );
      
      if (processoExiste) {
        return res.status(400).json({
          erro: 'Número de processo já cadastrado',
          detalhes: 'Este número de processo já está sendo usado'
        });
      }
    } else {
      // Usar banco real
      const { processoModels: Processo } = require('../models/indexModels');
      const { Op } = require('sequelize');
      
      const whereClause = { numero_processo };
      if (id) {
        whereClause.id = { [Op.ne]: id };
      }
      
      const processoExistente = await Processo.findOne({ where: whereClause });
      
      if (processoExistente) {
        return res.status(400).json({
          erro: 'Número de processo já cadastrado',
          detalhes: 'Este número de processo já está sendo usado'
        });
      }
    }
    
    next();
  } catch (error) {
    console.error('❌ Erro na validação de processo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = {
  validarUsuarioDuplicado,
  validarProcessoDuplicado
};
